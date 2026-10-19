import {
  useDeleteNotificationMutation,
  useGetNotificationsQuery,
  useMarkAllAsReadMutation,
  useMarkAsReadMutation,
} from "@/redux/merchantNotificationApi";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useCallback, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import tw from "../../../../lib/tailwind";
import BackButton from "../../BackButton";

/* ───────── helpers ───────── */
const formatTime = (dateString: string) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24 && date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  if (diffDay === 1 || isYesterday(date, now)) return "Yesterday";
  if (diffDay < 7) return `${diffDay}d ago`;
  return date.toLocaleDateString([], { day: "numeric", month: "short" });
};

const isYesterday = (d: Date, now: Date) => {
  const y = new Date(now);
  y.setDate(now.getDate() - 1);
  return d.toDateString() === y.toDateString();
};

const isToday = (d: Date) => d.toDateString() === new Date().toDateString();

type SectionKey = "Today" | "Yesterday" | "Earlier";

const getSection = (dateString: string): SectionKey => {
  const d = new Date(dateString);
  if (isToday(d)) return "Today";
  if (isYesterday(d, new Date())) return "Yesterday";
  return "Earlier";
};

/* ───────── skeleton ───────── */
const NotifSkeleton = () => (
  <View style={tw`px-5 pt-2`}>
    {[1, 2, 3, 4, 5, 6].map((i) => (
      <View key={i} style={tw`flex-row items-start gap-3.5 mb-5`}>
        <View style={tw`w-11 h-11 rounded-full bg-gray-200`} />
        <View style={tw`flex-1`}>
          <View style={tw`w-full h-3.5 bg-gray-200 rounded mb-2`} />
          <View style={tw`w-3/4 h-3 bg-gray-100 rounded mb-2`} />
          <View style={tw`w-16 h-2.5 bg-gray-100 rounded`} />
        </View>
      </View>
    ))}
  </View>
);

/* ───────── row ───────── */
function NotificationRow({
  item,
  onPress,
  onDelete,
}: {
  item: any;
  onPress: () => void;
  onDelete: () => void;
}) {
  const swipeRef = useRef<Swipeable>(null);
  const unread = !item.read;

  const renderRightActions = () => (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => {
        swipeRef.current?.close();
        onDelete();
      }}
      style={tw`bg-red-500 justify-center items-center w-20 mb-1 rounded-2xl ml-2`}
    >
      <Ionicons name="trash-outline" size={22} color="#fff" />
      <Text style={tw`text-white text-[10px] mt-1 font-medium`}>Delete</Text>
    </TouchableOpacity>
  );

  return (
    <Swipeable
      ref={swipeRef}
      renderRightActions={renderRightActions}
      overshootRight={false}
      friction={2}
    >
      <TouchableOpacity
        activeOpacity={0.75}
        onPress={onPress}
        style={tw`flex-row items-start gap-3.5 px-5 py-3.5 bg-white ${
          unread ? "bg-[#FAFBF5]" : ""
        }`}
      >
        {/* Icon */}
        <View
          style={tw`w-11 h-11 rounded-full items-center justify-center mt-0.5 ${
            unread ? "bg-[#E8F0D4]" : "bg-[#F4F4F6]"
          }`}
        >
          <Ionicons
            name={unread ? "notifications" : "notifications-outline"}
            size={20}
            color={unread ? "#5A7314" : "#6B7280"}
          />
          {unread && (
            <View
              style={tw`absolute top-0 right-0 w-2.5 h-2.5 rounded-full bg-[#5A7314] border-2 border-white`}
            />
          )}
        </View>

        {/* Content */}
        <View style={tw`flex-1`}>
          {item.title ? (
            <Text
              style={tw`text-sm ${
                unread
                  ? "font-semibold text-gray-900"
                  : "font-medium text-gray-700"
              }`}
              numberOfLines={1}
            >
              {item.title}
            </Text>
          ) : null}
          <Text
            style={tw`text-sm text-gray-600 leading-5 ${
              item.title ? "mt-0.5" : ""
            }`}
            numberOfLines={2}
          >
            {item.message}
          </Text>
          <Text style={tw`text-[10px] text-gray-400 mt-1.5`}>
            {formatTime(item.created_at)}
            {item.data?.order_number ? `  ·  ${item.data.order_number}` : ""}
          </Text>
        </View>
      </TouchableOpacity>
    </Swipeable>
  );
}

/* ───────── screen ───────── */
export default function Notifications() {
  const insets = useSafeAreaInsets();
  const [page, setPage] = useState(1);

  const { data, isLoading, isFetching, isError, refetch } =
    useGetNotificationsQuery({
      page,
      per_page: 15,
      filter: "all",
    });

  const [markAsRead] = useMarkAsReadMutation();
  const [markAllAsRead, { isLoading: markingAll }] = useMarkAllAsReadMutation();
  const [deleteNotification] = useDeleteNotificationMutation();

  const list: any[] = data?.data ?? [];
  const unreadCount = data?.unread_count ?? 0;
  const pagination = data?.pagination;
  const hasMore =
    pagination && pagination.current_page < pagination.total_pages;

  // group by section
  const sections = useMemo(() => {
    const groups: Record<SectionKey, any[]> = {
      Today: [],
      Yesterday: [],
      Earlier: [],
    };
    list.forEach((n) => {
      groups[getSection(n.created_at)].push(n);
    });
    return (["Today", "Yesterday", "Earlier"] as SectionKey[])
      .filter((k) => groups[k].length > 0)
      .map((title) => ({ title, data: groups[title] }));
  }, [list]);

  // flat list with section headers
  type Row =
    | { type: "header"; title: string; key: string }
    | { type: "item"; item: any; key: string };

  const flatRows: Row[] = useMemo(() => {
    const rows: Row[] = [];
    sections.forEach((sec) => {
      rows.push({ type: "header", title: sec.title, key: `h-${sec.title}` });
      sec.data.forEach((item) =>
        rows.push({ type: "item", item, key: item.id }),
      );
    });
    return rows;
  }, [sections]);

  const onPressItem = useCallback(
    async (item: any) => {
      if (!item.read) {
        try {
          await markAsRead(item.id).unwrap();
        } catch {
          // silent
        }
      }
      // navigate if order notification
      if (item.order_id) {
        router.push({
          pathname: "/order-details/[id]",
          params: { id: String(item.order_id) },
        });
      }
    },
    [markAsRead],
  );

  const onDelete = useCallback(
    async (id: string) => {
      try {
        await deleteNotification(id).unwrap();
        Toast.show({
          type: "success",
          text1: "Notification deleted",
        });
      } catch (e: any) {
        Toast.show({
          type: "error",
          text1: "Delete failed",
          text2: e?.data?.message || "Please try again",
        });
      }
    },
    [deleteNotification],
  );

  const onMarkAll = async () => {
    if (unreadCount === 0) {
      Toast.show({ type: "info", text1: "All caught up" });
      return;
    }
    try {
      await markAllAsRead({}).unwrap();
      Toast.show({
        type: "success",
        text1: "All marked as read",
      });
    } catch {
      Toast.show({ type: "error", text1: "Failed to mark all" });
    }
  };

  const loadMore = () => {
    if (hasMore && !isFetching) {
      setPage((p) => p + 1);
    }
  };

  return (
    <View style={[tw`flex-1 bg-white`, { paddingBottom: insets.bottom }]}>
      <BackButton title="Notifications" showBackButton />

      {/* Top bar: unread + mark all */}
      <View
        style={tw`px-5 py-2.5 flex-row items-center justify-between border-b border-gray-50`}
      >
        <Text style={tw`text-xs text-gray-500`}>
          {unreadCount > 0 ? `${unreadCount} unread` : "You're all caught up"}
        </Text>
        <TouchableOpacity
          onPress={onMarkAll}
          disabled={markingAll || unreadCount === 0}
          activeOpacity={0.7}
          style={tw`${unreadCount === 0 ? "opacity-40" : ""}`}
        >
          {markingAll ? (
            <ActivityIndicator size="small" color="#5A7314" />
          ) : (
            <Text style={tw`text-sm font-semibold text-[#5A7314]`}>
              Mark all as read
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <NotifSkeleton />
      ) : isError ? (
        <View style={tw`flex-1 items-center justify-center px-5`}>
          <Ionicons name="cloud-offline-outline" size={40} color="#9CA3AF" />
          <Text style={tw`text-gray-500 mt-3 mb-3`}>
            Failed to load notifications
          </Text>
          <TouchableOpacity
            onPress={() => {
              setPage(1);
              refetch();
            }}
            style={tw`bg-[#5A7314] px-5 py-2.5 rounded-full`}
          >
            <Text style={tw`text-white font-semibold text-sm`}>Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={flatRows}
          keyExtractor={(row) => row.key}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={tw`pb-10 ${
            flatRows.length === 0 ? "flex-1" : ""
          }`}
          refreshControl={
            <RefreshControl
              refreshing={isFetching && page === 1 && !isLoading}
              onRefresh={() => {
                setPage(1);
                refetch();
              }}
              colors={["#5A7314"]}
              tintColor="#5A7314"
            />
          }
          onEndReached={loadMore}
          onEndReachedThreshold={0.3}
          ListEmptyComponent={
            <View style={tw`flex-1 items-center justify-center py-24 px-5`}>
              <View
                style={tw`w-16 h-16 rounded-full bg-gray-100 items-center justify-center mb-4`}
              >
                <Ionicons
                  name="notifications-off-outline"
                  size={28}
                  color="#9CA3AF"
                />
              </View>
              <Text style={tw`text-base font-semibold text-gray-800`}>
                No notifications
              </Text>
              <Text style={tw`text-xs text-gray-400 mt-1 text-center`}>
                Order updates will show up here
              </Text>
            </View>
          }
          ListFooterComponent={
            isFetching && page > 1 ? (
              <ActivityIndicator color="#5A7314" style={tw`py-4`} />
            ) : null
          }
          renderItem={({ item: row }) => {
            if (row.type === "header") {
              return (
                <View style={tw`px-5 pt-4 pb-2`}>
                  <Text
                    style={tw`text-xs font-semibold text-gray-400 tracking-wider uppercase`}
                  >
                    {row.title}
                  </Text>
                </View>
              );
            }
            return (
              <NotificationRow
                item={row.item}
                onPress={() => onPressItem(row.item)}
                onDelete={() => onDelete(row.item.id)}
              />
            );
          }}
        />
      )}
    </View>
  );
}

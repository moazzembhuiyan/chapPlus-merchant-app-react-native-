import { useGetHotelMerchantBookingQuery } from "@/redux/hotelmerchantBookingApi";
import { Feather, FontAwesome5, Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import BackButton from "../../../components/ui/BackButton";
import tw from "../../../lib/tailwind";

const TABS = [
  { key: "all", label: "All" },
  { key: "pending_payment", label: "Pending" },
  { key: "paid", label: "Paid" },
  { key: "checked_in", label: "Checked In" },
  { key: "completed", label: "Completed" },
  { key: "cancelled", label: "Cancelled" },
  { key: "failed", label: "Failed" },
];

const formatDate = (dateString?: string) => {
  if (!dateString) return "—";
  const d = new Date(dateString);
  return d.toLocaleDateString([], {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const formatStatus = (status: string) => {
  const map: Record<string, string> = {
    pending_payment: "Pending Payment",
    paid: "Paid",
    checked_in: "Checked In",
    completed: "Completed",
    cancelled: "Cancelled",
    canceled: "Canceled",
    failed: "Failed",
  };
  return map[status] || status?.replace(/_/g, " ") || "Unknown";
};

const getStatusBadgeStyle = (status: string) => {
  switch (status) {
    case "checked_in":
    case "paid":
      return { bg: "bg-orange-50", text: "text-amber-600" };
    case "completed":
      return { bg: "bg-emerald-50", text: "text-emerald-600" };
    case "cancelled":
    case "canceled":
    case "failed":
      return { bg: "bg-rose-50", text: "text-rose-500" };
    case "pending_payment":
      return { bg: "bg-gray-100", text: "text-gray-600" };
    default:
      return { bg: "bg-gray-100", text: "text-gray-600" };
  }
};

/* ───── Skeleton ───── */
const BookingCardSkeleton = () => (
  <View
    style={tw`bg-white rounded-3xl border border-[#F0F0F0] overflow-hidden mb-5`}
  >
    <View style={tw`h-44 w-full bg-gray-200`} />
    <View style={tw`p-4`}>
      <View style={tw`flex-row justify-between mb-3`}>
        <View style={tw`w-32 h-4 bg-gray-200 rounded`} />
        <View style={tw`w-20 h-3 bg-gray-100 rounded`} />
      </View>
      <View style={tw`h-[3px] bg-gray-100 mb-3`} />
      <View style={tw`flex-row justify-between mb-3`}>
        <View>
          <View style={tw`w-12 h-2 bg-gray-100 rounded mb-1.5`} />
          <View style={tw`w-20 h-3 bg-gray-200 rounded`} />
        </View>
        <View style={tw`items-end`}>
          <View style={tw`w-14 h-2 bg-gray-100 rounded mb-1.5`} />
          <View style={tw`w-20 h-3 bg-gray-200 rounded`} />
        </View>
      </View>
      <View style={tw`flex-row justify-between pt-2`}>
        <View style={tw`w-16 h-3 bg-gray-100 rounded`} />
        <View style={tw`w-16 h-3 bg-gray-100 rounded`} />
      </View>
    </View>
  </View>
);

export default function Booking() {
  const [activeTab, setActiveTab] = useState("all");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const queryParams = useMemo(
    () => ({
      page,
      per_page: 10,
      status: activeTab === "all" ? undefined : activeTab,
      search: search || undefined,
    }),
    [page, activeTab, search],
  );

  const { data, isLoading, isFetching, isError, refetch } =
    useGetHotelMerchantBookingQuery(queryParams);

  const bookings = data?.data?.bookings?.data ?? [];
  const pagination = data?.data?.bookings;
  const total = pagination?.total ?? 0;
  const hasMore =
    pagination && pagination.current_page < pagination.last_page;

  const onTabChange = (key: string) => {
    setActiveTab(key);
    setPage(1);
  };

  const handleSearch = () => {
    setSearch(searchInput.trim());
    setPage(1);
  };

  const clearSearch = () => {
    setSearchInput("");
    setSearch("");
    setPage(1);
  };

  const loadMore = () => {
    if (hasMore && !isFetching) {
      setPage((p) => p + 1);
    }
  };

  const renderCard = ({ item }: { item: any }) => {
    const badge = getStatusBadgeStyle(item.status);
    const hotelName = item.hotel?.name || "Hotel";
    const guestName = item.user?.name || "Guest";

    const imageUri =
      item.hotel?.image_url ||
      item.hotel?.primary_image ||
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=800";

    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() =>
          router.push({
            pathname: "/booking-details/[id]" as any,
            params: { id: String(item.id) },
          })
        }
        style={tw`bg-white rounded-3xl border border-[#F0F0F0] shadow-sm overflow-hidden mb-5`}
      >
        <View style={tw`h-44 w-full bg-gray-100 relative`}>
          <Image
            source={{ uri: imageUri }}
            style={tw`w-full h-full`}
            resizeMode="cover"
          />
          <View
            style={tw`absolute top-3 right-3 px-3 py-1 rounded-full ${badge.bg}`}
          >
            <Text style={tw`text-[11px] font-bold ${badge.text}`}>
              {formatStatus(item.status)}
            </Text>
          </View>
        </View>

        <View style={tw`p-4`}>
          <View
            style={tw`flex-row items-center justify-between pb-2.5 border-b-[3px] border-gray-100`}
          >
            <Text
              style={tw`text-sm font-semibold text-gray-900 flex-1 pr-2`}
              numberOfLines={1}
            >
              {hotelName}
            </Text>
            <Text style={tw`text-xs text-gray-500`} numberOfLines={1}>
              {guestName}
            </Text>
          </View>

          <View
            style={tw`flex-row items-center justify-between py-2.5 border-b-[3px] border-[#F0F0F0]`}
          >
            <View>
              <Text
                style={tw`text-[10px] text-[#AAAAAA] tracking-wider mb-1 uppercase`}
              >
                CHECK-IN
              </Text>
              <Text style={tw`text-xs font-semibold text-gray-900`}>
                {formatDate(item.check_in_date)}
              </Text>
            </View>

            <View style={tw`flex-row items-center px-2`}>
              <View style={tw`w-5 h-[1px] bg-gray-200`} />
              <Feather
                name="arrow-right"
                size={12}
                color="#486006"
                style={tw`mx-1`}
              />
              <View style={tw`w-5 h-[1px] bg-gray-200`} />
            </View>

            <View style={tw`items-end`}>
              <Text
                style={tw`text-[10px] text-[#AAAAAA] tracking-wider mb-1 uppercase`}
              >
                CHECK-OUT
              </Text>
              <Text style={tw`text-xs font-semibold text-gray-900`}>
                {formatDate(item.check_out_date)}
              </Text>
            </View>
          </View>

          <View style={tw`flex-row items-center justify-between pt-3`}>
            <View style={tw`flex-row items-center gap-x-1.5`}>
              <View
                style={tw`w-6 h-6 rounded-full bg-[#EFF1E7] items-center justify-center`}
              >
                <FontAwesome5 name="door-open" size={9} color="#658210" />
              </View>
              <Text style={tw`text-xs font-medium text-gray-600`}>
                {item.rooms_booked}{" "}
                {item.rooms_booked > 1 ? "Rooms" : "Room"}
              </Text>
            </View>

            <Text style={tw`text-xs font-bold text-[#5A7314]`}>
              KES {Number(item.total_price || 0).toLocaleString()}
            </Text>

            <View style={tw`flex-row items-center gap-x-1.5`}>
              <View
                style={tw`w-6 h-6 rounded-full bg-[#EFF1E7] items-center justify-center`}
              >
                <FontAwesome5 name="user" size={10} color="#658210" />
              </View>
              <Text style={tw`text-xs font-medium text-gray-600`}>
                {item.hotel?.max_guests
                  ? `${item.hotel.max_guests} max`
                  : "—"}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={tw`flex-1 bg-white`}>
      <BackButton title="Bookings" showBackButton={false} />

      {/* Search */}
      <View style={tw`px-5 mt-2 mb-3`}>
        <View
          style={tw`flex-row items-center bg-[#F7F7F7] border border-[#EEEEEE] rounded-full px-4 h-11`}
        >
          <Ionicons name="search" size={16} color="#9CA3AF" style={tw`mr-2`} />
          <TextInput
            style={tw`flex-1 text-sm text-gray-800 py-0`}
            placeholder="Search guest, hotel..."
            placeholderTextColor="#A0A0A0"
            value={searchInput}
            onChangeText={setSearchInput}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
            autoCapitalize="none"
          />
          {searchInput.length > 0 && (
            <TouchableOpacity onPress={clearSearch} hitSlop={8} style={tw`mr-2`}>
              <Text style={tw`text-gray-400 text-sm`}>✕</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={handleSearch} hitSlop={8}>
            <Text style={tw`text-[#5A7314] font-semibold text-sm`}>Search</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Status tabs */}
      <View style={tw`mb-3`}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={tw`px-5 gap-x-2`}
        >
          {TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                activeOpacity={0.75}
                onPress={() => onTabChange(tab.key)}
                style={tw`px-3.5 py-2 rounded-full ${
                  isActive
                    ? "bg-[#FEF0E8]"
                    : "bg-white border border-[#EDF1F3]"
                }`}
              >
                <Text
                  style={tw`text-[11px] ${
                    isActive
                      ? "text-[#F86B17] font-semibold"
                      : "text-[#505050]"
                  }`}
                >
                  {tab.label}
                  {tab.key === "all" && total > 0 ? ` (${total})` : ""}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* List */}
      {isLoading ? (
        <View style={tw`px-5`}>
          <BookingCardSkeleton />
          <BookingCardSkeleton />
          <BookingCardSkeleton />
        </View>
      ) : isError ? (
        <View style={tw`flex-1 items-center justify-center px-5`}>
          <Text style={tw`text-gray-500 mb-3`}>Failed to load bookings</Text>
          <TouchableOpacity
            onPress={() => {
              setPage(1);
              refetch();
            }}
            style={tw`bg-[#5A7314] px-5 py-2.5 rounded-full`}
          >
            <Text style={tw`text-white font-semibold`}>Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={bookings}
          keyExtractor={(item: any) => String(item.id)}
          contentContainerStyle={tw`px-5 pb-10 ${
            bookings.length === 0 ? "flex-1" : ""
          }`}
          showsVerticalScrollIndicator={false}
          renderItem={renderCard}
          onEndReached={loadMore}
          onEndReachedThreshold={0.35}
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
          ListEmptyComponent={
            <View style={tw`py-20 items-center`}>
              <Ionicons name="bed-outline" size={40} color="#D1D5DB" />
              <Text style={tw`text-gray-500 text-sm font-medium mt-3`}>
                No bookings found
              </Text>
              <Text style={tw`text-gray-400 text-xs mt-1`}>
                Try another filter or search
              </Text>
            </View>
          }
          ListFooterComponent={
            isFetching && page > 1 ? (
              <ActivityIndicator color="#5A7314" style={tw`py-4`} />
            ) : null
          }
        />
      )}
    </View>
  );
}
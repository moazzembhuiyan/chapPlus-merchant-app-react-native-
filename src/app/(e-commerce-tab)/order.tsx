import { useGetOrdersQuery } from "@/redux/orderApi";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import {
  FlatList,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import BackButton from "../../../components/ui/BackButton";
import {
  OrderCard,
  OrderItemProps,
} from "../../../components/ui/e-commerce/order-card/OrderCard";
import FadeTabScreen from "../../../components/ui/FadeTabScreen";
import tw from "../../../lib/tailwind";

const TABS = [
  { id: "all", label: "All" },
  { id: "paid", label: "Paid" },
  { id: "processing", label: "Processing" },
  { id: "ready_for_pickup", label: "Ready" },
  { id: "on_the_way", label: "On the way" },
  { id: "delivered", label: "Delivered" },
  { id: "cancelled", label: "Cancelled" },
  { id: "failed", label: "Failed" },
];

const formatPrice = (amount: number, currency = "KES") =>
  `${currency} ${Number(amount).toLocaleString()}`;

const formatDate = (dateString: string) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const now = new Date();
  if (date.toDateString() === now.toDateString()) {
    return `Today, ${date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  }
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
  return date.toLocaleDateString([], {
    day: "numeric",
    month: "short",
  });
};

const formatStatus = (status: string) => {
  const map: Record<string, string> = {
    pending_payment: "Pending Payment",
    paid: "Paid",
    processing: "Processing",
    ready_for_pickup: "Ready for Pickup",
    on_the_way: "On the way",
    delivered: "Delivered",
    cancelled: "Cancelled",
    failed: "Failed",
  };
  return map[status] || status?.replace(/_/g, " ") || "Unknown";
};

/* ───────── Skeleton ───────── */
const OrderCardSkeleton = () => (
  <View style={tw`bg-white border border-[#F0F0F0] rounded-2xl p-3 mb-3`}>
    <View style={tw`w-24 h-3 bg-gray-200 rounded mb-3`} />
    <View style={tw`h-[1px] bg-gray-100 mb-3`} />
    <View style={tw`flex-row items-center`}>
      <View style={tw`w-16 h-16 bg-gray-200 rounded-xl mr-3`} />
      <View style={tw`flex-1`}>
        <View style={tw`w-32 h-3.5 bg-gray-200 rounded mb-2`} />
        <View style={tw`w-28 h-2.5 bg-gray-100 rounded mb-2`} />
        <View style={tw`w-16 h-3 bg-gray-200 rounded`} />
      </View>
      <View style={tw`w-16 h-6 bg-gray-100 rounded-full`} />
    </View>
  </View>
);

const FilterSkeleton = () => (
  <View style={tw`flex-row px-5 gap-2`}>
    {[1, 2, 3, 4, 5].map((i) => (
      <View key={i} style={tw`w-20 h-8 bg-gray-200 rounded-full`} />
    ))}
  </View>
);

export default function Order() {
  const insets = useSafeAreaInsets();
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const queryParams = useMemo(
    () => ({
      status: selectedFilter === "all" ? undefined : selectedFilter,
      search: search || undefined,
      per_page: 20,
    }),
    [selectedFilter, search],
  );

  const { data, isLoading, isFetching, isError, refetch } =
    useGetOrdersQuery(queryParams);

  const ordersRaw = data?.data?.orders?.data ?? [];
  const total = data?.data?.orders?.total ?? 0;

  const orders: (OrderItemProps & { id: number })[] = ordersRaw.map(
    (item: any) => ({
      id: item.id,
      orderId: item.order_number,
      title: item.items?.[0]?.name || "Product",
      itemCount: `${String(
        item.items_count || item.items?.length || 1,
      ).padStart(2, "0")} Item${(item.items_count || 1) > 1 ? "s" : ""}`,
      time: formatDate(item.created_at),
      price: formatPrice(item.total_amount, item.currency),
      status: formatStatus(item.status),
      image: item.items?.[0]?.image
        ? { uri: item.items[0].image }
        : require("../../../assets/order/order.png"),
    }),
  );

  const handleSearch = () => setSearch(searchInput.trim());

  const clearSearch = () => {
    setSearchInput("");
    setSearch("");
  };

  return (
    <FadeTabScreen>
      <View style={[tw`flex-1 bg-white`, { paddingBottom: insets.bottom }]}>
        <BackButton title="Orders" showBackButton={false} showAddIcon={false} />

        {/* ── Search ── */}
        <View style={tw`px-5 mt-1 mb-3`}>
          <View
            style={tw`flex-row items-center bg-[#F7F7F7] border border-[#EEEEEE] rounded-full px-4 h-11 mt-3`}
          >
            <Text style={tw`text-gray-400 text-base mr-2`}>🔍</Text>
            <TextInput
              style={tw`flex-1 text-sm text-gray-800 py-0`}
              placeholder="Search by order no..."
              placeholderTextColor="#A0A0A0"
              value={searchInput}
              onChangeText={setSearchInput}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
              autoCapitalize="none"
              autoCorrect={false}
            />
            {searchInput.length > 0 && (
              <TouchableOpacity
                onPress={clearSearch}
                hitSlop={8}
                style={tw`mr-2`}
              >
                <Text style={tw`text-gray-400 text-sm`}>✕</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={handleSearch} hitSlop={8}>
              <Text style={tw`text-[#5A7314] font-semibold text-sm`}>
                Search
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Filter Tabs ── */}
        <View style={tw`mb-3`}>
          {isLoading ? (
            <FilterSkeleton />
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={tw`px-5 gap-2`}
            >
              {TABS.map((tab) => {
                const isActive = tab.id === selectedFilter;
                return (
                  <TouchableOpacity
                    key={tab.id}
                    onPress={() => setSelectedFilter(tab.id)}
                    activeOpacity={0.75}
                    style={tw`px-3.5 py-2 rounded-full ${
                      isActive
                        ? "bg-[#FEF0E8]"
                        : "bg-white border border-[#E8E8E8]"
                    }`}
                  >
                    <Text
                      style={tw`text-xs ${
                        isActive
                          ? "text-[#E8752F] font-semibold"
                          : "text-[#606060]"
                      }`}
                    >
                      {tab.label}
                      {isActive && total > 0 ? ` (${total})` : ""}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}
        </View>

        {/* ── List ── */}
        {isLoading ? (
          <View style={tw`px-5`}>
            <OrderCardSkeleton />
            <OrderCardSkeleton />
            <OrderCardSkeleton />
            <OrderCardSkeleton />
            <OrderCardSkeleton />
          </View>
        ) : isError ? (
          <View style={tw`flex-1 items-center justify-center px-5`}>
            <Text style={tw`text-gray-500 text-sm mb-3`}>
              Failed to load orders
            </Text>
            <TouchableOpacity
              onPress={() => refetch()}
              style={tw`bg-[#5A7314] px-6 py-2.5 rounded-full`}
            >
              <Text style={tw`text-white font-semibold text-sm`}>
                Try Again
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={orders}
            keyExtractor={(item) => String(item.id)}
            contentContainerStyle={tw`px-5 pb-10`}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={isFetching && !isLoading}
                onRefresh={refetch}
                colors={["#5A7314"]}
                tintColor="#5A7314"
              />
            }
            ListEmptyComponent={
              <View style={tw`py-20 items-center`}>
                <Text style={tw`text-4xl mb-3`}>📋</Text>
                <Text style={tw`text-gray-500 text-sm font-medium`}>
                  No orders found
                </Text>
                <Text style={tw`text-gray-400 text-xs mt-1`}>
                  Try changing filters or search
                </Text>
              </View>
            }
            renderItem={({ item }) => (
              <OrderCard
                orderId={item.orderId}
                title={item.title}
                itemCount={item.itemCount}
                time={item.time}
                price={item.price}
                status={item.status}
                image={item.image}
                onPress={() =>
                  router.push({
                    pathname: "/order-details/[id]",
                    params: { id: String(item.id), type: "ecommerce" },
                  })
                }
              />
            )}
          />
        )}
      </View>
    </FadeTabScreen>
  );
}

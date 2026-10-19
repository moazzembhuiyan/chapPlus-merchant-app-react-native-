import { useGetMerchantDashboardQuery } from "@/redux/merchantDashboardApi";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
  ActivityIndicator,
  Image,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { SvgXml } from "react-native-svg";
import {
  OrderCard,
  OrderItemProps,
} from "../../../components/ui/e-commerce/order-card/OrderCard";
import FadeTabScreen from "../../../components/ui/FadeTabScreen";
import { SectionHeader } from "../../../components/ui/SectionHeader";
import TotalSalesCard from "../../../components/ui/user/home/TotalSalesCard";
import { notificationIcon } from "../../../lib/icon";
import tw from "../../../lib/tailwind";

// ---------- Helpers ----------
const formatPrice = (amount: number) => {
  return `$${amount?.toFixed(2) ?? "0.00"}`;
};

const formatDate = (dateString: string) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();

  if (isToday) {
    return `Today, ${date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  }

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) {
    return "Yesterday";
  }

  return date.toLocaleDateString([], {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const formatStatus = (status: string) => {
  const map: Record<string, string> = {
    pending_payment: "Pending Payment",
    processing: "Processing",
    on_the_way: "On the way",
    delivered: "Delivered",
    cancelled: "Cancelled",
    failed: "Failed",
    completed: "Completed",
  };
  return map[status] || status?.replace(/_/g, " ") || "Unknown";
};

// ---------- Skeleton Components ----------
const StatSkeleton = () => (
  <View
    style={tw`flex-1 border border-[#F3F3F3] py-3 px-2 rounded-[12px] items-center justify-center bg-white`}
  >
    <View style={tw`w-12 h-3 bg-gray-200 rounded mb-2`} />
    <View style={tw`w-8 h-5 bg-gray-200 rounded`} />
  </View>
);

const OrderCardSkeleton = () => (
  <View
    style={tw`flex-row items-center border border-[#F3F3F3] rounded-2xl p-3 mb-3 bg-white`}
  >
    <View style={tw`w-16 h-16 bg-gray-200 rounded-xl`} />
    <View style={tw`flex-1 ml-3`}>
      <View style={tw`w-24 h-3 bg-gray-200 rounded mb-2`} />
      <View style={tw`w-32 h-4 bg-gray-200 rounded mb-2`} />
      <View style={tw`w-20 h-3 bg-gray-200 rounded`} />
    </View>
    <View style={tw`items-end`}>
      <View style={tw`w-14 h-4 bg-gray-200 rounded mb-2`} />
      <View style={tw`w-16 h-5 bg-gray-200 rounded-full`} />
    </View>
  </View>
);

const HomeScreen = () => {
  const {
    data: dashboardData,
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useGetMerchantDashboardQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  const sales = dashboardData?.data?.sales;
  const stats = dashboardData?.data?.stats;
  const recentActivity = dashboardData?.data?.recent_activity ?? [];

  // Map API recent_activity → OrderCard props
  const orders: OrderItemProps[] = recentActivity.map((item: any) => ({
    orderId: item.order_number,
    title: item.product_name || "Product",
    itemCount: `${String(item.items_count).padStart(2, "0")} Item${
      item.items_count > 1 ? "s" : ""
    }`,
    time: formatDate(item.created_at),
    price: formatPrice(item.total_amount),
    status: formatStatus(item.status),
    image: item.product_image
      ? { uri: item.product_image }
      : require("../../../assets/order/order.png"),
  }));

  return (
    <SafeAreaView style={tw`flex-1 bg-white`}>
      <>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={tw`pb-8`}
          // Pull to refresh
          refreshControl={
            <RefreshControl
              refreshing={isFetching && !isLoading}
              onRefresh={refetch}
              colors={["#5A7314"]}
              tintColor="#5A7314"
            />
          }
        >
          <FadeTabScreen>
            {/* Top Header Bar */}
            <View style={tw`px-5 flex-row items-center justify-between`}>
              <View style={tw`flex-row items-center gap-x-3`}>
                <Image
                  style={tw`w-48 h-9`}
                  source={require("../../../assets/logo/logo.png")}
                  resizeMode="cover"
                />
              </View>

              <TouchableOpacity
                onPress={() => router.push("/user-notification")}
                activeOpacity={0.7}
                style={tw`relative w-12 h-12 bg-[#F4F4F4] rounded-full items-center justify-center`}
              >
                <SvgXml xml={notificationIcon} width={20} height={20} />
                <View
                  style={tw`absolute top-2 right-2 bg-red-500 min-w-[16px] h-[16px] rounded-full items-center justify-center px-1 border-2 border-white`}
                >
                  <Text
                    style={tw`text-white text-[9px] font-bold leading-none`}
                  >
                    3
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </FadeTabScreen>

          <StatusBar style="dark" />

          {/* Total Sales Banner */}
          <View style={tw`mt-6`}>
            {isLoading ? (
              <View
                style={tw`mx-5 h-28 bg-gray-100 rounded-2xl items-center justify-center`}
              >
                <ActivityIndicator color="#5A7314" />
              </View>
            ) : (
              <TotalSalesCard
                total={sales?.total ?? 0}
                growthPercentage={sales?.growth_percentage ?? 0}
                isPositive={sales?.is_positive ?? false}
              />
            )}
          </View>
          <FadeTabScreen>
            {/* Quick Stats Grid */}
            <View style={tw`px-5 mt-5 flex-row justify-between gap-x-2.5`}>
              {isLoading ? (
                <>
                  <StatSkeleton />
                  <StatSkeleton />
                  <StatSkeleton />
                </>
              ) : (
                <>
                  <View
                    style={tw`flex-1 border border-[#F3F3F3] py-3 px-2 rounded-[12px] items-center justify-center bg-white`}
                  >
                    <Text
                      style={tw`text-[10px] font-medium mb-1 text-center text-gray-500`}
                      numberOfLines={1}
                    >
                      Orders
                    </Text>
                    <Text
                      style={tw`text-oliveText text-lg font-bold text-center`}
                    >
                      {stats?.orders ?? 0}
                    </Text>
                  </View>

                  <View
                    style={tw`flex-1 border border-[#F3F3F3] py-3 px-2 rounded-[12px] items-center justify-center bg-white`}
                  >
                    <Text
                      style={tw`text-[10px] font-medium mb-1 text-center text-gray-500`}
                      numberOfLines={1}
                    >
                      Products
                    </Text>
                    <Text
                      style={tw`text-oliveText text-lg font-bold text-center`}
                    >
                      {stats?.products ?? 0}
                    </Text>
                  </View>

                  <View
                    style={tw`flex-1 border border-[#F3F3F3] py-3 px-2 rounded-[12px] items-center justify-center bg-white`}
                  >
                    <Text
                      style={tw`text-[10px] font-medium mb-1 text-center text-gray-500`}
                      numberOfLines={1}
                    >
                      Customers
                    </Text>
                    <Text
                      style={tw`text-oliveText text-lg font-bold text-center`}
                    >
                      {stats?.customers ?? 0}
                    </Text>
                  </View>
                </>
              )}
            </View>
          </FadeTabScreen>

          {/* Recent Orders Section */}
          <View style={tw`mt-6 mb-2`}>
            <SectionHeader
              title="Recent Orders"
              onViewAll={() => router.push("/order")}
            />
          </View>
          <FadeTabScreen>
            {/* Order Cards List */}
            <View style={tw`px-5`}>
              {isLoading ? (
                <>
                  <OrderCardSkeleton />
                  <OrderCardSkeleton />
                  <OrderCardSkeleton />
                </>
              ) : isError ? (
                <View style={tw`py-10 items-center`}>
                  <Text style={tw`text-gray-500 text-sm mb-3`}>
                    Failed to load dashboard
                  </Text>
                  <TouchableOpacity
                    onPress={() => refetch()}
                    style={tw`bg-[#5A7314] px-5 py-2.5 rounded-full`}
                  >
                    <Text style={tw`text-white font-semibold text-sm`}>
                      Try Again
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : orders.length === 0 ? (
                <View style={tw`py-10 items-center`}>
                  <Text style={tw`text-gray-400 text-sm`}>
                    No recent orders yet
                  </Text>
                </View>
              ) : (
                orders.map((order) => (
                  <OrderCard
                    key={order.orderId}
                    orderId={order.orderId}
                    title={order.title}
                    itemCount={order.itemCount}
                    time={order.time}
                    price={order.price}
                    status={order.status}
                    image={order.image}
                  />
                ))
              )}
            </View>
          </FadeTabScreen>
        </ScrollView>
      </>
    </SafeAreaView>
  );
};

export default HomeScreen;

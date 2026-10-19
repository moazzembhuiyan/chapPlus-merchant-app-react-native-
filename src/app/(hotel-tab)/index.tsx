
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
import HotelCard from "../../../components/ui/hotel/HotelCard";
import { SectionHeader } from "../../../components/ui/SectionHeader";
import {
  bookIcon,
  hotel,
  man,
  notificationIcon,
  revenuIcon,
} from "../../../lib/icon";
import tw from "../../../lib/tailwind";
import { useGetHotelMerchantDashboardQuery } from "@/redux/hotelmerChantDashboardApi";

const formatMoney = (amount: number | string) => {
  const n = Number(amount) || 0;
  return `KES ${n.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
};

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
    failed: "Failed",
  };
  return map[status] || status?.replace(/_/g, " ") || "—";
};

/* ───── Skeleton ───── */
const StatCardSkeleton = () => (
  <View
    style={tw`w-[49%] border border-[#EEEEEE] rounded-[12px] py-3 px-3 bg-[#FCFCFC]`}
  >
    <View style={tw`w-8 h-8 rounded-full bg-gray-200`} />
    <View style={tw`mt-2 w-16 h-5 bg-gray-200 rounded`} />
    <View style={tw`mt-1 w-20 h-2.5 bg-gray-100 rounded`} />
  </View>
);

const BookingSkeleton = () => (
  <View
    style={tw`bg-white rounded-3xl border border-[#F0F0F0] overflow-hidden mb-4`}
  >
    <View style={tw`h-36 w-full bg-gray-200`} />
    <View style={tw`p-3`}>
      <View style={tw`w-36 h-4 bg-gray-200 rounded mb-2`} />
      <View style={tw`w-24 h-3 bg-gray-100 rounded mb-3`} />
      <View style={tw`flex-row justify-between`}>
        <View style={tw`w-16 h-3 bg-gray-100 rounded`} />
        <View style={tw`w-16 h-3 bg-gray-100 rounded`} />
      </View>
    </View>
  </View>
);

function StatCard({
  icon,
  value,
  label,
}: {
  icon: string;
  value: string | number;
  label: string;
}) {
  return (
    <View
      style={tw`w-[49%] border border-[#EEEEEE] rounded-[12px] py-3 px-3 bg-[#FCFCFC]`}
    >
      <View
        style={tw`w-8 h-8 rounded-full bg-[#EFF1E7] items-center justify-center`}
      >
        <SvgXml xml={icon} />
      </View>
      <Text style={tw`mt-2 text-oliveText font-bold text-xl`} numberOfLines={1}>
        {value}
      </Text>
      <Text style={tw`mt-1 text-seconderyText text-[10px] font-medium`}>
        {label}
      </Text>
    </View>
  );
}

export default function Index() {
  const { data, isLoading, isError, isFetching, refetch } =
    useGetHotelMerchantDashboardQuery(undefined, {
      refetchOnMountOrArgChange: true,
    });

  const sales = data?.data?.sales;
  const stats = data?.data?.stats;
  const recent = data?.data?.recent_activity ?? [];

  return (
    <View style={tw`bg-white flex-1`}>
      <SafeAreaView edges={["top"]} />
      <StatusBar style="dark" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={tw`pb-8`}
        refreshControl={
          <RefreshControl
            refreshing={isFetching && !isLoading}
            onRefresh={refetch}
            colors={["#5A7314"]}
            tintColor="#5A7314"
          />
        }
      >
        {/* Header */}
        <View style={tw`px-5 flex-row items-center justify-between`}>
          <Image
            style={tw`w-48 h-9`}
            source={require("../../../assets/logo/logo.png")}
            resizeMode="cover"
          />

          <TouchableOpacity
            onPress={() => router.push("/user-notification")}
            activeOpacity={0.7}
            style={tw`relative w-12 h-12 bg-[#F4F4F4] rounded-full items-center justify-center`}
          >
            <SvgXml xml={notificationIcon} width={20} height={20} />
            <View
              style={tw`absolute top-2 right-2 bg-red-500 min-w-[16px] h-[16px] rounded-full items-center justify-center px-1 border-2 border-white`}
            >
              <Text style={tw`text-white text-[9px] font-bold leading-none`}>
                3
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Stats grid */}
        <View style={tw`px-5 mt-5`}>
          {isLoading ? (
            <>
              <View style={tw`flex-row justify-between gap-3`}>
                <StatCardSkeleton />
                <StatCardSkeleton />
              </View>
              <View style={tw`mt-3 flex-row justify-between gap-x-3`}>
                <StatCardSkeleton />
                <StatCardSkeleton />
              </View>
            </>
          ) : isError ? (
            <View style={tw`py-8 items-center`}>
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
          ) : (
            <>
              <View style={tw`flex-row justify-between gap-3`}>
                <StatCard
                  icon={revenuIcon}
                  value={formatMoney(sales?.total ?? 0)}
                  label="Total Revenue"
                />
                <StatCard
                  icon={bookIcon}
                  value={stats?.bookings ?? 0}
                  label="Total Bookings"
                />
              </View>

              <View style={tw`mt-3 flex-row justify-between gap-x-3`}>
                <StatCard
                  icon={man}
                  value={stats?.guests ?? 0}
                  label="Guests"
                />
                <StatCard
                  icon={hotel}
                  value={stats?.properties ?? 0}
                  label="Properties"
                />
              </View>

              {/* Growth chip */}
              {sales != null && (
                <View style={tw`mt-3 flex-row items-center`}>
                  <View
                    style={tw`px-2.5 py-1 rounded-full ${
                      sales.is_positive ? "bg-emerald-50" : "bg-rose-50"
                    }`}
                  >
                    <Text
                      style={tw`text-[11px] font-semibold ${
                        sales.is_positive
                          ? "text-emerald-600"
                          : "text-rose-500"
                      }`}
                    >
                      {sales.is_positive ? "↑" : "↓"}{" "}
                      {Math.abs(sales.growth_percentage ?? 0)}% growth
                    </Text>
                  </View>
                </View>
              )}
            </>
          )}
        </View>

        {/* Recent bookings */}
        <View style={tw`mt-5`}>
          <SectionHeader
            title="Recent Bookings"
            onViewAll={() => router.push("/booking" as any)}
            isShowView
          />
        </View>

        <View style={tw`px-5 mt-3`}>
          {isLoading ? (
            <>
              <BookingSkeleton />
              <BookingSkeleton />
            </>
          ) : recent.length === 0 ? (
            <View style={tw`py-12 items-center`}>
              <Text style={tw`text-gray-400 text-sm`}>
                No recent bookings yet
              </Text>
            </View>
          ) : (
            recent.map((item: any) => (
              <HotelCard
                key={item.id}
                imageUri={
                  item.product_image ||
                  "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=800"
                }
                hotelName={item.product_name || "Hotel"}
                guestName={formatStatus(item.status)}
                checkInDate={formatDate(item.created_at)}
                checkOutDate={item.order_number || ""}
                roomsCount={item.items_count || 1}
                guestsCount={0}
                onPress={() =>
                  router.push({
                    pathname: "/booking-details/[id]" as any,
                    params: { id: String(item.id) },
                  })
                }
              />
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}
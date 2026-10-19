import { useUserProfileQuery } from "@/redux/authApi";
import {  Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
  Image,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import BackButton from "../../../components/ui/BackButton";
import PayoutCard from "../../../components/ui/e-commerce/analytic/PayoutCard";
import HotelMonthlyChart from "../../../components/ui/hotel/HotelMonthlyChart";
import { SectionHeader } from "../../../components/ui/SectionHeader";
import tw from "../../../lib/tailwind";
import { useGetHotelAnalyticsQuery } from "@/redux/merchantAnalyticsApi";
import { useGetHotelTopPerformersQuery } from "@/redux/hotelMerchantAnalyticsApi";

export default function Analytic() {
  const [year, setYear] = useState(new Date().getFullYear());

  const {
    data: analyticsData,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetHotelAnalyticsQuery(year);

  const {
    data: topData,
    isLoading: topLoading,
    refetch: refetchTop,
  } = useGetHotelTopPerformersQuery({});

  const { data: profileData } = useUserProfileQuery({});

  const analytics = analyticsData?.data;
  const currency =
    analytics?.currency ||
    profileData?.data?.merchant_profile?.currency ||
    "KES";
  const balance = analytics?.balance ?? 0;
  const stats = analytics?.stats;
  const monthly = analytics?.monthly_earnings ?? [];
  const topPerformers = topData?.data?.top_performers?.data ?? [];

  const onRefresh = () => {
    refetch();
    refetchTop();
  };

  return (
    <View style={tw`flex-1 bg-white`}>
      <BackButton title="Analytics" showBackButton={false} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={tw`pb-10`}
        refreshControl={
          <RefreshControl
            refreshing={isFetching && !isLoading}
            onRefresh={onRefresh}
            colors={["#5A7314"]}
            tintColor="#5A7314"
          />
        }
      >
        {/* Balance */}
        <View style={tw`px-5 mt-4`}>
          {isLoading ? (
            <View style={tw`h-24 bg-gray-100 rounded-2xl`} />
          ) : (
            <PayoutCard balance={balance} currency={currency} />
          )}
          {!!analytics?.pending_escrow_balance && (
            <Text style={tw`text-xs text-gray-400 mt-2`}>
              Pending escrow: {currency}{" "}
              {Number(analytics.pending_escrow_balance).toLocaleString()}
            </Text>
          )}
        </View>

        {/* Stats */}
        <View style={tw`px-5 mt-5 flex-row gap-2.5`}>
          {isLoading ? (
            <>
              <StatSkeleton />
              <StatSkeleton />
              <StatSkeleton />
            </>
          ) : (
            <>
              <StatBox label="Bookings" value={stats?.bookings ?? 0} />
              <StatBox label="Guests" value={stats?.guests ?? 0} />
              <StatBox
                label="Avg. Booking"
                value={`${currency} ${Number(
                  stats?.avg_booking_value ?? 0,
                ).toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
              />
            </>
          )}
        </View>

        {/* Chart */}
        <View style={tw`px-5 mt-5`}>
          <HotelMonthlyChart
            data={monthly}
            currency={currency}
            year={year}
            years={[2024, 2025, 2026]}
            onYearChange={setYear}
            loading={isLoading}
          />
        </View>

        {/* Top performers (instead of recent transactions) */}
        <View style={tw`mt-5`}>
          <SectionHeader
            title="Top Performers"
            onViewAll={() => router.push("/hotel" as any)}
            isShowView
          />
        </View>

        <View style={tw`px-5 mt-2`}>
          {topLoading ? (
            <>
              <TopSkeleton />
              <TopSkeleton />
              <TopSkeleton />
            </>
          ) : topPerformers.length === 0 ? (
            <View style={tw`py-10 items-center`}>
              <Ionicons name="business-outline" size={32} color="#D1D5DB" />
              <Text style={tw`text-gray-400 text-sm mt-2`}>
                No top hotels yet
              </Text>
            </View>
          ) : (
            topPerformers.map((item: any) => (
              <TouchableOpacity
                key={item.id}
                activeOpacity={0.85}
                onPress={() =>
                  router.push({
                    pathname: "/hotel-details/[id]",
                    params: { id: String(item.id) },
                  })
                }
                style={tw`flex-row items-center border border-[#F0F0F0] rounded-2xl p-3 mb-3 bg-white`}
              >
                <Image
                  source={{
                    uri:
                      item.image_url ||
                      item.image ||
                      "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=400",
                  }}
                  style={tw`w-16 h-16 rounded-xl bg-gray-100`}
                  resizeMode="cover"
                />
                <View style={tw`flex-1 ml-3`}>
                  <Text
                    style={tw`text-sm font-semibold text-gray-900`}
                    numberOfLines={1}
                  >
                    {item.name}
                  </Text>
                  <Text style={tw`text-xs text-gray-400 mt-1`}>
                    {item.total_sold ?? 0} bookings
                  </Text>
                </View>
                <View style={tw`items-end`}>
                  <Text style={tw`text-sm font-bold text-[#FF6200]`}>
                    {currency}{" "}
                    {Number(item.price_per_night || 0).toLocaleString()}
                  </Text>
                  <Text style={tw`text-[10px] text-gray-400`}>/night</Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>

        {isError && (
          <View style={tw`px-5 py-6 items-center`}>
            <Text style={tw`text-gray-500 mb-2`}>Failed to load analytics</Text>
            <TouchableOpacity
              onPress={onRefresh}
              style={tw`bg-[#5A7314] px-5 py-2.5 rounded-full`}
            >
              <Text style={tw`text-white font-semibold text-sm`}>
                Try Again
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function StatBox({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <View
      style={tw`flex-1 border border-[#F3F3F3] py-3 px-2 rounded-[12px] items-center bg-white`}
    >
      <Text
        style={tw`text-[10px] font-medium text-gray-500 mb-1 text-center`}
        numberOfLines={1}
      >
        {label}
      </Text>
      <Text
        style={tw`text-oliveText text-base font-bold text-center`}
        numberOfLines={1}
      >
        {value}
      </Text>
    </View>
  );
}

function StatSkeleton() {
  return (
    <View
      style={tw`flex-1 border border-[#F3F3F3] py-3 px-2 rounded-[12px] items-center`}
    >
      <View style={tw`w-12 h-2.5 bg-gray-200 rounded mb-2`} />
      <View style={tw`w-10 h-5 bg-gray-200 rounded`} />
    </View>
  );
}

function TopSkeleton() {
  return (
    <View
      style={tw`flex-row items-center border border-[#F0F0F0] rounded-2xl p-3 mb-3`}
    >
      <View style={tw`w-16 h-16 rounded-xl bg-gray-200`} />
      <View style={tw`flex-1 ml-3`}>
        <View style={tw`w-32 h-3.5 bg-gray-200 rounded mb-2`} />
        <View style={tw`w-16 h-3 bg-gray-100 rounded`} />
      </View>
      <View style={tw`w-14 h-4 bg-gray-200 rounded`} />
    </View>
  );
}
import {
  useGetAnalyticsQuery,
  useGetTopSellingProductsQuery,
} from "@/redux/merchantAnalyticsApi";
import { router } from "expo-router";
import { useState } from "react";
import {
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import BackButton from "../../../components/ui/BackButton";
import MonthlyEarningsChart from "../../../components/ui/e-commerce/analytic/MonthlyEarningsChart";
import PayoutCard from "../../../components/ui/e-commerce/analytic/PayoutCard";
import { OrderCard } from "../../../components/ui/e-commerce/order-card/OrderCard";
import FadeTabScreen from "../../../components/ui/FadeTabScreen";
import { SectionHeader } from "../../../components/ui/SectionHeader";
import tw from "../../../lib/tailwind";

export default function Analytic() {
  const [year, setYear] = useState(new Date().getFullYear());

  const {
    data: analyticsRes,
    isLoading: analyticsLoading,
    isFetching: analyticsFetching,
    isError: analyticsError,
    refetch: refetchAnalytics,
  } = useGetAnalyticsQuery(year);

  const {
    data: topRes,
    isLoading: topLoading,
    isFetching: topFetching,
    refetch: refetchTop,
  } = useGetTopSellingProductsQuery({ per_page: 5 });

  const analytics = analyticsRes?.data;
  const stats = analytics?.stats;
  const monthly = analytics?.monthly_earnings ?? [];
  const currency = analytics?.currency || "KES";

  const topProducts = topRes?.data?.top_performers?.data ?? [];

  const onRefresh = () => {
    refetchAnalytics();
    refetchTop();
  };

  const formatMoney = (n: number | string) =>
    `${currency} ${Number(n).toLocaleString(undefined, {
      maximumFractionDigits: 2,
    })}`;

  return (
    <FadeTabScreen>
      <View style={tw`flex-1 bg-white`}>
        <BackButton title="Analytics" showBackButton={false} />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={tw`pb-10`}
          refreshControl={
            <RefreshControl
              refreshing={
                (analyticsFetching || topFetching) &&
                !analyticsLoading &&
                !topLoading
              }
              onRefresh={onRefresh}
              colors={["#5A7314"]}
              tintColor="#5A7314"
            />
          }
        >
          <View style={tw`px-5 mt-4`}>
            {/* Payout / Balance */}
            <PayoutCard balance={analytics?.balance ?? 0} currency={currency} />

            {/* Stats */}
            <View style={tw`mt-5 flex-row justify-between gap-x-2.5`}>
              {analyticsLoading ? (
                <>
                  {[1, 2, 3].map((i) => (
                    <View
                      key={i}
                      style={tw`flex-1 border border-[#F3F3F3] py-3 px-2 rounded-[12px] items-center bg-white`}
                    >
                      <View style={tw`w-12 h-2.5 bg-gray-200 rounded mb-2`} />
                      <View style={tw`w-8 h-5 bg-gray-200 rounded`} />
                    </View>
                  ))}
                </>
              ) : (
                <>
                  <StatBox label="Orders" value={stats?.orders ?? 0} />
                  <StatBox label="Customers" value={stats?.customers ?? 0} />
                  <StatBox
                    label="Avg. Order Value"
                    value={formatMoney(stats?.avg_order_value ?? 0)}
                  />
                </>
              )}
            </View>

            {/* Monthly chart */}
            <View style={tw`mt-5`}>
              <MonthlyEarningsChart
                data={monthly}
                currency={currency}
                year={year}
                onYearChange={setYear}
                isLoading={analyticsLoading}
              />
            </View>
          </View>

          {/* Top Selling */}
          <View style={tw`mt-5 mb-3`}>
            <SectionHeader
              title="Top Selling Product"
              onViewAll={() => router.push("/top-selling-product")}
              isShowView={true}
            />
          </View>

          <View style={tw`px-5`}>
            {topLoading ? (
              <>
                {[1, 2, 3].map((i) => (
                  <View
                    key={i}
                    style={tw`flex-row items-center border border-gray-100 rounded-2xl p-3 mb-2.5`}
                  >
                    <View style={tw`w-12 h-12 bg-gray-200 rounded-xl mr-3`} />
                    <View style={tw`flex-1`}>
                      <View style={tw`w-28 h-3.5 bg-gray-200 rounded mb-2`} />
                      <View style={tw`w-16 h-3 bg-gray-100 rounded`} />
                    </View>
                    <View style={tw`w-14 h-4 bg-gray-200 rounded`} />
                  </View>
                ))}
              </>
            ) : topProducts.length === 0 ? (
              <View style={tw`py-10 items-center`}>
                <Text style={tw`text-gray-400 text-sm`}>
                  No top products yet
                </Text>
              </View>
            ) : (
              topProducts.map((p: any) => (
                <OrderCard
                  key={p.id}
                  orderId=""
                  title={p.name}
                  itemCount=""
                  time=""
                  price={formatMoney(p.base_price)}
                  status=""
                  image={
                    p.image_url || p.image
                      ? { uri: p.image_url || p.image }
                      : require("../../../assets/order/order.png")
                  }
                  topSellingPorduct
                  sold={p.total_sold}
                  onPress={() =>
                    router.push({
                      pathname: "/product-details/[id]",
                      params: { id: String(p.id) },
                    })
                  }
                />
              ))
            )}
          </View>

          {analyticsError && (
            <View style={tw`items-center mt-4`}>
              <Text style={tw`text-gray-500 text-sm mb-2`}>
                Failed to load analytics
              </Text>
              <TouchableOpacity onPress={() => refetchAnalytics()}>
                <Text style={tw`text-[#5A7314] font-semibold`}>Retry</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </View>
    </FadeTabScreen>
  );
}

function StatBox({ label, value }: { label: string; value: string | number }) {
  return (
    <View
      style={tw`flex-1 border border-[#F3F3F3] py-3 px-2 rounded-[12px] items-center justify-center bg-white`}
    >
      <Text
        style={tw`text-[10px] font-medium mb-1 text-center text-gray-500`}
        numberOfLines={1}
      >
        {label}
      </Text>
      <Text
        style={tw`text-[#5A7314] text-base font-bold text-center`}
        numberOfLines={1}
        adjustsFontSizeToFit
      >
        {value}
      </Text>
    </View>
  );
}

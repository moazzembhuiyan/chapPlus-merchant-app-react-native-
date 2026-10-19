import { useGetPayoutHistoryQuery } from "@/redux/walletApi";
import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import {
  FlatList,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import BackButton from "../../components/ui/BackButton";
import tw from "../../lib/tailwind";

const formatDate = (dateString: string) => {
  if (!dateString) return "—";
  const d = new Date(dateString);
  return d.toLocaleString([], {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatAmount = (amount: number, currency = "KES") =>
  `-${currency} ${Number(amount).toLocaleString()}`;

const statusStyle = (status: string) => {
  switch (status) {
    case "completed":
    case "paid":
    case "success":
      return { bg: "bg-green-50", text: "text-green-600", label: "Completed" };
    case "pending":
      return { bg: "bg-amber-50", text: "text-amber-600", label: "Pending" };
    case "rejected":
    case "failed":
      return { bg: "bg-red-50", text: "text-red-500", label: status };
    default:
      return {
        bg: "bg-gray-100",
        text: "text-gray-600",
        label: status?.replace(/_/g, " ") || "—",
      };
  }
};

const HistorySkeleton = () => (
  <View
    style={tw`border border-gray-100 rounded-2xl bg-white px-4 py-2 mx-5 mt-4`}
  >
    {[1, 2, 3, 4, 5].map((i) => (
      <View
        key={i}
        style={tw`flex-row items-center justify-between py-3.5 ${
          i !== 5 ? "border-b border-gray-50" : ""
        }`}
      >
        <View style={tw`flex-row items-center gap-x-3`}>
          <View style={tw`w-10 h-10 rounded-xl bg-gray-200`} />
          <View>
            <View style={tw`w-28 h-3.5 bg-gray-200 rounded mb-2`} />
            <View style={tw`w-24 h-2.5 bg-gray-100 rounded`} />
          </View>
        </View>
        <View style={tw`items-end`}>
          <View style={tw`w-16 h-3.5 bg-gray-200 rounded mb-1.5`} />
          <View style={tw`w-12 h-4 bg-gray-100 rounded-full`} />
        </View>
      </View>
    ))}
  </View>
);

export default function PayoutHistory() {
  const { data, isLoading, isFetching, isError, refetch } =
    useGetPayoutHistoryQuery({});

  const payouts = data?.data?.payouts?.data ?? [];

  return (
    <View style={tw`flex-1 bg-white`}>
      <BackButton title="Payout History" />

      {isLoading ? (
        <HistorySkeleton />
      ) : isError ? (
        <View style={tw`flex-1 items-center justify-center px-5`}>
          <Text style={tw`text-gray-500 mb-3`}>Failed to load history</Text>
          <TouchableOpacity
            onPress={() => refetch()}
            style={tw`bg-[#5A7314] px-5 py-2.5 rounded-full`}
          >
            <Text style={tw`text-white font-semibold`}>Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : payouts.length === 0 ? (
        <View style={tw`flex-1 items-center justify-center px-5 pb-20`}>
          <View
            style={tw`w-20 h-20 rounded-full bg-gray-100 items-center justify-center mb-4`}
          >
            <Ionicons name="receipt-outline" size={36} color="#9CA3AF" />
          </View>
          <Text style={tw`text-base font-bold text-gray-800 text-center`}>
            No History Found
          </Text>
          <Text
            style={tw`text-xs text-gray-400 text-center mt-1 max-w-[240px]`}
          >
            You haven&apos;t made any payout requests yet.
          </Text>
        </View>
      ) : (
        <FlatList
          data={payouts}
          keyExtractor={(item: any) => String(item.id)}
          contentContainerStyle={tw`p-5 pb-10`}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isFetching && !isLoading}
              onRefresh={refetch}
              colors={["#5A7314"]}
              tintColor="#5A7314"
            />
          }
          renderItem={({ item, index }: { item: any; index: number }) => {
            const st = statusStyle(item.status);
            return (
              <View
                style={tw`flex-row items-center justify-between py-3.5 ${
                  index !== payouts.length - 1 ? "border-b border-gray-100" : ""
                }`}
              >
                <View style={tw`flex-row items-center gap-x-3 flex-1 pr-2`}>
                  <View
                    style={tw`w-10 h-10 rounded-xl border border-green-100 bg-green-50 items-center justify-center`}
                  >
                    <FontAwesome5 name="mobile-alt" size={16} color="#5A7314" />
                  </View>
                  <View style={tw`flex-1`}>
                    <Text
                      style={tw`text-sm font-bold text-gray-800`}
                      numberOfLines={1}
                    >
                      M-Pesa · {item.mpesa_number || "—"}
                    </Text>
                    <Text style={tw`text-[11px] text-gray-400 mt-0.5`}>
                      {formatDate(item.created_at)}
                    </Text>
                    {item.rejection_reason ? (
                      <Text
                        style={tw`text-[10px] text-red-400 mt-0.5`}
                        numberOfLines={1}
                      >
                        {item.rejection_reason}
                      </Text>
                    ) : null}
                  </View>
                </View>

                <View style={tw`items-end`}>
                  <Text style={tw`text-sm font-semibold text-rose-500`}>
                    {formatAmount(item.amount, item.currency)}
                  </Text>
                  <View style={tw`${st.bg} px-2 py-0.5 rounded-full mt-1`}>
                    <Text style={tw`text-[10px] font-medium ${st.text}`}>
                      {st.label}
                    </Text>
                  </View>
                </View>
              </View>
            );
          }}
          ListHeaderComponent={
            <View
              style={tw`border border-gray-200 rounded-2xl bg-white px-4 py-1 shadow-sm overflow-hidden`}
            />
          }
          // wrap items visually in one card:
          style={tw`mx-5 mt-2 border border-gray-200 rounded-2xl bg-white`}
        />
      )}
    </View>
  );
}

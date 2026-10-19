import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import { ScrollView, Text, View } from "react-native";
import tw from "../../../lib/tailwind";

interface HistoryItem {
  id: string;
  cardName: string;
  dateTime: string;
  amount: string;
}

const HISTORY_DATA: HistoryItem[] = [
  {
    id: "1",
    cardName: "Visa •••• 1111",
    dateTime: "Dec 28, 2024 - 09:14 AM",
    amount: "-$500",
  },
  {
    id: "2",
    cardName: "Mastercard •••• 4521",
    dateTime: "Dec 28, 2024 - 09:14 AM",
    amount: "-$1500",
  },
  {
    id: "3",
    cardName: "Visa •••• 1111",
    dateTime: "Dec 28, 2024 - 09:14 AM",
    amount: "-$1500",
  },
  {
    id: "4",
    cardName: "Visa •••• 1111",
    dateTime: "Dec 28, 2024 - 09:14 AM",
    amount: "-$1500",
  },
  {
    id: "5",
    cardName: "Visa •••• 1111",
    dateTime: "Dec 28, 2024 - 09:14 AM",
    amount: "-$1500",
  },
  {
    id: "6",
    cardName: "Visa •••• 1111",
    dateTime: "Dec 28, 2024 - 09:14 AM",
    amount: "-$1500",
  },
  {
    id: "7",
    cardName: "Visa •••• 1111",
    dateTime: "Dec 28, 2024 - 09:14 AM",
    amount: "-$1500",
  },
  {
    id: "8",
    cardName: "Mastercard •••• 4521",
    dateTime: "Dec 28, 2024 - 09:14 AM",
    amount: "-$2500",
  },
];

export default function HotelTransition() {
  const hasData = HISTORY_DATA && HISTORY_DATA.length > 0;

  return (
    <View style={tw`flex-1 bg-white`}>
      {hasData ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={tw`p-5 pb-10`}
        >
          {/* Main Outer Card Container */}
          <View
            style={tw`border border-gray-200 rounded-2xl bg-white px-4 py-2 shadow-sm`}
          >
            {HISTORY_DATA.map((item, index) => (
              <View
                key={item.id}
                style={tw`flex-row items-center justify-between py-3.5 ${
                  index !== HISTORY_DATA.length - 1
                    ? "border-b border-gray-100"
                    : ""
                }`}
              >
                {/* Left Side: Icon & Details */}
                <View style={tw`flex-row items-center gap-x-3`}>
                  <View
                    style={tw`w-10 h-10 rounded-xl border border-orange-100 bg-orange-50/40 items-center justify-center`}
                  >
                    <FontAwesome5
                      name="credit-card"
                      size={16}
                      color="#FF6200"
                    />
                  </View>

                  <View>
                    <Text style={tw`text-sm font-bold text-gray-800`}>
                      {item.cardName}
                    </Text>
                    <Text style={tw`text-[11px] text-gray-400 mt-0.5`}>
                      {item.dateTime}
                    </Text>
                  </View>
                </View>

                {/* Right Side: Amount */}
                <Text style={tw`text-sm font-semibold text-rose-400`}>
                  {item.amount}
                </Text>
              </View>
            ))}
          </View>
        </ScrollView>
      ) : (
        /* Not Found / Empty State View */
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
            You haven't made any payout requests yet.
          </Text>
        </View>
      )}
    </View>
  );
}

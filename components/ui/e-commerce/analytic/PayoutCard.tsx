import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Image, Text, TouchableOpacity, View } from "react-native";
import tw from "../../../../lib/tailwind";

export default function PayoutCard({
  balance = 0,
  currency = "KES",
}: {
  balance?: number | string;
  currency?: any;
}) {
  const numBalance = typeof balance === "number" ? balance : Number(balance);
  const safeBalance = !isNaN(numBalance) ? numBalance : 0;
  const safeCurrency = currency || "KES";

  return (
    <View
      style={tw`bg-[#5A7314] rounded-3xl p-4 overflow-hidden relative shadow-sm`}
    >
      {/* Background Watermark Wallet Icon */}
      <View style={tw`absolute -top-1 right-4 opacity-20 pointer-events-none`}>
        <Image source={require("../../../../assets/logo/card.png")} />
      </View>

      {/* Title & Amount */}
      <Text style={tw`text-white/80 text-sm  font-Manrope-Regular.ttf `}>
        Payout Balance
      </Text>
      <Text style={tw`text-white mt-2 font-Manrope-SemiBold.ttf text-lg`}>
        {`${safeCurrency} ${safeBalance.toLocaleString(undefined, { maximumFractionDigits: 2 })}`}
      </Text>

      {/* Buttons Container */}
      <View style={tw`flex-row gap-3 mt-5`}>
        {/* Request Payout Button */}
        <TouchableOpacity
          onPress={() => {
            router.push("/request-payout");
          }}
          activeOpacity={0.8}
          style={tw`flex-1 flex-row items-center justify-center gap-2 py-3 px-3 rounded-xl border border-white/30 bg-white/10`}
        >
          <Ionicons name="add-circle-outline" size={18} color="#FFFFFF" />
          <Text style={tw`text-white text-xs font-semibold`}>
            Request Payout
          </Text>
        </TouchableOpacity>

        {/* Payout History Button */}
        <TouchableOpacity
          onPress={() => {
            router.push("/payout-history");
          }}
          activeOpacity={0.8}
          style={tw`flex-1 flex-row items-center justify-center gap-2 py-3 px-3 rounded-xl border border-white/30 bg-white/10`}
        >
          <MaterialCommunityIcons name="history" size={18} color="#FFFFFF" />
          <Text style={tw`text-white text-xs font-semibold`}>
            Payout History
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

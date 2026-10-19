import { useRequestPayoutMutation } from "@/redux/walletApi";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import BackButton from "../../components/ui/BackButton";
import tw from "../../lib/tailwind";

export default function RequestPayout() {
  const [amount, setAmount] = useState("");
  const [mpesaNumber, setMpesaNumber] = useState("");

  const [requestPayout, { isLoading }] = useRequestPayoutMutation();

  const handleSubmit = async () => {
    const amountNum = Number(amount);

    if (!amount.trim() || isNaN(amountNum) || amountNum <= 0) {
      Toast.show({
        type: "error",
        text1: "Invalid amount",
        text2: "Enter a valid payout amount",
      });
      return;
    }

    // Kenya format: 2547XXXXXXXX (12 digits) or 07XXXXXXXX
    const cleaned = mpesaNumber.replace(/\s+/g, "").replace(/^\+/, "");
    if (!cleaned || cleaned.length < 9) {
      Toast.show({
        type: "error",
        text1: "Invalid M-Pesa number",
        text2: "Enter a valid number e.g. 254712345678",
      });
      return;
    }

    try {
      const res = await requestPayout({
        amount: amountNum,
        mpesa_number: cleaned,
      }).unwrap();

      const successMessage =
        res?.message || res?.data?.message || "Your request has been submitted";

      Toast.show({
        type: "success",
        text1: "Payout requested",
        text2: successMessage,
      });

      setAmount("");
      setMpesaNumber("");

      // optional: go to history
      setTimeout(() => {
        router.replace("/payout-history" as any);
      }, 800);
    } catch (e: any) {
      console.log("Payout error:", JSON.stringify(e, null, 2));
      Toast.show({
        type: "error",
        text1: "Request failed",
        text2:
          e?.data?.message ||
          e?.data?.errors?.amount?.[0] ||
          e?.data?.errors?.mpesa_number?.[0] ||
          e?.error ||
          "Please try again",
      });
    }
  };

  return (
    <View style={tw`flex-1 bg-white`}>
      <BackButton title="Request Payout" />

      <ScrollView
        style={tw`flex-1`}
        contentContainerStyle={tw`px-5 pt-4 pb-10`}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Info banner */}
        <View
          style={tw`bg-[#F2F4EC] border border-[#E0E8C8] rounded-2xl px-4 py-3 mb-6 flex-row items-start`}
        >
          <Ionicons
            name="information-circle"
            size={18}
            color="#5A7314"
            style={tw`mt-0.5 mr-2`}
          />
          <Text style={tw`flex-1 text-xs text-[#5A7314] leading-4`}>
            Payouts are sent to your M-Pesa number. Use format 2547XXXXXXXX.
          </Text>
        </View>

        {/* Amount */}
        <View style={tw`mb-5`}>
          <Text style={tw`text-sm font-bold text-gray-800 mb-2`}>
            Amount (KES)
          </Text>
          <View
            style={tw`flex-row items-center border border-gray-200 rounded-2xl px-4 py-3.5 bg-white`}
          >
            <Text style={tw`text-sm font-semibold text-gray-500 mr-2`}>
              KES
            </Text>
            <TextInput
              style={tw`flex-1 text-sm text-gray-800 p-0`}
              placeholder="100.00"
              placeholderTextColor="#9CA3AF"
              keyboardType="decimal-pad"
              value={amount}
              onChangeText={setAmount}
            />
          </View>
        </View>

        {/* M-Pesa Number */}
        <View style={tw`mb-8`}>
          <Text style={tw`text-sm font-bold text-gray-800 mb-2`}>
            M-Pesa Number
          </Text>
          <View
            style={tw`flex-row items-center border border-gray-200 rounded-2xl px-4 py-3.5 bg-white`}
          >
            <Ionicons
              name="phone-portrait-outline"
              size={18}
              color="#9CA3AF"
              style={tw`mr-2.5`}
            />
            <TextInput
              style={tw`flex-1 text-sm text-gray-800 p-0`}
              placeholder="254712345678"
              placeholderTextColor="#9CA3AF"
              keyboardType="phone-pad"
              value={mpesaNumber}
              onChangeText={setMpesaNumber}
              autoCapitalize="none"
            />
          </View>
        </View>

        {/* Submit */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleSubmit}
          disabled={isLoading}
          style={tw`bg-[#5A7314] py-4 rounded-full items-center justify-center ${
            isLoading ? "opacity-70" : ""
          }`}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={tw`text-white font-semibold text-base`}>
              Withdraw Request
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

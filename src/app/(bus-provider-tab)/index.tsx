import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { SvgXml } from "react-native-svg";
import BusStateCard from "../../../components/ui/bus-ticket/BusStateCard";
import { notificationIcon } from "../../../lib/icon";
import tw from "../../../lib/tailwind";

export default function Index() {
  return (
    <View style={tw`flex-1 bg-white`}>
      <SafeAreaView style={tw`bg-white`} edges={["top"]} />
      <StatusBar style="dark" />

      {/* Top Header */}
      <View style={tw`px-5 py-3 flex-row items-center justify-between`}>
        {/* Logo Section */}
        <View style={tw`flex-row items-center gap-x-3`}>
          <Image
            style={tw`w-48 h-9`}
            source={require("../../../assets/logo/logo.png")}
            resizeMode="contain"
          />
        </View>

        {/* Notification Button */}
        <TouchableOpacity
          onPress={() => {
            router.push("/user-notification");
          }}
          activeOpacity={0.7}
          style={tw`relative w-12 h-12 bg-[#F4F4F4] rounded-full items-center justify-center`}
        >
          <SvgXml xml={notificationIcon} width={20} height={20} />

          {/* Notification Badge */}
          <View
            style={tw`absolute top-2 right-2 bg-red-500 min-w-[16px] h-[16px] rounded-full items-center justify-center px-1 border-2 border-white`}
          >
            <Text style={tw`text-white text-[9px] font-bold leading-none`}>
              3
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={tw`px-5 flex-1 mt-4 `}>
        <BusStateCard />
      </View>
    </View>
  );
}

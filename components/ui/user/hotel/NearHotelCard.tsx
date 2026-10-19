import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { memo } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { Hotel } from "../../../../lib/data";
import tw from "../../../../lib/tailwind";

interface NearHotelCardProps {
  item: Hotel;
}

export const NearHotelCard = memo(({ item }: NearHotelCardProps) => {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => {
        router.push({
          pathname: "/(user-tab)/hotel-details",
          params: { id: 1 },
        });
      }}
      style={tw`bg-[#FBFBFB] border border-gray-100 rounded-2xl p-2.5 flex-row items-center`}
    >
      <Image
        source={{ uri: item.image }}
        style={tw`w-20 h-20 rounded-xl mr-3`}
        resizeMode="cover"
      />

      <View style={tw`flex-1 h-20 justify-between py-0.5`}>
        <View>
          <Text
            style={tw`text-sm font-Manrope-SemiBold.ttf text-[#101010] mb-1`}
            numberOfLines={1}
          >
            {item.title}
          </Text>
          <View style={tw`flex-row items-center gap-0.5 mb-2 mt-1.5`}>
            <Ionicons name="location-outline" size={13} color="#9CA3AF" />
            <Text
              style={tw`text-xs font-Manrope-Regular.ttf text-[#606060]`}
              numberOfLines={1}
            >
              {item.location}
            </Text>
          </View>
          <View style={tw` flex-row items-center justify-between `}>
            <Text
              style={tw`text-sm font-Manrope-SemiBold.ttf text-[#F86B17] ml-1`}
            >
              ${item.price}
              <Text
                style={tw`text-[10px] font-Manrope-SemiBold.ttf text-[#878787]`}
              >
                /night
              </Text>
            </Text>
            <View style={tw`flex-row items-center gap-1`}>
              <Ionicons name="star" size={12} color="#FCB205" />
              <Text style={tw`text-xs font-Manrope-Medium.ttf text-[#101010]`}>
                {item.rating}
              </Text>
            </View>
          </View>
        </View>

        <View style={tw`flex-row justify-between items-center`}></View>
      </View>
    </TouchableOpacity>
  );
});

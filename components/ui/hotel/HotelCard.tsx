import { Feather, FontAwesome5 } from "@expo/vector-icons";
import { Image, Text, TouchableOpacity, View } from "react-native";
import tw from "../../../lib/tailwind";

export interface BookingCardProps {
  imageUri: string;
  hotelName: string;
  guestName: string;
  checkInDate: string;
  checkOutDate: string;
  roomsCount: number | string;
  guestsCount: number | string;
  onPress?: () => void;
}

export default function HotelCard({
  imageUri,
  hotelName,
  guestName,
  checkInDate,
  checkOutDate,
  roomsCount,
  guestsCount,
  onPress,
}: BookingCardProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={tw`bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden mb-5`}
    >
      {/* Top Banner Image */}
      <View style={tw`h-44 w-full bg-gray-200`}>
        <Image
          source={{ uri: imageUri }}
          style={tw`w-full h-full`}
          resizeMode="cover"
        />
      </View>

      {/* Content Container */}
      <View style={tw`p-4`}>
        {/* Header: Hotel Name & Guest Name */}
        <View
          style={tw`flex-row items-center justify-between pb-2 border-b-[3px] border-[#F0F0F0]`}
        >
          <Text
            style={tw`text-sm font-Manrope-SemiBold.ttf text-blackText flex-1 mr-2`}
            numberOfLines={1}
          >
            {hotelName}
          </Text>
          <Text
            style={tw` text-xs font-Manrope-Regular.ttf text-seconderyText `}
          >
            {guestName}
          </Text>
        </View>

        {/* Dates Section */}
        <View
          style={tw`flex-row items-center justify-between py-2.5 border-b-[3px] border-[#F0F0F0]`}
        >
          {/* Check-In */}
          <View>
            <Text
              style={tw`text-[10px] font-Manrope-Regular.ttf text-[#AAAAAA] tracking-wider mb-1 uppercase`}
            >
              CHECK-IN
            </Text>
            <Text style={tw`text-xs font-Manrope-SemiBold.ttf text-blackText `}>
              {checkInDate}
            </Text>
          </View>

          {/* Arrow Divider */}
          <View style={tw`flex-row items-center px-2`}>
            <View style={tw`w-6 h-[1px] bg-gray-200`} />
            <Feather
              name="arrow-right"
              size={12}
              color="#486006"
              style={tw`mx-1`}
            />
            <View style={tw`w-6 h-[1px] bg-gray-200`} />
          </View>

          {/* Check-Out */}
          <View style={tw`items-end`}>
            <Text
              style={tw`text-[10px] font-Manrope-Regular.ttf text-[#AAAAAA] tracking-wider mb-1 uppercase`}
            >
              CHECK-OUT
            </Text>
            <Text style={tw`text-xs font-Manrope-SemiBold.ttf text-blackText`}>
              {checkOutDate}
            </Text>
          </View>
        </View>

        {/* Footer Info: Rooms & Guests */}
        <View style={tw`flex-row items-center justify-between pt-3`}>
          {/* Room Info */}
          <View style={tw`flex-row items-center`}>
            <View
              style={tw`w-7 h-7 rounded-full bg-[#EFF1E7] items-center justify-center mr-2`}
            >
              <FontAwesome5 name="shopping-bag" size={9} color="#658210" />
            </View>
            <Text style={tw`text-xs font-Manrope-SemiBold.ttf text-blackText`}>
              {roomsCount}{" "}
              {typeof roomsCount === "number" && roomsCount > 1
                ? "Rooms"
                : "Room"}
            </Text>
          </View>

          {/* Guests Info */}
          <View style={tw`flex-row items-center`}>
            <View
              style={tw`w-7 h-7 rounded-full bg-[#EFF1E7] items-center justify-center mr-2`}
            >
              <FontAwesome5 name="user" size={9} color="#658210" />
            </View>
            <Text style={tw`text-xs font-Manrope-SemiBold.ttf text-gray-700`}>
              {guestsCount}{" "}
              {typeof guestsCount === "number" && guestsCount > 1
                ? "Guests"
                : "Guest"}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

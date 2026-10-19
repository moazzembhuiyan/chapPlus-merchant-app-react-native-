import React from "react";
import {
  Image,
  ImageSourcePropType,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import tw from "../../../../lib/tailwind";

export interface OrderItemProps {
  orderId: string;
  title: string;
  itemCount: string | number;
  time: string;
  price: string | number;
  status: string;
  image: ImageSourcePropType;
  topSellingPorduct?: boolean;
  sold?: number;
  onPress?: () => void;
}

export const OrderCard: React.FC<OrderItemProps> = ({
  orderId,
  title,
  itemCount,
  time,
  price,
  status,
  image,
  topSellingPorduct,
  sold,
  onPress,
}) => {
  if (topSellingPorduct) {
    return (
      <TouchableOpacity
        activeOpacity={0.8}
        style={tw`flex-row items-center justify-between bg-white border border-[#EBEBEB] rounded-2xl p-3 mb-2.5`}
      >
        <View style={tw`flex-row gap-x-3 flex-1 pr-2`}>
          <View
            style={tw`w-12 h-12 p-1 rounded-xl bg-gray-100 items-center justify-center overflow-hidden`}
          >
            <Image
              source={image}
              style={tw`w-full h-full`}
              resizeMode="cover"
            />
          </View>

          <View style={tw`flex-1`}>
            <Text
              style={tw`text-sm text-blackText font-Manrope-SemiBold.ttf`}
              numberOfLines={1}
            >
              {title}
            </Text>
            <Text
              style={tw`text-xs text-[#858585] mt-2 font-Manrope-Regular.ttf`}
            >
              {sold} sold
            </Text>
          </View>
        </View>

        <Text style={tw`text-[16px] font-Manrope-Bold.ttf text-[#FF6200]`}>
          {price}
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <View style={tw`bg-white border border-[#EBEBEB] rounded-2xl p-2.5 mb-3`}>
        {/* Top Header: Order ID */}
        <Text style={tw`text-orderColor font-Manrope-Medium.ttf text-xs mb-2`}>
          {orderId}
        </Text>

        {/* Divider */}
        <View style={tw`h-[1px] bg-gray-100 mb-3`} />

        {/* Main Content Area */}
        <View style={tw`flex-row items-center justify-between`}>
          {/* Left Section: Image + Details */}
          <View style={tw`flex-row items-center flex-1 pr-2`}>
            <View
              style={tw`w-17 h-17 bg-[#F3F3F3] rounded-[8.7px] overflow-hidden mr-3 p-1 items-center justify-center`}
            >
              <Image
                source={image}
                style={tw`w-full h-full`}
                resizeMode="cover"
              />
            </View>

            <View style={tw`flex-1 justify-center`}>
              <Text
                style={tw`text-[#505050] text-sm font-Manrope-Medium.ttf mb-1`}
                numberOfLines={1}
              >
                {title}
              </Text>

              <View style={tw`flex-row items-center gap-x-3 mb-1.5`}>
                <Text
                  style={tw`text-[#505050] text-[10px] font-Manrope-Regular.ttf`}
                >
                  {itemCount}
                </Text>
                <Text
                  style={tw`text-[#505050] text-[10px] font-Manrope-Regular.ttf`}
                >
                  {time}
                </Text>
              </View>

              <Text style={tw`text-[#505050] text-xs font-Manrope-Regular.ttf`}>
                {price}
              </Text>
            </View>
          </View>

          {/* Right Section: Status Badge */}
          <View style={tw`bg-[#FFF5E6] px-2 py-1 rounded-[34px]`}>
            <Text style={tw`text-[#FF9800] text-xs font-Manrope-Regular.ttf`}>
              {status}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

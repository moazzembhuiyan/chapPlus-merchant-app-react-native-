import { router } from "expo-router";
import React, { useState } from "react";
import {
  Image,
  ImageSourcePropType,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import tw from "../../../../lib/tailwind";

export interface ProductItemProps {
  id: string;
  title: string;
  price: string;
  stock: number;
  status: "active" | "inactive" | "out_of_stock";
  image: ImageSourcePropType;
  onToggleStatus?: (id: string, newStatus: boolean) => void;
}

export const ProductCard: React.FC<ProductItemProps> = ({
  id,
  title,
  price,
  stock,
  status,
  image,
  onToggleStatus,
}) => {
  const [isActive, setIsActive] = useState(status === "active");

  const handleToggle = (value: boolean) => {
    setIsActive(value);
    onToggleStatus?.(id, value);
  };

  return (
    <TouchableOpacity
      onPress={() => {
        router.push({
          pathname: "/e-commerce-product-details/[id]",
          params: { id },
        });
      }}
      activeOpacity={0.9}
      style={tw`bg-white border border-[#EDEDED] rounded-2xl p-3 flex-row items-center justify-between mb-3 shadow-sm`}
    >
      {/* Left Container: Image & Product Details */}
      <View style={tw`flex-row items-center flex-1 pr-2`}>
        <View
          style={tw`w-17 h-17 p-1 bg-[#F5F5F5] rounded-xl items-center justify-center overflow-hidden mr-3`}
        >
          <Image source={image} style={tw`w-full h-full `} resizeMode="cover" />
        </View>

        <View style={tw`flex-1 justify-center`}>
          <Text
            style={tw`text-[#222222] font-Manrope-Medium.ttf text-sm mb-1`}
            numberOfLines={1}
          >
            {title}
          </Text>

          <Text
            style={tw`text-[#222222] text-[16px] font-Manrope-Bold.ttf mb-1`}
          >
            {price}
          </Text>

          <Text
            style={tw`text-[#505050] text-[10px] font-Manrope-Regular.ttf `}
          >
            Stock: {stock}
          </Text>
        </View>
      </View>

      {/* Right Container: Toggle Switch */}
      <Switch
        trackColor={{ false: "#E4E4E7", true: "#5A7314" }}
        thumbColor="#FFFFFF"
        ios_backgroundColor="#E4E4E7"
        onValueChange={handleToggle}
        value={isActive}
        disabled={status === "out_of_stock"}
      />
    </TouchableOpacity>
  );
};

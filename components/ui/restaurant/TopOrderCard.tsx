import { Image, Text, TouchableOpacity, View } from "react-native";
import tw from "../../../lib/tailwind";

export interface FoodItem {
  id: string;
  name: string;
  orders: string;
  price: string;
  image: string;
}

interface FoodItemCardProps {
  item: FoodItem;
  onPress?: () => void;
}

// Reusable Card Component
export function TopOrderCard({ item, onPress }: FoodItemCardProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={tw`flex-row items-center justify-between bg-white border border-gray-100 rounded-2xl p-3.5 mb-3 shadow-sm`}
    >
      <View style={tw`flex-row items-center`}>
        <View
          style={tw`w-12 h-12 rounded-xl bg-gray-50 overflow-hidden mr-3.5`}
        >
          <Image
            source={{ uri: item.image }}
            style={tw`w-full h-full`}
            resizeMode="cover"
          />
        </View>
        <View>
          <Text style={tw`text-xs font-bold text-gray-800 mb-1`}>
            {item.name}
          </Text>
          <Text style={tw`text-[11px] text-gray-400 font-medium`}>
            {item.orders}
          </Text>
        </View>
      </View>
      <Text style={tw`text-xs font-bold text-orange-500`}>{item.price}</Text>
    </TouchableOpacity>
  );
}

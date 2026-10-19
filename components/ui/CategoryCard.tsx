import { Ionicons } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";
import tw from "../../lib/tailwind";

export interface ServiceItem {
  id: string;
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  slug: string;
}

interface ServiceCardProps {
  item: ServiceItem;
  onPress: (item: ServiceItem) => void;
}

export const CategoryCard = ({ item, onPress }: ServiceCardProps) => {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => onPress(item)}
      style={tw`w-[31%] bg-[#F9F9F7] rounded-2xl py-6 px-2 items-center justify-center border border-gray-100/50`}
    >
      <View style={tw`mb-3`}>
        <Ionicons name={item.icon} size={48} color="#5B7410" />
      </View>

      <Text
        style={tw`text-xs font-Manrope-SemiBold.ttf text-[#232323] text-center`}
      >
        {item.name}
      </Text>
    </TouchableOpacity>
  );
};

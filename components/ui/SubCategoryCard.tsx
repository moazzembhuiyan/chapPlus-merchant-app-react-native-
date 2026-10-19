import { Ionicons } from "@expo/vector-icons";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import tw from "../../lib/tailwind";

export interface CategoryFilterItem {
  id: string;
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
}

const CATEGORY_ITEMS: CategoryFilterItem[] = [
  { id: "1", name: "Fashion", icon: "shirt-outline" },
  { id: "2", name: "Glossary", icon: "basket-outline" },
  { id: "3", name: "Electronics", icon: "phone-portrait-outline" },
  { id: "4", name: "Glossary", icon: "basket-outline" },
  { id: "5", name: "Beauty", icon: "flask-outline" },
];

interface SubCategoryBarProps {
  selectedCategory: string;
  onSelectCategory: (categoryName: string) => void;
}

export const SubCategoryBar = ({
  selectedCategory,
  onSelectCategory,
}: SubCategoryBarProps) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={tw`px-5 gap-4 py-4`}
    >
      {CATEGORY_ITEMS.map((item) => {
        const isSelected = selectedCategory === item.name;
        return (
          <TouchableOpacity
            key={item.id}
            onPress={() => onSelectCategory(item.name)}
            activeOpacity={0.8}
            style={tw`items-center`}
          >
            {/* Circular Icon Wrapper */}
            <View
              style={tw`w-16 h-16 rounded-full items-center justify-center bg-[#F4F4F4] ${
                isSelected ? "border-2 border-[#F15A24] bg-white" : ""
              }`}
            >
              <Ionicons
                name={item.icon}
                size={26}
                color={isSelected ? "#F15A24" : "#6B7280"}
              />
            </View>

            {/* Label */}
            <Text
              style={tw`text-[10px] font-Manrope-Medium.ttf mt-1.5 ${
                isSelected ? "text-[#4B4B4B] " : "text-[#4B4B4B]"
              }`}
            >
              {item.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

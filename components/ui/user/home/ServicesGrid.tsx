// components/ui/ServicesGrid.tsx
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";
import tw from "../../../../lib/tailwind";

export interface ServiceItem {
  id: string;
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  isMore?: boolean;
}

const SERVICES: ServiceItem[] = [
  { id: "1", name: "Shops", icon: "bag-handle" },
  { id: "2", name: "Hotels", icon: "business" },
  { id: "3", name: "Transports", icon: "bus" },
  { id: "4", name: "More", icon: "grid-outline", isMore: true },
];

interface ServicesGridProps {
  onSelectService?: (service: ServiceItem) => void;
}

export const ServicesGrid = ({ onSelectService }: ServicesGridProps) => {
  const router = useRouter();

  const handlePress = (item: ServiceItem) => {
    if (item.isMore) {
      router.push("/all-category");
    } else if (onSelectService) {
      onSelectService(item);
    } else {
      router.push({
        pathname: "/category-products",
        params: { title: item.name, category: item.name.toLowerCase() },
      });
    }
  };

  return (
    <View style={tw`flex-row justify-between px-5`}>
      {SERVICES.map((item) => {
        const iconColor = item.isMore ? "#F15A24" : "#5B7410";

        return (
          <TouchableOpacity
            key={item.id}
            activeOpacity={0.75}
            onPress={() => handlePress(item)}
            style={tw`items-center`}
          >
            {/* Icon Circle */}
            <View
              style={tw`w-18 h-18 rounded-full bg-[#F5F5F5] items-center justify-center mb-2`}
            >
              <Ionicons name={item.icon} size={28} color={iconColor} />
            </View>

            {/* Label */}
            <Text style={tw`text-xs font-semibold text-[#4B4B4B] text-center`}>
              {item.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

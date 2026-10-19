import {
  Image,
  ImageSourcePropType,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import tw from "../../../lib/tailwind";

export interface OrderCardProps {
  orderId: string;
  title: string;
  itemCount: string | number;
  time: string;
  price: string;
  status: string;
  image: string | ImageSourcePropType;
  onPress?: () => void;
}

const getStatusBadgeStyle = (status: string) => {
  const normalized = (status || "").toLowerCase().trim();
  switch (normalized) {
    case "paid":
      return {
        bg: "bg-blue-50 border-blue-200",
        text: "text-blue-700",
      };
    case "processing":
      return {
        bg: "bg-amber-50 border-amber-200",
        text: "text-amber-700",
      };
    case "ready":
    case "ready for pickup":
    case "ready_for_pickup":
      return {
        bg: "bg-purple-50 border-purple-200",
        text: "text-purple-700",
      };
    case "on the way":
    case "on_the_way":
    case "picked_up":
      return {
        bg: "bg-sky-50 border-sky-200",
        text: "text-sky-700",
      };
    case "delivered":
      return {
        bg: "bg-emerald-50 border-emerald-200",
        text: "text-emerald-700",
      };
    case "canceled":
    case "cancelled":
    case "failed":
      return {
        bg: "bg-rose-50 border-rose-200",
        text: "text-rose-600",
      };
    default:
      return {
        bg: "bg-gray-100 border-gray-200",
        text: "text-gray-700",
      };
  }
};

export function RestaurantOrderCard({
  orderId,
  title,
  itemCount,
  time,
  price,
  status,
  image,
  onPress,
}: OrderCardProps) {
  const badgeStyle = getStatusBadgeStyle(status);

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={tw`bg-white rounded-2xl border border-gray-100 p-4 mb-3.5 shadow-sm`}
    >
      {/* Header: Order ID */}
      <View style={tw`pb-2.5 border-b border-gray-100 mb-3 flex-row justify-between items-center`}>
        <Text style={tw`text-xs font-bold text-orange-500`}>#{orderId}</Text>
        <Text style={tw`text-[11px] text-gray-400 font-medium`}>{time}</Text>
      </View>

      {/* Body: Image & Order Details */}
      <View style={tw`flex-row items-center justify-between`}>
        <View style={tw`flex-row items-center flex-1 mr-2`}>
          {/* Item Image */}
          <View
            style={tw`w-16 h-16 rounded-xl bg-gray-50 overflow-hidden mr-3 items-center justify-center border border-gray-100`}
          >
            <Image
              source={typeof image === "string" ? { uri: image } : image}
              style={tw`w-full h-full`}
              resizeMode="cover"
            />
          </View>

          {/* Details */}
          <View style={tw`flex-1 justify-center`}>
            <Text
              style={tw`text-sm font-bold text-gray-800 mb-1`}
              numberOfLines={1}
            >
              {title}
            </Text>

            <View style={tw`flex-row items-center gap-x-2 mb-1`}>
              <Text style={tw`text-[11px] font-medium text-gray-400`}>
                {typeof itemCount === "number" && itemCount < 10
                  ? `0${itemCount} Item${itemCount > 1 ? "s" : ""}`
                  : `${itemCount}`}
              </Text>
            </View>

            <Text style={tw`text-sm font-bold text-orange-500`}>
              {price}
            </Text>
          </View>
        </View>

        {/* Status Badge */}
        <View
          style={tw`px-3 py-1 rounded-full border ${badgeStyle.bg}`}
        >
          <Text style={tw`text-[11px] font-semibold ${badgeStyle.text}`}>
            {status}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

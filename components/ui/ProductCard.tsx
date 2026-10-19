import { Ionicons } from "@expo/vector-icons";
import {
  Image,
  ImageSourcePropType,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import tw from "../../lib/tailwind";

export interface Product {
  id: string;
  title: string;
  category: string;
  price: number;
  unit?: string;
  rating: number;
  reviewsCount: string;
  image: ImageSourcePropType;
  isFavorite?: boolean;
}

interface ProductCardProps {
  product: Product;
  onPress?: () => void;
  onFavoriteToggle?: (id: string) => void;
  onAddToCart?: (product: Product) => void;
}

export const ProductCard = ({
  product,
  onPress,
  onFavoriteToggle,
  onAddToCart,
}: ProductCardProps) => {
  return (
    <TouchableOpacity
      activeOpacity={0.5}
      onPress={onPress}
      style={tw`bg-[#F8F9FA] rounded-2xl p-3 w-[48%] mb-3.5 flex-col justify-between`}
    >
      {/* Image Container with Heart Button */}
      <View
        style={tw`relative w-full h-36 bg-white rounded-xl items-center justify-center p-2 mb-2.5`}
      >
        {/* Favorite Toggle Button */}
        <TouchableOpacity
          activeOpacity={0.1}
          onPress={() => onFavoriteToggle?.(product.id)}
          style={tw`absolute top-2 right-2 z-10 w-7 h-7 border border-[#E5E5E5] bg-white rounded-full items-center justify-center shadow-sm`}
        >
          <Ionicons
            name={product.isFavorite !== false ? "heart" : "heart-outline"}
            size={16}
            color="#FF5A1F"
          />
        </TouchableOpacity>

        {/* Product Image */}
        <Image
          source={product.image}
          style={tw`w-full h-full`}
          resizeMode="contain"
        />
      </View>

      {/* Product Information */}
      <View>
        {/* Title & Star Rating */}
        <View style={tw`flex-row items-center justify-between mb-1.5`}>
          <Text
            style={tw`font-Manrope-SemiBold.ttf text-xs text-[#303030] flex-1 mr-1`}
            numberOfLines={1}
          >
            {product.title}
          </Text>

          <View style={tw`flex-row items-center gap-0.5`}>
            <Ionicons name="star" size={12} color="#FDC700" />
            <Text style={tw`text-xs font-Manrope-Regular.ttf text-[#4A5565]`}>
              {product.rating}
            </Text>
            <Text
              style={tw`text-[10px] font-Manrope-Regular.ttf text-[#4A5565]`}
            >
              ({product.reviewsCount})
            </Text>
          </View>
        </View>

        {/* Price & Add to Cart */}
        <View style={tw`flex-row items-center justify-between mt-1`}>
          <View style={tw`flex-row items-baseline`}>
            <Text
              style={tw`text-[16px] font-Manrope-SemiBold.ttf text-[#303030]`}
            >
              ${product.price}
            </Text>
            {product.unit && (
              <Text style={tw`text-[10px] text-gray-400 ml-0.5`}>
                /{product.unit}
              </Text>
            )}
          </View>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => onAddToCart?.(product)}
            style={tw`w-7 h-7 bg-white rounded-full items-center justify-center  shadow-sm`}
          >
            <Ionicons name="cart-outline" size={15} color="#4B5563" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

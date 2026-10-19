import { Feather, FontAwesome, Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import tw from "../../../lib/tailwind";
import { useUserProfileQuery } from "../../redux/authApi";
import {
  useDeleteRestaurantFoodMutation,
  useGetRestaurantFoodByIdQuery,
  useToggleRestaurantFoodStatusMutation,
} from "../../redux/restaurantMerchantApi";

const FALLBACK_FOOD_IMAGE =
  "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=800";

const formatPrice = (price: number | string | undefined | null, curr: string) => {
  const num = typeof price === "number" ? price : parseFloat(String(price || 0)) || 0;
  if (curr === "USD" || curr === "$") return `$${num.toFixed(2)}`;
  return `${curr} ${num.toFixed(2)}`;
};

export default function ProductDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();

  // Merchant Profile
  const { data: userProfile } = useUserProfileQuery({});
  const merchantProfile = userProfile?.data?.merchant_profile;
  const merchantCurrency = merchantProfile?.currency || "USD";
  const restaurantName = merchantProfile?.business_name || "Restaurant Menu";

  // Food Query
  const { data: foodData, isLoading } = useGetRestaurantFoodByIdQuery(id!, {
    skip: !id,
  });
  const [deleteFood, { isLoading: isDeleting }] =
    useDeleteRestaurantFoodMutation();
  const [toggleStatus, { isLoading: isToggling }] =
    useToggleRestaurantFoodStatusMutation();

  const product = foodData?.data?.product;

  const imagesList =
    product?.images && product.images.length > 0
      ? product.images.map((img: any) => img.image_url)
      : product?.primary_image
        ? [product.primary_image]
        : [FALLBACK_FOOD_IMAGE];

  const [selectedImage, setSelectedImage] = useState<string>(imagesList[0]);
  const [isActive, setIsActive] = useState<boolean>(true);

  useEffect(() => {
    if (imagesList.length > 0) {
      setSelectedImage(imagesList[0]);
    }
  }, [product]);

  useEffect(() => {
    if (product) {
      setIsActive(Boolean(product.is_active));
    }
  }, [product?.is_active]);

  const handleToggleStatus = async () => {
    if (!id || isToggling) return;
    const nextStatus = !isActive;
    setIsActive(nextStatus);
    try {
      await toggleStatus({ id, is_active: nextStatus }).unwrap();
      Toast.show({
        type: "success",
        text1: nextStatus ? "Item Available" : "Item Marked Sold Out",
        text2: nextStatus
          ? "Customers can now view and order this dish."
          : "This dish is marked unavailable.",
      });
    } catch (err: any) {
      setIsActive(!nextStatus);
      Toast.show({
        type: "error",
        text1: "Update Failed",
        text2: err?.data?.message || "Failed to update item availability.",
      });
    }
  };

  const handleDelete = () => {
    if (!id) return;

    Alert.alert(
      "Delete Food Item",
      `Are you sure you want to remove "${product?.name || "this item"}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteFood(id).unwrap();
              Toast.show({
                type: "success",
                text1: "Item Removed",
                text2: "Food item has been deleted.",
              });
              router.back();
            } catch (err: any) {
              console.log("Delete food item error:", err);
              Toast.show({
                type: "error",
                text1: "Delete Failed",
                text2: err?.data?.message || "Failed to delete food item.",
              });
            }
          },
        },
      ],
    );
  };

  if (isLoading) {
    return (
      <View style={tw`flex-1 bg-white items-center justify-center`}>
        <ActivityIndicator size="large" color="#658210" />
        <Text style={tw`text-xs text-gray-400 mt-3 font-medium`}>
          Loading details...
        </Text>
      </View>
    );
  }

  if (!product) {
    return (
      <View style={tw`flex-1 bg-white items-center justify-center p-5`}>
        <Text style={tw`text-base font-bold text-gray-800 mb-2`}>
          Item Not Found
        </Text>
        <Text style={tw`text-xs text-gray-400 mb-6 text-center`}>
          This food item could not be retrieved.
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          style={tw`px-6 py-2.5 rounded-full bg-[#658210]`}
        >
          <Text style={tw`text-white text-xs font-bold`}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const currency = product.currency || merchantCurrency;
  const basePrice = Number(product.base_price || 0);
  const discountPrice =
    product.discount_price != null ? Number(product.discount_price) : null;
  const hasDiscount =
    discountPrice !== null && discountPrice > 0 && discountPrice < basePrice;
  const discountPercent = hasDiscount
    ? Math.round(((basePrice - discountPrice!) / basePrice) * 100)
    : 0;

  return (
    <View style={tw`flex-1 bg-white relative`}>
      <StatusBar style="dark" />
      <SafeAreaView style={tw`bg-white`} />

      {/* Floating Back Button */}
      <View style={tw`absolute top-12 left-5 z-20`}>
        <TouchableOpacity
          onPress={() => router.back()}
          activeOpacity={0.8}
          style={tw`w-10 h-10 rounded-full bg-white items-center justify-center shadow-md`}
        >
          <Ionicons name="chevron-back" size={20} color="#1F2937" />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={tw`pb-28`}
      >
        {/* Main Hero Image */}
        <View
          style={tw`w-full h-72 items-center justify-center bg-gray-50/50 pt-8`}
        >
          <Image
            source={{ uri: selectedImage || FALLBACK_FOOD_IMAGE }}
            style={tw`w-64 h-64 rounded-2xl`}
            resizeMode="cover"
          />
        </View>

        {/* Thumbnail Selector List */}
        {imagesList.length > 1 && (
          <View style={tw`my-4`}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={tw`px-5 gap-x-3`}
            >
              {imagesList.map((imgUri: string, index: number) => {
                const isSelected = selectedImage === imgUri;
                return (
                  <TouchableOpacity
                    key={index}
                    activeOpacity={0.8}
                    onPress={() => setSelectedImage(imgUri)}
                    style={tw`w-14 h-14 rounded-2xl overflow-hidden border ${
                      isSelected ? "border-orange-500" : "border-gray-100"
                    } bg-gray-50`}
                  >
                    <Image
                      source={{ uri: imgUri }}
                      style={tw`w-full h-full`}
                      resizeMode="cover"
                    />
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* Details Content Container */}
        <View style={tw`px-5 pt-3`}>
          {/* Title and Category Row */}
          <View style={tw`flex-row items-center justify-between mb-1`}>
            <Text
              style={tw`text-lg font-bold text-gray-800 flex-1 mr-2`}
              numberOfLines={2}
            >
              {product.name}
            </Text>
            {product.category && (
              <View
                style={tw`bg-orange-50 px-3 py-1 rounded-full border border-orange-100`}
              >
                <Text style={tw`text-[10px] font-semibold text-orange-500`}>
                  {product.category.name}
                </Text>
              </View>
            )}
          </View>

          {/* Price & Status Row */}
          <View style={tw`flex-row items-center justify-between mb-4 mt-1`}>
            {/* Price display with discount support */}
            <View style={tw`flex-row items-baseline gap-x-2`}>
              <Text style={tw`text-lg font-bold text-orange-500`}>
                {formatPrice(hasDiscount ? discountPrice : basePrice, currency)}
              </Text>
              {hasDiscount && (
                <>
                  <Text
                    style={tw`text-xs font-medium text-gray-400 line-through`}
                  >
                    {formatPrice(basePrice, currency)}
                  </Text>
                  {discountPercent > 0 && (
                    <View
                      style={tw`bg-red-50 border border-red-200 px-2 py-0.5 rounded-full`}
                    >
                      <Text style={tw`text-[10px] font-bold text-red-600`}>
                        -{discountPercent}%
                      </Text>
                    </View>
                  )}
                </>
              )}
            </View>

            {/* Interactive Availability Toggle Switch */}
            <View style={tw`flex-row items-center gap-x-1.5`}>
              <View
                style={tw`px-2.5 py-0.5 rounded-full ${
                  isActive
                    ? "bg-green-50 border border-green-200"
                    : "bg-gray-100 border border-gray-200"
                }`}
              >
                <Text
                  style={tw`text-[10px] font-semibold ${
                    isActive ? "text-green-700" : "text-gray-500"
                  }`}
                >
                  {isActive ? "Available" : "Sold Out"}
                </Text>
              </View>
              <Switch
                value={isActive}
                onValueChange={handleToggleStatus}
                disabled={isToggling}
                trackColor={{ false: "#E5E7EB", true: "#DCFCE7" }}
                thumbColor={isActive ? "#658210" : "#9CA3AF"}
                style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
              />
            </View>
          </View>

          {/* Description */}
          {product.description && (
            <View style={tw`mb-5`}>
              <Text style={tw`text-xs font-bold text-gray-800 mb-1.5`}>
                Description
              </Text>
              <Text style={tw`text-xs text-gray-500 leading-5`}>
                {product.description}
              </Text>
            </View>
          )}

          {/* Restaurant / Store Badge */}
          <View style={tw`border-t border-b border-gray-100 py-3.5 mb-6 gap-y-3`}>
            <View style={tw`flex-row items-center`}>
              <Feather
                name="coffee"
                size={16}
                color="#4B5563"
                style={tw`mr-3`}
              />
              <View>
                <Text style={tw`text-xs font-semibold text-gray-700`}>
                  {restaurantName}
                </Text>
                <Text style={tw`text-[10px] text-gray-400 mt-0.5`}>
                  Unit: {product.unit_type || "portion"}
                </Text>
              </View>
            </View>

            <View style={tw`flex-row items-center`}>
              <Feather
                name="shield"
                size={16}
                color="#4B5563"
                style={tw`mr-3`}
              />
              <View>
                <Text style={tw`text-xs font-semibold text-gray-700`}>
                  Fresh & Quality Assured
                </Text>
                <Text style={tw`text-[10px] text-gray-400 mt-0.5`}>
                  Prepared upon order confirmation
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Floating Action Bar */}
      <View
        style={[
          tw`absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-5 pt-3 flex-row items-center gap-x-3 shadow-lg`,
          { paddingBottom: Math.max(insets.bottom, 12) },
        ]}
      >
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleDelete}
          disabled={isDeleting}
          style={tw`flex-1 py-3.5 rounded-full bg-red-50 border border-red-200 items-center justify-center flex-row gap-x-1.5`}
        >
          {isDeleting ? (
            <ActivityIndicator size="small" color="#DC2626" />
          ) : (
            <>
              <Feather name="trash-2" size={14} color="#DC2626" />
              <Text style={tw`text-xs font-bold text-red-600`}>Remove Item</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => router.push(`/resturant-product-edit/${id}` as any)}
          style={tw`flex-1 py-3.5 rounded-full bg-[#658210] items-center justify-center shadow-sm flex-row gap-x-1.5`}
        >
          <Feather name="edit-2" size={14} color="#FFFFFF" />
          <Text style={tw`text-xs font-bold text-white`}>Edit Food</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

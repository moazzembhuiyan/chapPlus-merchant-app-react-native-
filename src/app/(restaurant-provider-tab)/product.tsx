import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Image,
  RefreshControl,
  ScrollView,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import BackButton from "../../../components/ui/BackButton";
import { restaruantAddIcon } from "../../../lib/icon";
import tw from "../../../lib/tailwind";
import { useUserProfileQuery } from "../../redux/authApi";
import {
  useGetRestaurantCategoriesQuery,
  useGetRestaurantFoodsQuery,
  useToggleRestaurantFoodStatusMutation,
} from "../../redux/restaurantMerchantApi";

const FALLBACK_FOOD_IMAGE =
  "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=800";

const formatPrice = (price: number | string | undefined | null, curr: string) => {
  const num = typeof price === "number" ? price : parseFloat(String(price || 0)) || 0;
  if (curr === "USD" || curr === "$") return `$${num.toFixed(2)}`;
  return `${curr} ${num.toFixed(2)}`;
};

export default function ProductListScreen() {
  const router = useRouter();
  const [selectedCategorySlug, setSelectedCategorySlug] = useState<string | null>(null);

  // Merchant Profile for fallback currency
  const { data: userProfile } = useUserProfileQuery({});
  const merchantCurrency =
    userProfile?.data?.merchant_profile?.currency || "USD";

  // Categories
  const { data: categoriesData } = useGetRestaurantCategoriesQuery();
  const categories = categoriesData?.data?.categories || [];

  // Foods Query
  const {
    data: foodsData,
    isLoading,
    isFetching,
    refetch,
  } = useGetRestaurantFoodsQuery({
    category_slug: selectedCategorySlug || undefined,
  });

  const [toggleStatus] = useToggleRestaurantFoodStatusMutation();

  const counts = foodsData?.data?.counts;
  const foodList = foodsData?.data?.products?.data || [];

  const handleToggle = async (id: number, newStatus: boolean) => {
    try {
      await toggleStatus({ id, is_active: newStatus }).unwrap();
      Toast.show({
        type: "success",
        text1: "Status Updated",
        text2: `Item is now ${newStatus ? "available" : "unavailable"}.`,
        visibilityTime: 2000,
      });
    } catch (err: any) {
      console.log("Toggle status error:", err);
      Toast.show({
        type: "error",
        text1: "Update Failed",
        text2: err?.data?.message || "Failed to update item availability.",
      });
    }
  };

  const handleAddPress = () => {
    router.push("/resturant-product-add");
  };

  // Build filter tabs: All + Categories
  const tabs = [
    {
      key: "all",
      slug: null,
      label: counts?.all != null ? `All (${counts.all})` : "All",
    },
    ...categories.map((cat) => ({
      key: String(cat.id),
      slug: cat.slug,
      label: cat.name,
    })),
  ];

  return (
    <View style={tw`flex-1 bg-white`}>
      <BackButton
        title="Food"
        showBackButton={false}
        showAddIcon={true}
        icon={restaruantAddIcon}
        onAddPress={handleAddPress}
      />

      {/* Category Filter Tabs */}
      <View style={tw`my-5`}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={tw`px-5 gap-x-2`}
        >
          {tabs.map((tab) => {
            const isActive = selectedCategorySlug === tab.slug;
            return (
              <TouchableOpacity
                key={tab.key}
                activeOpacity={0.7}
                onPress={() => setSelectedCategorySlug(tab.slug)}
                style={tw`px-4 py-2 rounded-full border ${
                  isActive
                    ? "bg-orange-50 border-orange-200"
                    : "bg-white border-gray-200"
                }`}
              >
                <Text
                  style={tw`text-xs font-semibold ${
                    isActive ? "text-amber-700" : "text-gray-400"
                  }`}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Content Area */}
      {isLoading ? (
        <View style={tw`flex-1 items-center justify-center p-5`}>
          <ActivityIndicator size="large" color="#658210" />
          <Text style={tw`text-xs text-gray-400 mt-3 font-medium`}>
            Loading food items...
          </Text>
        </View>
      ) : foodList.length === 0 ? (
        <ScrollView
          contentContainerStyle={tw`flex-1 items-center justify-center p-5 mb-16`}
          refreshControl={
            <RefreshControl
              refreshing={isFetching}
              onRefresh={refetch}
              colors={["#658210"]}
              tintColor="#658210"
            />
          }
        >
          <View>
            <Image source={require("../../../assets/app-icon/image 43.png")} />
          </View>
          <Text style={tw`text-lg font-bold text-gray-900 mt-5 mb-2`}>
            No food items found
          </Text>
          <Text style={tw`text-sm text-gray-400 text-center px-4`}>
            There are no food items created yet. Add your menu items to start selling.
          </Text>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleAddPress}
            style={tw`mt-8 border border-[#F86B17] w-full py-3 rounded-xl`}
          >
            <Text style={tw`text-center text-[#F86B17] text-sm font-semibold`}>
              + Add New
            </Text>
          </TouchableOpacity>
        </ScrollView>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={tw`px-5 pb-24`}
          refreshControl={
            <RefreshControl
              refreshing={isFetching}
              onRefresh={refetch}
              colors={["#658210"]}
              tintColor="#658210"
            />
          }
        >
          {foodList.map((item) => {
            const imageUrl =
              item.primary_image ||
              (item.images && item.images.length > 0
                ? item.images[0].image_url
                : null) ||
              FALLBACK_FOOD_IMAGE;

            const currency = item.currency || merchantCurrency;
            const priceDisplay = formatPrice(
              item.effective_price ?? item.base_price,
              currency,
            );

            return (
              <TouchableOpacity
                onPress={() => {
                  router.push({
                    pathname: "/resturant-product-details/[id]",
                    params: { id: String(item.id) },
                  });
                }}
                key={item.id}
                style={tw`bg-white rounded-2xl border border-gray-100 p-3.5 mb-3 flex-row items-center justify-between shadow-sm`}
              >
                <View style={tw`flex-row items-center flex-1 mr-3`}>
                  {/* Product Image */}
                  <View
                    style={tw`w-14 h-14 rounded-xl bg-gray-50 overflow-hidden mr-3`}
                  >
                    <Image
                      source={{ uri: imageUrl }}
                      style={tw`w-full h-full`}
                      resizeMode="cover"
                    />
                  </View>

                  {/* Product Details */}
                  <View style={tw`flex-1 justify-center`}>
                    <Text
                      style={tw`text-xs font-bold text-gray-800 mb-1`}
                      numberOfLines={1}
                    >
                      {item.name}
                    </Text>
                    <Text style={tw`text-xs font-bold text-orange-500`}>
                      {priceDisplay}
                    </Text>
                  </View>
                </View>

                {/* Status Toggle Switch */}
                <Switch
                  trackColor={{ false: "#E5E7EB", true: "#658210" }}
                  thumbColor="#FFFFFF"
                  ios_backgroundColor="#E5E7EB"
                  onValueChange={(newVal) => handleToggle(item.id, newVal)}
                  value={Boolean(item.is_active)}
                />
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}

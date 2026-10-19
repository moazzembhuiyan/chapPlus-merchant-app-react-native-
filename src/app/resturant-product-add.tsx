import { Feather, Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import Toast from "react-native-toast-message";
import BackButton from "../../components/ui/BackButton";
import { CategoryDropdown } from "../../components/ui/product/CategoryDropdown";
import { buildProductFormData } from "../../lib/buildProductFormData";
import { compressImages } from "../../lib/compressImage";
import { formatErrorMessage } from "../../lib/formatErrorMessage";
import tw from "../../lib/tailwind";
import { useUserProfileQuery } from "../redux/authApi";
import {
  FoodCategory,
  useCreateRestaurantCategoryMutation,
  useCreateRestaurantFoodMutation,
  useGetRestaurantCategoriesQuery,
} from "../redux/restaurantMerchantApi";

export default function AddFoodItemScreen() {
  const router = useRouter();

  // User Profile & Currency
  const { data: userProfile } = useUserProfileQuery({});
  const currency =
    userProfile?.data?.merchant_profile?.currency || "USD";

  // Categories API
  const { data: categoriesData, isLoading: isCategoriesLoading } =
    useGetRestaurantCategoriesQuery();
  const categories: FoodCategory[] = categoriesData?.data?.categories || [];

  const mainCategoryOptions = useMemo(
    () =>
      categories.map((cat) => ({
        id: String(cat.id),
        value: cat.name,
      })),
    [categories],
  );

  // Mutations
  const [createFood, { isLoading: isSubmitting }] =
    useCreateRestaurantFoodMutation();
  const [createCategory, { isLoading: isCreatingCategory }] =
    useCreateRestaurantCategoryMutation();

  // Form State
  const [selectedCategoryName, setSelectedCategoryName] = useState("");
  const [selectedCategorySlug, setSelectedCategorySlug] = useState("");
  const [selectedSubcategoryName, setSelectedSubcategoryName] = useState("");
  const [selectedSubcategorySlug, setSelectedSubcategorySlug] = useState("");

  const [images, setImages] = useState<string[]>([]);
  const [itemName, setItemName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [availability, setAvailability] = useState<"Available" | "Unavailable">(
    "Available",
  );

  // Modal State for Adding Custom Category
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [asSubcategory, setAsSubcategory] = useState(false);

  // Active Category Object (to extract its subcategories)
  const currentCategory = useMemo(() => {
    return categories.find((c) => c.slug === selectedCategorySlug);
  }, [categories, selectedCategorySlug]);

  const subcategoryOptions = useMemo(() => {
    if (!currentCategory?.subcategories) return [];
    return currentCategory.subcategories.map((sub) => ({
      id: String(sub.id),
      value: sub.name,
    }));
  }, [currentCategory]);

  const handlePickImage = async () => {
    try {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        Toast.show({
          type: "error",
          text1: "Permission required",
          text2: "Permission to access gallery is required!",
        });
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsMultipleSelection: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedUris = result.assets.map((asset) => asset.uri);
        setImages((prev) => [...prev, ...selectedUris]);
      }
    } catch (err) {
      console.log("Image picker error:", err);
      Toast.show({
        type: "error",
        text1: "Error picking images",
        text2: "An error occurred while opening the gallery.",
      });
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  // Create new category handler
  const handleCreateCategory = async () => {
    const trimmed = newCategoryName.trim();
    if (!trimmed) {
      Toast.show({
        type: "error",
        text1: "Name Required",
        text2: "Please enter a category name.",
      });
      return;
    }

    try {
      const parentId =
        asSubcategory && currentCategory?.id ? currentCategory.id : null;

      const res = await createCategory({
        name: trimmed,
        parent_id: parentId,
      }).unwrap();

      const created = res?.data?.category;

      Toast.show({
        type: "success",
        text1: "Category Created",
        text2: `"${trimmed}" was created successfully.`,
      });

      // Auto-select the newly created category
      if (parentId && currentCategory) {
        setSelectedSubcategoryName(created.name);
        setSelectedSubcategorySlug(created.slug);
      } else {
        setSelectedCategoryName(created.name);
        setSelectedCategorySlug(created.slug);
        setSelectedSubcategoryName("");
        setSelectedSubcategorySlug("");
      }

      setNewCategoryName("");
      setAsSubcategory(false);
      setIsCategoryModalOpen(false);
    } catch (err: any) {
      console.log("Create category error:", err);
      const msg = formatErrorMessage(err, "Failed to create category.");
      Toast.show({
        type: "error",
        text1: "Creation Failed",
        text2: msg,
      });
    }
  };

  const handleSubmit = async () => {
    // 1. Determine effective category slug (subcategory takes priority if selected)
    const effectiveCategorySlug =
      selectedSubcategorySlug || selectedCategorySlug;

    if (!effectiveCategorySlug) {
      Toast.show({
        type: "error",
        text1: "Category Required",
        text2: "Please select a food category.",
      });
      return;
    }

    if (!itemName.trim()) {
      Toast.show({
        type: "error",
        text1: "Name Required",
        text2: "Please enter the food item name.",
      });
      return;
    }

    const priceNum = parseFloat(price.trim());
    if (!price.trim() || isNaN(priceNum) || priceNum < 0) {
      Toast.show({
        type: "error",
        text1: "Valid Price Required",
        text2: "Please enter a valid price for the item.",
      });
      return;
    }

    if (images.length === 0) {
      Toast.show({
        type: "error",
        text1: "Image Required",
        text2: "Please upload at least one image of the food item.",
      });
      return;
    }

    try {
      // 1. Compress images for fast, reliable upload
      const optimizedImages = await compressImages(images);

      // 2. Generate clean SKU
      const cleanName = itemName.replace(/\s+/g, "").toUpperCase().slice(0, 6);
      const sku = `FOOD-${cleanName || "ITEM"}-${Date.now().toString().slice(-4)}`;

      // 3. Build multipart form data with category_slug
      const formData = buildProductFormData({
        category_slug: effectiveCategorySlug,
        name: itemName.trim(),
        description: description.trim(),
        base_price: price.trim(),
        unit_type: "portion",
        has_variants: false,
        is_active: availability === "Available",
        variants: [
          {
            sku,
            stock_quantity: 999,
          },
        ],
        images: optimizedImages,
      });

      // 4. Submit to backend
      await createFood(formData).unwrap();

      Toast.show({
        type: "success",
        text1: "Item Created",
        text2: "Food item added successfully!",
      });

      router.back();
    } catch (err: any) {
      console.log("Add food item error:", err);
      const errorMsg = formatErrorMessage(err, "Failed to create food item.");
      Toast.show({
        type: "error",
        text1: "Creation Failed",
        text2: errorMsg,
      });
    }
  };

  return (
    <View style={tw`flex-1 bg-white`}>
      <BackButton title="Add Items" />
      <KeyboardAwareScrollView
        style={tw`flex-1`}
        contentContainerStyle={tw`p-5 pb-10`}
        showsVerticalScrollIndicator={false}
        enableOnAndroid={true}
        extraScrollHeight={20}
      >
        {/* Food Item Main Category */}
        <View style={tw`mb-5`}>
          <View style={tw`flex-row items-center justify-between mb-1.5`}>
            <Text style={tw`text-xs font-bold text-gray-800`}>
              Food Item Category <Text style={tw`text-red-500`}>*</Text>
            </Text>
            <TouchableOpacity
              onPress={() => {
                setAsSubcategory(false);
                setIsCategoryModalOpen(true);
              }}
              activeOpacity={0.7}
              style={tw`flex-row items-center`}
            >
              <Feather name="plus" size={13} color="#658210" style={tw`mr-0.5`} />
              <Text style={tw`text-xs font-semibold text-[#658210]`}>
                Add Category
              </Text>
            </TouchableOpacity>
          </View>
          <CategoryDropdown
            isRequired
            value={selectedCategoryName}
            options={mainCategoryOptions}
            placeholder={
              isCategoriesLoading
                ? "Loading categories..."
                : "Select main category"
            }
            onSelect={(val) => {
              setSelectedCategoryName(val);
              const found = categories.find((c) => c.name === val);
              if (found) {
                setSelectedCategorySlug(found.slug);
              }
              // Reset subcategory whenever main category changes
              setSelectedSubcategoryName("");
              setSelectedSubcategorySlug("");
            }}
          />
        </View>

        {/* Subcategory Dropdown (shown whenever a main category is selected) */}
        {Boolean(selectedCategorySlug) && (
          <View style={tw`mb-5`}>
            <View style={tw`flex-row items-center justify-between mb-1.5`}>
              <Text style={tw`text-xs font-bold text-gray-800`}>
                Subcategory <Text style={tw`text-gray-400 font-normal`}>(Optional)</Text>
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setAsSubcategory(true);
                  setIsCategoryModalOpen(true);
                }}
                activeOpacity={0.7}
                style={tw`flex-row items-center`}
              >
                <Feather name="plus" size={13} color="#658210" style={tw`mr-0.5`} />
                <Text style={tw`text-xs font-semibold text-[#658210]`}>
                  Add Subcategory
                </Text>
              </TouchableOpacity>
            </View>
            <CategoryDropdown
              value={selectedSubcategoryName}
              options={subcategoryOptions}
              placeholder={
                subcategoryOptions.length > 0
                  ? `Select ${selectedCategoryName} subcategory (optional)`
                  : `No subcategories yet (tap "+ Add Subcategory")`
              }
              onSelect={(val) => {
                setSelectedSubcategoryName(val);
                const found = currentCategory?.subcategories?.find(
                  (s) => s.name === val,
                );
                if (found) {
                  setSelectedSubcategorySlug(found.slug);
                }
              }}
            />
          </View>
        )}

        {/* Food Item Images */}
        <View style={tw`mb-5`}>
          <Text style={tw`text-xs font-bold text-gray-800 mb-2.5`}>
            Food Item Image <Text style={tw`text-red-500`}>*</Text>
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={tw`flex-row items-center gap-x-3`}>
              {/* Upload Button */}
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={handlePickImage}
                style={tw`w-28 h-24 rounded-2xl border border-dashed border-gray-300 items-center justify-center bg-gray-50/30`}
              >
                <Feather name="plus" size={20} color="#6B7280" />
                <Text style={tw`text-xs font-semibold text-gray-500 mt-1`}>
                  Upload
                </Text>
              </TouchableOpacity>

              {/* Image Preview List */}
              {images.map((imgUri, index) => (
                <View
                  key={index}
                  style={tw`relative w-32 h-24 rounded-2xl overflow-hidden bg-gray-100`}
                >
                  <Image
                    source={{ uri: imgUri }}
                    style={tw`w-full h-full`}
                    resizeMode="cover"
                  />
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => handleRemoveImage(index)}
                    style={tw`absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-black/50 items-center justify-center`}
                  >
                    <Ionicons name="close" size={12} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Food Item Name */}
        <View style={tw`mb-5`}>
          <Text style={tw`text-xs font-bold text-gray-800 mb-2`}>
            Food Item Name <Text style={tw`text-red-500`}>*</Text>
          </Text>
          <View
            style={tw`border border-gray-100 rounded-full px-4 py-3.5 bg-white`}
          >
            <TextInput
              style={tw`text-xs text-gray-800 p-0`}
              placeholder="Enter the food item name (e.g. Classic Beef Burger)"
              placeholderTextColor="#C4C4C4"
              value={itemName}
              onChangeText={setItemName}
            />
          </View>
        </View>

        {/* Price */}
        <View style={tw`mb-5`}>
          <Text style={tw`text-xs font-bold text-gray-800 mb-2`}>
            Price ({currency}) <Text style={tw`text-red-500`}>*</Text>
          </Text>
          <View
            style={tw`border border-gray-100 rounded-full px-4 py-3.5 bg-white`}
          >
            <TextInput
              style={tw`text-xs text-gray-800 p-0`}
              placeholder="0.00"
              placeholderTextColor="#C4C4C4"
              keyboardType="numeric"
              value={price}
              onChangeText={setPrice}
            />
          </View>
        </View>

        {/* Description */}
        <View style={tw`mb-5`}>
          <Text style={tw`text-xs font-bold text-gray-800 mb-2`}>
            Description
          </Text>
          <View
            style={tw`border border-gray-100 rounded-3xl px-4 py-3.5 bg-white h-28`}
          >
            <TextInput
              style={tw`text-xs text-gray-800 p-0`}
              placeholder="Enter food item description, ingredients, etc."
              placeholderTextColor="#C4C4C4"
              multiline
              textAlignVertical="top"
              value={description}
              onChangeText={setDescription}
            />
          </View>
        </View>

        {/* Availability */}
        <View style={tw`mb-8`}>
          <Text style={tw`text-xs font-bold text-gray-800 mb-3`}>
            Availability
          </Text>
          <View style={tw`flex-row items-center gap-x-3`}>
            {/* Available Radio */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setAvailability("Available")}
              style={tw`flex-1 flex-row items-center border border-gray-100 rounded-2xl px-4 py-3 bg-white`}
            >
              <View
                style={tw`w-5 h-5 rounded-full border ${
                  availability === "Available"
                    ? "border-orange-500 justify-center items-center"
                    : "border-gray-300"
                } mr-2.5`}
              >
                {availability === "Available" && (
                  <View style={tw`w-2.5 h-2.5 rounded-full bg-orange-500`} />
                )}
              </View>
              <Text style={tw`text-xs font-medium text-gray-600`}>
                Available
              </Text>
            </TouchableOpacity>

            {/* Unavailable Radio */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setAvailability("Unavailable")}
              style={tw`flex-1 flex-row items-center border border-gray-100 rounded-2xl px-4 py-3 bg-white`}
            >
              <View
                style={tw`w-5 h-5 rounded-full border ${
                  availability === "Unavailable"
                    ? "border-orange-500 justify-center items-center"
                    : "border-gray-300"
                } mr-2.5`}
              >
                {availability === "Unavailable" && (
                  <View style={tw`w-2.5 h-2.5 rounded-full bg-orange-500`} />
                )}
              </View>
              <Text style={tw`text-xs font-medium text-gray-600`}>
                Unavailable
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Add items Button */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleSubmit}
          disabled={isSubmitting}
          style={tw`bg-[#658210] py-4 rounded-full items-center justify-center shadow-sm ${
            isSubmitting ? "opacity-70" : ""
          }`}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={tw`text-white text-sm font-bold`}>Add items</Text>
          )}
        </TouchableOpacity>
      </KeyboardAwareScrollView>

      {/* ── Modal for Creating New Category / Subcategory ── */}
      <Modal visible={isCategoryModalOpen} transparent animationType="fade">
        <TouchableWithoutFeedback onPress={() => setIsCategoryModalOpen(false)}>
          <View style={tw`flex-1 bg-black/50 justify-center px-6`}>
            <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
              <View style={tw`bg-white rounded-3xl p-6 shadow-xl`}>
                {/* Header */}
                <View style={tw`flex-row items-center justify-between mb-4`}>
                  <Text style={tw`text-base font-bold text-gray-900`}>
                    {asSubcategory && currentCategory
                      ? `Add Subcategory to "${currentCategory.name}"`
                      : "Create New Category"}
                  </Text>
                  <TouchableOpacity
                    onPress={() => setIsCategoryModalOpen(false)}
                    style={tw`w-7 h-7 rounded-full bg-gray-100 items-center justify-center`}
                  >
                    <Ionicons name="close" size={16} color="#666" />
                  </TouchableOpacity>
                </View>

                {/* Subcategory Toggle (if a parent category is currently selected) */}
                {currentCategory && (
                  <View style={tw`flex-row items-center mb-4 bg-gray-50 p-2.5 rounded-xl`}>
                    <TouchableOpacity
                      onPress={() => setAsSubcategory(!asSubcategory)}
                      style={tw`flex-row items-center flex-1`}
                    >
                      <View
                        style={tw`w-4 h-4 rounded border ${
                          asSubcategory
                            ? "bg-[#658210] border-[#658210]"
                            : "border-gray-400 bg-white"
                        } items-center justify-center mr-2`}
                      >
                        {asSubcategory && (
                          <Ionicons name="checkmark" size={12} color="#FFF" />
                        )}
                      </View>
                      <Text style={tw`text-xs text-gray-700 font-medium`}>
                        Create as subcategory of {currentCategory.name}
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}

                {/* Category Name Input */}
                <Text style={tw`text-xs font-bold text-gray-700 mb-2`}>
                  Category Name <Text style={tw`text-red-500`}>*</Text>
                </Text>
                <TextInput
                  placeholder="e.g. Chef's Specials, Late Night Bites"
                  placeholderTextColor="#9CA3AF"
                  value={newCategoryName}
                  onChangeText={setNewCategoryName}
                  style={tw`border border-gray-200 rounded-xl px-4 py-3 text-xs bg-white text-gray-800 mb-5`}
                  autoFocus
                />

                {/* Submit button */}
                <TouchableOpacity
                  onPress={handleCreateCategory}
                  disabled={isCreatingCategory}
                  style={tw`w-full bg-[#658210] py-3.5 rounded-full items-center justify-center shadow-sm ${
                    isCreatingCategory ? "opacity-70" : ""
                  }`}
                >
                  {isCreatingCategory ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={tw`text-white font-bold text-xs`}>
                      Create Category
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}

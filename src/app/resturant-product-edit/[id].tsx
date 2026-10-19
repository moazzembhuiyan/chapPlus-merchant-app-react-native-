import { Feather, Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
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
import BackButton from "../../../components/ui/BackButton";
import { CategoryDropdown } from "../../../components/ui/product/CategoryDropdown";
import { buildProductFormData } from "../../../lib/buildProductFormData";
import { compressImages } from "../../../lib/compressImage";
import { formatErrorMessage } from "../../../lib/formatErrorMessage";
import tw from "../../../lib/tailwind";
import { useUserProfileQuery } from "../../redux/authApi";
import {
  FoodCategory,
  useCreateRestaurantCategoryMutation,
  useGetRestaurantCategoriesQuery,
  useGetRestaurantFoodByIdQuery,
  useUpdateRestaurantFoodMutation,
} from "../../redux/restaurantMerchantApi";

interface RemoteImage {
  id: number;
  image_url: string;
  is_primary?: boolean;
}

export default function EditFoodItemScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  // User Profile & Currency
  const { data: userProfile } = useUserProfileQuery({});
  const merchantCurrency =
    userProfile?.data?.merchant_profile?.currency || "USD";

  // Fetch Existing Food Data
  const {
    data: foodData,
    isLoading: isFoodLoading,
    isError,
  } = useGetRestaurantFoodByIdQuery(id!, { skip: !id });

  const product = foodData?.data?.product;

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
  const [updateFood, { isLoading: isSubmitting }] =
    useUpdateRestaurantFoodMutation();
  const [createCategory, { isLoading: isCreatingCategory }] =
    useCreateRestaurantCategoryMutation();

  // Form State
  const [selectedCategoryName, setSelectedCategoryName] = useState("");
  const [selectedCategorySlug, setSelectedCategorySlug] = useState("");
  const [selectedSubcategoryName, setSelectedSubcategoryName] = useState("");
  const [selectedSubcategorySlug, setSelectedSubcategorySlug] = useState("");

  const [remoteImages, setRemoteImages] = useState<RemoteImage[]>([]);
  const [imagesToDelete, setImagesToDelete] = useState<number[]>([]);
  const [newImages, setNewImages] = useState<string[]>([]);

  const [itemName, setItemName] = useState("");
  const [price, setPrice] = useState("");
  const [discountPrice, setDiscountPrice] = useState("");
  const [description, setDescription] = useState("");
  const [availability, setAvailability] = useState<"Available" | "Unavailable">(
    "Available",
  );

  // Modal State for Adding Custom Category
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [asSubcategory, setAsSubcategory] = useState(false);

  // Prepopulate form when product data is received
  useEffect(() => {
    if (!product) return;

    setItemName(product.name || "");
    setPrice(
      product.base_price != null ? String(product.base_price) : "",
    );
    setDiscountPrice(
      product.discount_price != null ? String(product.discount_price) : "",
    );
    setDescription(product.description || "");
    setAvailability(product.is_active ? "Available" : "Unavailable");

    if (product.images && product.images.length > 0) {
      setRemoteImages(product.images);
    }

    // Set category hierarchy
    if (product.parent_category) {
      // It is a subcategory!
      setSelectedCategoryName(product.parent_category.name);
      setSelectedCategorySlug(product.parent_category.slug);
      if (product.category) {
        setSelectedSubcategoryName(product.category.name);
        setSelectedSubcategorySlug(product.category.slug);
      }
    } else if (product.category) {
      // Top-level category
      setSelectedCategoryName(product.category.name);
      setSelectedCategorySlug(product.category.slug);
      setSelectedSubcategoryName("");
      setSelectedSubcategorySlug("");
    }
  }, [product]);

  // Active Category Object (to extract its subcategories)
  const currentCategory = useMemo(() => {
    return categories.find((c) => c.slug === selectedCategorySlug);
  }, [categories, selectedCategorySlug]);

  const subcategoryOptions = useMemo(() => {
    if (!currentCategory?.subcategories) return [];
    return currentCategory.subcategories.map((sub: any) => ({
      id: String(sub.id),
      value: sub.name,
    }));
  }, [currentCategory]);

  const handlePickImages = async () => {
    try {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        Toast.show({
          type: "error",
          text1: "Permission required",
          text2: "Camera roll permission is required to upload photos.",
        });
        return;
      }

      const pickerResult = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsMultipleSelection: true,
        quality: 0.8,
      });

      if (!pickerResult.canceled && pickerResult.assets?.length) {
        const uris = pickerResult.assets.map((asset) => asset.uri);
        setNewImages((prev) => [...prev, ...uris]);
      }
    } catch (err) {
      console.log("Image picker error:", err);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to pick images.",
      });
    }
  };

  const handleRemoveRemoteImage = (img: RemoteImage) => {
    if (img.id) {
      setImagesToDelete((prev) => [...prev, img.id]);
    }
    setRemoteImages((prev) => prev.filter((i) => i.id !== img.id));
  };

  const handleRemoveNewImage = (index: number) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index));
  };

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
      let parentId: number | null = null;
      if (asSubcategory) {
        if (!currentCategory) {
          Toast.show({
            type: "error",
            text1: "Select Parent Category",
            text2: "Please select a main category first before adding a subcategory.",
          });
          return;
        }
        parentId = currentCategory.id;
      }

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
    if (!id) return;

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
        text2: "Please enter a valid price.",
      });
      return;
    }

    let discountPriceNum: number | undefined = undefined;
    if (discountPrice.trim()) {
      discountPriceNum = parseFloat(discountPrice.trim());
      if (isNaN(discountPriceNum) || discountPriceNum < 0) {
        Toast.show({
          type: "error",
          text1: "Invalid Discount Price",
          text2: "Discount price must be a valid positive number.",
        });
        return;
      }
      if (discountPriceNum >= priceNum) {
        Toast.show({
          type: "error",
          text1: "Invalid Discount Price",
          text2: "Discount price must be less than the regular price.",
        });
        return;
      }
    }

    const totalImages = remoteImages.length + newImages.length;
    if (totalImages === 0) {
      Toast.show({
        type: "error",
        text1: "Image Required",
        text2: "Please keep or upload at least one image of the food item.",
      });
      return;
    }

    try {
      const optimizedNewImages = await compressImages(newImages);

      const cleanName = itemName.replace(/\s+/g, "").toUpperCase().slice(0, 6);
      const sku = `FOOD-${cleanName || "ITEM"}-${id}`;

      const formData = buildProductFormData({
        category_slug: effectiveCategorySlug,
        name: itemName.trim(),
        description: description.trim(),
        base_price: price.trim(),
        discount_price: discountPrice.trim() || undefined,
        unit_type: product?.unit_type || "portion",
        has_variants: false,
        is_active: availability === "Available",
        variants: [
          {
            sku,
            stock_quantity: product?.total_stock ?? 999,
          },
        ],
        images: optimizedNewImages,
        images_to_delete:
          imagesToDelete.length > 0 ? imagesToDelete : undefined,
      });

      await updateFood({ id, formData }).unwrap();

      Toast.show({
        type: "success",
        text1: "Item Updated",
        text2: "Food item has been updated successfully!",
      });

      router.back();
    } catch (err: any) {
      console.log("Update food item error:", err);
      const errorMsg = formatErrorMessage(err, "Failed to update food item.");
      Toast.show({
        type: "error",
        text1: "Update Failed",
        text2: errorMsg,
      });
    }
  };

  if (isFoodLoading) {
    return (
      <View style={tw`flex-1 bg-white items-center justify-center`}>
        <ActivityIndicator size="large" color="#658210" />
        <Text style={tw`text-xs text-gray-400 mt-3 font-medium`}>
          Loading food item...
        </Text>
      </View>
    );
  }

  if (isError || !product) {
    return (
      <View style={tw`flex-1 bg-white items-center justify-center p-5`}>
        <Text style={tw`text-base font-bold text-gray-800 mb-2`}>
          Item Not Found
        </Text>
        <Text style={tw`text-xs text-gray-400 mb-6 text-center`}>
          Could not find the food item to edit.
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

  const currency = product?.currency || merchantCurrency;

  return (
    <View style={tw`flex-1 bg-white`}>
      <BackButton title="Edit Food Item" />
      <KeyboardAwareScrollView
        style={tw`flex-1`}
        contentContainerStyle={tw`p-5 pb-10`}
        showsVerticalScrollIndicator={false}
        enableOnAndroid={true}
        extraScrollHeight={20}
      >
        {/* Category Dropdown */}
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
            onSelect={(val: string) => {
              setSelectedCategoryName(val);
              const found = categories.find((c) => c.name === val);
              if (found) {
                setSelectedCategorySlug(found.slug);
              }
              setSelectedSubcategoryName("");
              setSelectedSubcategorySlug("");
            }}
          />
        </View>

        {/* Subcategory Dropdown */}
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
              onSelect={(val: string) => {
                setSelectedSubcategoryName(val);
                const found = currentCategory?.subcategories?.find(
                  (s: any) => s.name === val,
                );
                if (found) {
                  setSelectedSubcategorySlug(found.slug);
                }
              }}
            />
          </View>
        )}

        {/* Images Upload / Manage */}
        <View style={tw`mb-5`}>
          <Text style={tw`text-xs font-bold text-gray-800 mb-2.5`}>
            Food Images <Text style={tw`text-red-500`}>*</Text>
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={tw`flex-row items-center gap-x-3`}>
              {/* Add New Image Button */}
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={handlePickImages}
                style={tw`w-28 h-24 rounded-2xl border border-dashed border-gray-300 items-center justify-center bg-gray-50/30`}
              >
                <Feather name="plus" size={20} color="#6B7280" />
                <Text style={tw`text-xs font-semibold text-gray-500 mt-1`}>
                  Add Photo
                </Text>
              </TouchableOpacity>

              {/* Remote (Existing) Images */}
              {remoteImages.map((img) => (
                <View
                  key={`remote-${img.id}`}
                  style={tw`relative w-32 h-24 rounded-2xl overflow-hidden bg-gray-100 border border-gray-100`}
                >
                  <Image
                    source={{ uri: img.image_url }}
                    style={tw`w-full h-full`}
                    resizeMode="cover"
                  />
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => handleRemoveRemoteImage(img)}
                    style={tw`absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-red-600/80 items-center justify-center`}
                  >
                    <Ionicons name="close" size={14} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              ))}

              {/* Newly Picked Images */}
              {newImages.map((imgUri, index) => (
                <View
                  key={`new-${index}`}
                  style={tw`relative w-32 h-24 rounded-2xl overflow-hidden bg-gray-100 border border-green-200`}
                >
                  <Image
                    source={{ uri: imgUri }}
                    style={tw`w-full h-full`}
                    resizeMode="cover"
                  />
                  <View style={tw`absolute bottom-1 left-1 bg-green-600 px-1.5 py-0.5 rounded-full`}>
                    <Text style={tw`text-[8px] text-white font-bold`}>New</Text>
                  </View>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => handleRemoveNewImage(index)}
                    style={tw`absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/60 items-center justify-center`}
                  >
                    <Ionicons name="close" size={14} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Item Name */}
        <View style={tw`mb-5`}>
          <Text style={tw`text-xs font-bold text-gray-800 mb-2`}>
            Food Item Name <Text style={tw`text-red-500`}>*</Text>
          </Text>
          <View
            style={tw`border border-gray-100 rounded-full px-4 py-3.5 bg-white`}
          >
            <TextInput
              style={tw`text-xs text-gray-800 p-0`}
              placeholder="e.g. Classic Beef Burger"
              placeholderTextColor="#C4C4C4"
              value={itemName}
              onChangeText={setItemName}
            />
          </View>
        </View>

        {/* Price Row: Regular Price and Discount Price */}
        <View style={tw`flex-row gap-x-3 mb-5`}>
          <View style={tw`flex-1`}>
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

          <View style={tw`flex-1`}>
            <Text style={tw`text-xs font-bold text-gray-800 mb-2`}>
              Discount Price <Text style={tw`text-gray-400 font-normal`}>(Optional)</Text>
            </Text>
            <View
              style={tw`border border-gray-100 rounded-full px-4 py-3.5 bg-white`}
            >
              <TextInput
                style={tw`text-xs text-gray-800 p-0`}
                placeholder="0.00"
                placeholderTextColor="#C4C4C4"
                keyboardType="numeric"
                value={discountPrice}
                onChangeText={setDiscountPrice}
              />
            </View>
          </View>
        </View>

        {/* Description */}
        <View style={tw`mb-5`}>
          <Text style={tw`text-xs font-bold text-gray-800 mb-2`}>
            Description
          </Text>
          <View
            style={tw`border border-gray-100 rounded-2xl px-4 py-3 bg-white h-24`}
          >
            <TextInput
              style={tw`text-xs text-gray-800 p-0`}
              placeholder="Describe this dish, ingredients, preparation..."
              placeholderTextColor="#C4C4C4"
              multiline
              textAlignVertical="top"
              value={description}
              onChangeText={setDescription}
            />
          </View>
        </View>

        {/* Availability Toggle */}
        <View style={tw`mb-8`}>
          <Text style={tw`text-xs font-bold text-gray-800 mb-2`}>
            Availability Status
          </Text>
          <View style={tw`flex-row gap-x-3`}>
            {(["Available", "Unavailable"] as const).map((status) => {
              const isSelected = availability === status;
              return (
                <TouchableOpacity
                  key={status}
                  activeOpacity={0.8}
                  onPress={() => setAvailability(status)}
                  style={tw`flex-1 py-3 rounded-full border items-center justify-center ${
                    isSelected
                      ? status === "Available"
                        ? "bg-green-50 border-green-600"
                        : "bg-gray-100 border-gray-400"
                      : "bg-white border-gray-200"
                  }`}
                >
                  <Text
                    style={tw`text-xs font-semibold ${
                      isSelected
                        ? status === "Available"
                          ? "text-green-700"
                          : "text-gray-700"
                        : "text-gray-400"
                    }`}
                  >
                    {status === "Available" ? "Available to Order" : "Sold Out"}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          activeOpacity={0.85}
          disabled={isSubmitting}
          onPress={handleSubmit}
          style={tw`w-full py-4 rounded-full bg-[#658210] items-center justify-center shadow-md`}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={tw`text-sm font-bold text-white`}>Save Changes</Text>
          )}
        </TouchableOpacity>
      </KeyboardAwareScrollView>

      {/* Modal for Creating Category / Subcategory */}
      <Modal
        visible={isCategoryModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsCategoryModalOpen(false)}
      >
        <TouchableWithoutFeedback
          onPress={() => setIsCategoryModalOpen(false)}
        >
          <View
            style={tw`flex-1 bg-black/40 items-center justify-center px-6`}
          >
            <TouchableWithoutFeedback>
              <View style={tw`w-full bg-white rounded-3xl p-6 shadow-xl`}>
                <View
                  style={tw`flex-row items-center justify-between mb-4 pb-2 border-b border-gray-100`}
                >
                  <Text style={tw`text-base font-bold text-gray-800`}>
                    {asSubcategory
                      ? `Add Subcategory to "${selectedCategoryName}"`
                      : "Add New Food Category"}
                  </Text>
                  <TouchableOpacity
                    onPress={() => setIsCategoryModalOpen(false)}
                    style={tw`p-1`}
                  >
                    <Ionicons name="close" size={20} color="#9CA3AF" />
                  </TouchableOpacity>
                </View>

                <Text style={tw`text-xs text-gray-500 mb-3`}>
                  {asSubcategory
                    ? `Create a specialized subcategory under ${selectedCategoryName}.`
                    : "Create a new main category for your restaurant menu."}
                </Text>

                <View
                  style={tw`border border-gray-200 rounded-full px-4 py-3 bg-gray-50 mb-5`}
                >
                  <TextInput
                    style={tw`text-xs text-gray-800 p-0`}
                    placeholder="Category name (e.g. Burgers, Beverages, Desserts)"
                    placeholderTextColor="#9CA3AF"
                    value={newCategoryName}
                    onChangeText={setNewCategoryName}
                    autoFocus
                  />
                </View>

                <View style={tw`flex-row gap-x-3`}>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => {
                      setNewCategoryName("");
                      setIsCategoryModalOpen(false);
                    }}
                    style={tw`flex-1 py-3 rounded-full bg-gray-100 items-center justify-center`}
                  >
                    <Text style={tw`text-xs font-semibold text-gray-600`}>
                      Cancel
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={handleCreateCategory}
                    disabled={isCreatingCategory}
                    style={tw`flex-1 py-3 rounded-full bg-[#658210] items-center justify-center shadow-sm`}
                  >
                    {isCreatingCategory ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Text style={tw`text-xs font-bold text-white`}>
                        Create
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}

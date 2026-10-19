import * as ImagePicker from "expo-image-picker";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { Feather, Ionicons } from "@expo/vector-icons";
import BackButton from "../../../components/ui/BackButton";
import { CategoryDropdown } from "../../../components/ui/product/CategoryDropdown";
import { ColorSelection } from "../../../components/ui/product/ColorSelection";
import { ImageUpload } from "../../../components/ui/product/ImageUpload";
import { ProductName } from "../../../components/ui/product/ProductName";
import { RadioSelectGroup } from "../../../components/ui/product/RadioSelectGroup";
import { SizePickerGroup } from "../../../components/ui/product/SizePickerGroup";
import { UnitSelector } from "../../../components/ui/product/UnitSelector";
import {
  buildProductFormData,
  CategorySlug,
  VariantInput,
} from "../../../lib/buildProductFormData";
import { compressImages } from "../../../lib/compressImage";
import { formatErrorMessage } from "../../../lib/formatErrorMessage";
import tw from "../../../lib/tailwind";
import {
  useGetCategoriesQuery,
  useGetProductByIdQuery,
  useUpdateProductMutation,
} from "../../redux/productApi";
import { useUserProfileQuery } from "../../redux/authApi";

const MAIN_CATEGORIES: { id: string; value: string; slug: CategorySlug }[] = [
  { id: "1", value: "Fashion", slug: "fashion" },
  { id: "2", value: "Grocery", slug: "grocery" },
  { id: "3", value: "Electronics", slug: "electronics" },
  { id: "4", value: "Beauty", slug: "beauty" },
];

const FALLBACK_SUBCATEGORIES: Record<
  string,
  { id: string; value: string; slug: string }[]
> = {
  fashion: [
    { id: "f1", value: "Shirts", slug: "shirts" },
    { id: "f2", value: "Accessories", slug: "accessories" },
    { id: "f3", value: "Shoes", slug: "shoes" },
    { id: "f4", value: "Bags", slug: "bags" },
  ],
  grocery: [
    { id: "g1", value: "Fruits", slug: "fruits" },
    { id: "g2", value: "Vegetables", slug: "vegetables" },
    { id: "g3", value: "Spices", slug: "spices" },
    { id: "g4", value: "Ingredients", slug: "ingredients" },
  ],
  electronics: [
    { id: "e1", value: "Phones", slug: "phones" },
    { id: "e2", value: "Laptops", slug: "laptops" },
    { id: "e3", value: "MacBook", slug: "macbook" },
    { id: "e4", value: "Headphone", slug: "headphone" },
  ],
  beauty: [
    { id: "b1", value: "Skincare", slug: "skincare" },
    { id: "b2", value: "Makeup", slug: "makeup" },
    { id: "b3", value: "Hair care", slug: "hair-care" },
    { id: "b4", value: "Fragrance", slug: "fragrance" },
  ],
};

const FASHION_COLORS = [
  "Black",
  "White",
  "Red",
  "Blue",
  "Green",
  "Yellow",
  "Navy",
  "Beige",
];

const STANDARD_SIZES = ["XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL"];
const ELECTRONICS_RAM = ["4GB", "6GB", "8GB", "12GB", "16GB", "32GB", "64GB"];
const ELECTRONICS_STORAGE = ["64GB", "128GB", "256GB", "512GB", "1TB", "2TB"];
const BEAUTY_SHADES = [
  "Fair",
  "Medium",
  "Warm Sand",
  "Crimson Red",
  "Soft Nude",
  "Coral",
  "Berry",
];

interface RemoteImage {
  id: number;
  image_url: string;
  is_primary?: boolean;
}

export default function EditProductScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();

  const {
    data: productData,
    isLoading: loadingProduct,
    isError,
    refetch,
  } = useGetProductByIdQuery(id!, { skip: !id });

  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();
  const { data: userProfile } = useUserProfileQuery({});
  const currency = userProfile?.data?.merchant_profile?.currency || "KES";

  // ── Core Form State ──
  const [selectedCategoryName, setSelectedCategoryName] = useState<string>("Fashion");
  const [selectedSubcategorySlug, setSelectedSubcategorySlug] = useState<string>("");
  const [remoteImages, setRemoteImages] = useState<RemoteImage[]>([]);
  const [imagesToDelete, setImagesToDelete] = useState<number[]>([]);
  const [newImages, setNewImages] = useState<string[]>([]);
  const [name, setName] = useState<string>("");
  const [basePrice, setBasePrice] = useState<string>("");
  const [discountPrice, setDiscountPrice] = useState<string>("");
  const [stockQuantity, setStockQuantity] = useState<string>("50");
  const [description, setDescription] = useState<string>("");
  const [availability, setAvailability] = useState<string>("Available"); // "Available" | "Unavailable"

  // ── Fashion State ──
  const [collection, setCollection] = useState<string>("Men"); // "Men" | "Women" | "Kids"
  const [selectedColors, setSelectedColors] = useState<string[]>(["Black"]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>(["M"]);
  const [customSizes, setCustomSizes] = useState<string[]>([]);
  const [variantStocks, setVariantStocks] = useState<Record<string, string>>({});
  const [variantPrices, setVariantPrices] = useState<Record<string, string>>({});
  const [variantExistingIds, setVariantExistingIds] = useState<Record<string, number>>({});
  const [showVariantTable, setShowVariantTable] = useState<boolean>(false);
  const [excludedFashionCombinations, setExcludedFashionCombinations] = useState<string[]>([]);

  // ── Grocery State ──
  const [unitType, setUnitType] = useState<string>("kg");
  const [unitValue, setUnitValue] = useState<string>("1");

  // ── Electronics State ──
  const [selectedRam, setSelectedRam] = useState<string[]>([]);
  const [selectedStorage, setSelectedStorage] = useState<string[]>([]);
  const [excludedElectronicsCombinations, setExcludedElectronicsCombinations] = useState<string[]>([]);
  const [customElectronicsConfigs, setCustomElectronicsConfigs] = useState<{ ram: string; storage: string }[]>([]);
  const [isAddConfigModalVisible, setIsAddConfigModalVisible] = useState<boolean>(false);
  const [newConfigRam, setNewConfigRam] = useState<string>("");
  const [newConfigStorage, setNewConfigStorage] = useState<string>("");

  // ── Beauty State ──
  const [selectedShades, setSelectedShades] = useState<string[]>([]);
  const [netVolume, setNetVolume] = useState<string>("");

  // Track if initial prefill has been performed
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  // ── Active Main Category ──
  const currentCategory = useMemo(() => {
    return (
      MAIN_CATEGORIES.find(
        (c) => c.value.toLowerCase() === selectedCategoryName.toLowerCase(),
      ) || MAIN_CATEGORIES[0]
    );
  }, [selectedCategoryName]);

  // ── Subcategories from API ──
  const { data: catResponse } = useGetCategoriesQuery(
    { parent_category: currentCategory.slug },
    { skip: !currentCategory.slug },
  );

  const subcategoryOptions = useMemo(() => {
    const apiCategories = catResponse?.data?.categories;
    if (Array.isArray(apiCategories) && apiCategories.length > 0) {
      return apiCategories.map((c: any) => ({
        id: String(c.id),
        value: c.name,
        slug: c.slug,
      }));
    }
    return FALLBACK_SUBCATEGORIES[currentCategory.slug] || [];
  }, [catResponse, currentCategory.slug]);

  // ── Pre-fill Form when Product Data is Loaded ──
  useEffect(() => {
    const p = productData?.data?.product;
    if (!p || isInitialized) return;

    // 1. Name & General Info
    setName(p.name || "");
    setDescription(p.description || "");
    setBasePrice(p.base_price != null ? String(p.base_price) : "");
    setDiscountPrice(p.discount_price != null ? String(p.discount_price) : "");
    setStockQuantity(
      p.total_stock != null
        ? String(p.total_stock)
        : p.variants?.[0]?.stock_quantity != null
          ? String(p.variants[0].stock_quantity)
          : "50",
    );
    setAvailability(p.is_active ? "Available" : "Unavailable");

    // 2. Category & Subcategory
    let matchedCategorySlug = "fashion";
    let matchedSubcategorySlug = "";

    const parentCat = p.category?.parent || p.parent_category;
    if (parentCat) {
      const parentSlug = String(parentCat.slug || parentCat.name || "").toLowerCase();
      const foundMain = MAIN_CATEGORIES.find(
        (m) => m.slug === parentSlug || parentSlug.includes(m.slug),
      );
      if (foundMain) {
        matchedCategorySlug = foundMain.slug;
        setSelectedCategoryName(foundMain.value);
      }
      matchedSubcategorySlug = p.category?.slug || "";
      setSelectedSubcategorySlug(matchedSubcategorySlug);
    } else if (p.category) {
      const catSlug = String(p.category.slug || p.category.name || "").toLowerCase();
      const foundMain = MAIN_CATEGORIES.find(
        (m) => m.slug === catSlug || catSlug.includes(m.slug),
      );
      if (foundMain) {
        matchedCategorySlug = foundMain.slug;
        setSelectedCategoryName(foundMain.value);
      } else {
        matchedCategorySlug = "fashion";
        setSelectedCategoryName("Fashion");
      }
    }

    // 3. Remote Images
    const imgs: RemoteImage[] = [];
    if (Array.isArray(p.images) && p.images.length > 0) {
      p.images.forEach((img: any) => {
        const url = typeof img === "string" ? img : img?.image_url || img?.url;
        const imgId = typeof img === "object" ? img?.id : 0;
        if (url && !imgs.some((i) => i.image_url === url)) {
          imgs.push({ id: imgId || 0, image_url: url, is_primary: img?.is_primary });
        }
      });
    } else if (p.primary_image) {
      imgs.push({ id: 0, image_url: p.primary_image, is_primary: true });
    }
    setRemoteImages(imgs);

    // 4. Category-Specific Variants Reconstruction
    const existingVariants: any[] = Array.isArray(p.variants) ? p.variants : [];
    const loadedStocks: Record<string, string> = {};
    const loadedPrices: Record<string, string> = {};
    const loadedIds: Record<string, number> = {};

    if (matchedCategorySlug === "fashion") {
      const colorsSet = new Set<string>();
      const standardSizesSet = new Set<string>();
      const customSizesSet = new Set<string>();
      const validFashionKeys = new Set<string>();

      existingVariants.forEach((v) => {
        const attrs = v.attributes || {};
        if (attrs.Collection) setCollection(attrs.Collection);
        if (attrs.Color) colorsSet.add(attrs.Color);
        if (attrs.Size) {
          if (STANDARD_SIZES.includes(attrs.Size)) {
            standardSizesSet.add(attrs.Size);
          } else {
            customSizesSet.add(attrs.Size);
          }
        }

        const colorKey = attrs.Color || "Default";
        const sizeKey = attrs.Size || "Standard";
        const key = `${colorKey}-${sizeKey}`;
        validFashionKeys.add(key);

        if (v.id) loadedIds[key] = v.id;
        if (v.stock_quantity != null) loadedStocks[key] = String(v.stock_quantity);
        if (v.price_adjustment != null) loadedPrices[key] = String(v.price_adjustment);
      });

      if (colorsSet.size > 0) setSelectedColors(Array.from(colorsSet));
      if (standardSizesSet.size > 0) setSelectedSizes(Array.from(standardSizesSet));
      if (customSizesSet.size > 0) setCustomSizes(Array.from(customSizesSet));

      // Pre-exclude combinations that don't exist in saved variants
      if (existingVariants.length > 0) {
        const ghostFashionKeys: string[] = [];
        const allSizes = [...standardSizesSet, ...customSizesSet];
        colorsSet.forEach((c) => {
          allSizes.forEach((s) => {
            const key = `${c}-${s}`;
            if (!validFashionKeys.has(key)) ghostFashionKeys.push(key);
          });
        });
        if (ghostFashionKeys.length > 0) setExcludedFashionCombinations(ghostFashionKeys);
      }
    } else if (matchedCategorySlug === "electronics") {
      const ramSet = new Set<string>();
      const storageSet = new Set<string>();
      const validElectronicsKeys = new Set<string>();
      const loadedConfigs: { ram: string; storage: string }[] = [];

      existingVariants.forEach((v) => {
        const attrs = v.attributes || {};
        if (attrs.RAM) ramSet.add(attrs.RAM);
        if (attrs.Storage) storageSet.add(attrs.Storage);

        const rKey = attrs.RAM || "Standard RAM";
        const sKey = attrs.Storage || "Standard Storage";
        const key = `${rKey}-${sKey}`;
        validElectronicsKeys.add(key);
        loadedConfigs.push({ ram: rKey, storage: sKey });

        if (v.id) loadedIds[key] = v.id;
        if (v.stock_quantity != null) loadedStocks[key] = String(v.stock_quantity);
        if (v.price_adjustment != null) loadedPrices[key] = String(v.price_adjustment);
      });

      if (ramSet.size > 0) setSelectedRam(Array.from(ramSet));
      if (storageSet.size > 0) setSelectedStorage(Array.from(storageSet));
      setCustomElectronicsConfigs(loadedConfigs);

      // Pre-exclude Cartesian product combinations that don't exist in the database
      if (existingVariants.length > 0) {
        const ghostElectronicsKeys: string[] = [];
        ramSet.forEach((r) => {
          storageSet.forEach((st) => {
            const key = `${r}-${st}`;
            if (!validElectronicsKeys.has(key)) ghostElectronicsKeys.push(key);
          });
        });
        if (ghostElectronicsKeys.length > 0) setExcludedElectronicsCombinations(ghostElectronicsKeys);
      }
    } else if (matchedCategorySlug === "beauty") {
      const shadesSet = new Set<string>();

      existingVariants.forEach((v) => {
        const attrs = v.attributes || {};
        if (attrs.Shade) shadesSet.add(attrs.Shade);
        if (attrs.Volume) setNetVolume(attrs.Volume);

        const key = attrs.Shade || "Default";
        if (v.id) loadedIds[key] = v.id;
        if (v.stock_quantity != null) loadedStocks[key] = String(v.stock_quantity);
      });

      if (shadesSet.size > 0) setSelectedShades(Array.from(shadesSet));
    } else if (matchedCategorySlug === "grocery") {
      setUnitType(p.unit_type || "kg");
      setUnitValue(p.unit_value != null ? String(p.unit_value) : "1");
      if (existingVariants[0]?.id) {
        loadedIds["GROCERY"] = existingVariants[0].id;
      }
    }

    // Set base variant ID if present
    if (existingVariants[0]?.id && !loadedIds["BASE"]) {
      loadedIds["BASE"] = existingVariants[0].id;
    }

    setVariantStocks(loadedStocks);
    setVariantPrices(loadedPrices);
    setVariantExistingIds(loadedIds);
    setIsInitialized(true);
  }, [productData, isInitialized]);

  // ── Fashion Variant Combinations ──
  const fashionCombinations = useMemo(() => {
    if (currentCategory.slug !== "fashion") return [];
    const allSizes = [...selectedSizes, ...customSizes];
    const colors = selectedColors.length > 0 ? selectedColors : ["Default"];
    const sizes = allSizes.length > 0 ? allSizes : ["Standard"];

    const list: { key: string; color: string; size: string; label: string }[] = [];
    colors.forEach((c) => {
      sizes.forEach((s) => {
        const key = `${c}-${s}`;
        if (!excludedFashionCombinations.includes(key)) {
          const label = `${c !== "Default" ? c : ""} ${s !== "Standard" ? s : ""}`.trim() || "Standard";
          list.push({ key, color: c, size: s, label });
        }
      });
    });
    return list;
  }, [currentCategory.slug, selectedColors, selectedSizes, customSizes, excludedFashionCombinations]);

  // ── Electronics Variant Combinations ──
  const electronicsCombinations = useMemo(() => {
    if (currentCategory.slug !== "electronics") return [];
    if (selectedRam.length === 0 && selectedStorage.length === 0 && customElectronicsConfigs.length === 0) return [];

    const list: { key: string; ram: string; storage: string; label: string }[] = [];
    const seenKeys = new Set<string>();

    // 1. Pairs from selected RAM & Storage chips
    if (selectedRam.length > 0 || selectedStorage.length > 0) {
      const rams = selectedRam.length > 0 ? selectedRam : ["Standard RAM"];
      const storages = selectedStorage.length > 0 ? selectedStorage : ["Standard Storage"];

      rams.forEach((r) => {
        storages.forEach((st) => {
          const key = `${r}-${st}`;
          if (!excludedElectronicsCombinations.includes(key) && !seenKeys.has(key)) {
            seenKeys.add(key);
            const label = r !== "Standard RAM" && st !== "Standard Storage"
              ? `${r} / ${st}`
              : r !== "Standard RAM" ? r : st;
            list.push({ key, ram: r, storage: st, label });
          }
        });
      });
    }

    // 2. Custom explicitly added configurations
    customElectronicsConfigs.forEach((c) => {
      const key = `${c.ram}-${c.storage}`;
      if (!excludedElectronicsCombinations.includes(key) && !seenKeys.has(key)) {
        seenKeys.add(key);
        list.push({ key, ram: c.ram, storage: c.storage, label: `${c.ram} / ${c.storage}` });
      }
    });

    return list;
  }, [currentCategory.slug, selectedRam, selectedStorage, customElectronicsConfigs, excludedElectronicsCombinations]);

  // ── Image Handlers ──
  const handlePickImages = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Toast.show({
        type: "error",
        text1: "Permission Denied",
        text2: "Gallery access permission is required to upload images.",
      });
      return;
    }

    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.8,
      allowsMultipleSelection: true,
    });

    if (!res.canceled && res.assets && res.assets.length > 0) {
      const uris = res.assets.map((a) => a.uri);
      const compressed = await compressImages(uris);
      setNewImages((prev) => [...prev, ...compressed]);
    }
  };

  const handleRemoveNewImage = (index: number) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRemoveRemoteImage = (img: RemoteImage) => {
    if (img.id) {
      setImagesToDelete((prev) => [...prev, img.id]);
    }
    setRemoteImages((prev) => prev.filter((i) => i.image_url !== img.image_url));
  };

  // ── Validation & Submission ──
  const handleSubmit = async () => {
    if (!name.trim()) {
      Toast.show({
        type: "error",
        text1: "Required Field",
        text2: "Please enter product name",
      });
      return;
    }

    if (!basePrice.trim() || isNaN(Number(basePrice)) || Number(basePrice) <= 0) {
      Toast.show({
        type: "error",
        text1: "Invalid Price",
        text2: "Please enter a valid positive base price",
      });
      return;
    }

    if (!stockQuantity.trim() || isNaN(Number(stockQuantity)) || Number(stockQuantity) < 0) {
      Toast.show({
        type: "error",
        text1: "Invalid Stock",
        text2: "Please enter a valid stock quantity",
      });
      return;
    }

    const totalImagesCount = remoteImages.length + newImages.length;
    if (totalImagesCount === 0) {
      Toast.show({
        type: "error",
        text1: "Image Required",
        text2: "Please keep or add at least one product image",
      });
      return;
    }

    const categorySlug = selectedSubcategorySlug || currentCategory.slug;
    const baseStockNum = parseInt(stockQuantity, 10) || 0;

    let variants: VariantInput[] = [];
    let hasVariants = false;

    if (currentCategory.slug === "fashion") {
      const allSizes = [...selectedSizes, ...customSizes];
      const hasSpecifics = selectedColors.length > 0 || allSizes.length > 0;

      if (hasSpecifics && fashionCombinations.length > 0) {
        hasVariants = true;
        variants = fashionCombinations.map((combo) => {
          const itemStock = variantStocks[combo.key]
            ? parseInt(variantStocks[combo.key], 10)
            : baseStockNum;

          const priceAdj = variantPrices[combo.key]
            ? parseFloat(variantPrices[combo.key])
            : 0;

          const attrs: Record<string, string> = {};
          if (collection) attrs.Collection = collection;
          if (combo.color !== "Default") attrs.Color = combo.color;
          if (combo.size !== "Standard") attrs.Size = combo.size;

          const skuParts = [
            name.replace(/\s+/g, "").toUpperCase().slice(0, 6),
            combo.color !== "Default" ? combo.color.toUpperCase().slice(0, 3) : "",
            combo.size !== "Standard" ? combo.size.toUpperCase() : "",
          ].filter(Boolean);

          return {
            id: variantExistingIds[combo.key] || undefined,
            sku: skuParts.join("-"),
            stock_quantity: Math.max(0, itemStock),
            price_adjustment: isNaN(priceAdj) ? 0 : priceAdj,
            attributes: attrs,
          };
        });
      } else {
        variants = [
          {
            id: variantExistingIds["BASE"] || undefined,
            sku: `${name.replace(/\s+/g, "").toUpperCase().slice(0, 6)}-BASE`,
            stock_quantity: baseStockNum,
            attributes: collection ? { Collection: collection } : undefined,
          },
        ];
      }
    } else if (currentCategory.slug === "electronics") {
      if (electronicsCombinations.length > 0) {
        hasVariants = true;
        variants = electronicsCombinations.map((combo) => {
          const itemStock = variantStocks[combo.key]
            ? parseInt(variantStocks[combo.key], 10)
            : baseStockNum;
          const priceAdj = variantPrices[combo.key]
            ? parseFloat(variantPrices[combo.key])
            : 0;

          return {
            id: variantExistingIds[combo.key] || undefined,
            sku: `${name.replace(/\s+/g, "").toUpperCase().slice(0, 6)}-${combo.ram.replace(/\s+/g, "")}-${combo.storage.replace(/\s+/g, "")}`,
            stock_quantity: Math.max(0, itemStock),
            price_adjustment: isNaN(priceAdj) ? 0 : priceAdj,
            attributes: { RAM: combo.ram, Storage: combo.storage },
          };
        });
      } else {
        variants = [
          {
            id: variantExistingIds["BASE"] || undefined,
            sku: `${name.replace(/\s+/g, "").toUpperCase().slice(0, 6)}-BASE`,
            stock_quantity: baseStockNum,
          },
        ];
      }
    } else if (currentCategory.slug === "beauty") {
      if (selectedShades.length > 0) {
        hasVariants = true;
        variants = selectedShades.map((shade) => {
          const itemStock = variantStocks[shade]
            ? parseInt(variantStocks[shade], 10)
            : baseStockNum;

          const attrs: Record<string, string> = { Shade: shade };
          if (netVolume.trim()) attrs.Volume = netVolume.trim();

          return {
            id: variantExistingIds[shade] || undefined,
            sku: `${name.replace(/\s+/g, "").toUpperCase().slice(0, 6)}-${shade.replace(/\s+/g, "").toUpperCase()}`,
            stock_quantity: Math.max(0, itemStock),
            attributes: attrs,
          };
        });
      } else {
        const attrs: Record<string, string> = {};
        if (netVolume.trim()) attrs.Volume = netVolume.trim();
        variants = [
          {
            id: variantExistingIds["BASE"] || undefined,
            sku: `${name.replace(/\s+/g, "").toUpperCase().slice(0, 6)}-BASE`,
            stock_quantity: baseStockNum,
            attributes: Object.keys(attrs).length > 0 ? attrs : undefined,
          },
        ];
      }
    } else {
      // Grocery or default simple product
      variants = [
        {
          id: variantExistingIds["GROCERY"] || variantExistingIds["BASE"] || undefined,
          sku: `${name.replace(/\s+/g, "").toUpperCase().slice(0, 6)}-GROCERY`,
          stock_quantity: baseStockNum,
        },
      ];
    }

    try {
      const optimizedImages = await compressImages(newImages);

      const formData = buildProductFormData({
        category_slug: categorySlug,
        name: name.trim(),
        description: description.trim(),
        base_price: basePrice.trim(),
        discount_price: discountPrice.trim() || undefined,
        unit_type: currentCategory.slug === "grocery" ? unitType : "pcs",
        unit_value: currentCategory.slug === "grocery" ? unitValue : "1",
        has_variants: hasVariants,
        is_active: availability === "Available",
        variants,
        images: optimizedImages,
        images_to_delete: imagesToDelete.length > 0 ? imagesToDelete : undefined,
      });

      await updateProduct({ id: id!, formData }).unwrap();

      Toast.show({
        type: "success",
        text1: "Product Updated",
        text2: "Your product was updated successfully!",
      });

      router.back();
    } catch (err: any) {
      console.log("Update product error:", JSON.stringify(err, null, 2));
      const errorMsg = formatErrorMessage(err, "Failed to update product");

      Toast.show({
        type: "error",
        text1: "Update Failed",
        text2: errorMsg,
      });
    }
  };

  if (loadingProduct) {
    return (
      <View style={tw`flex-1 bg-white items-center justify-center`}>
        <ActivityIndicator size="large" color="#5A7314" />
        <Text style={tw`text-gray-400 text-sm mt-3`}>Loading product details...</Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={tw`flex-1 bg-white items-center justify-center px-5`}>
        <Text style={tw`text-gray-500 mb-3`}>Failed to load product details</Text>
        <TouchableOpacity
          onPress={() => refetch()}
          style={tw`bg-[#5A7314] px-5 py-2.5 rounded-full`}
        >
          <Text style={tw`text-white font-semibold`}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={tw`flex-1 bg-white`}>
      <BackButton title="Edit Product" />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={tw`flex-1`}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[
            tw`px-5 py-4 gap-y-5`,
            { paddingBottom: insets.bottom + 40 },
          ]}
        >
          {/* ── 1. Main Category Dropdown ── */}
          <CategoryDropdown
            label="Product Category"
            isRequired
            value={selectedCategoryName}
            options={MAIN_CATEGORIES.map((c) => ({ id: c.id, value: c.value }))}
            onSelect={(val) => {
              setSelectedCategoryName(val);
              setSelectedSubcategorySlug("");
            }}
          />

          {/* ── 2. Subcategory Dropdown (Optional) ── */}
          {subcategoryOptions.length > 0 && (
            <CategoryDropdown
              label="Subcategory"
              placeholder="Select Subcategory (optional)"
              value={
                subcategoryOptions.find((s) => s.slug === selectedSubcategorySlug)
                  ?.value
              }
              options={subcategoryOptions.map((s) => ({
                id: s.id,
                value: s.value,
              }))}
              onSelect={(val) => {
                const found = subcategoryOptions.find((s) => s.value === val);
                setSelectedSubcategorySlug(found ? found.slug : "");
              }}
            />
          )}

          {/* ── 3. Product Images (Existing + New) ── */}
          <View style={tw`gap-y-3`}>
            <Text style={tw`text-gray-800 font-medium text-sm`}>
              Product Images <Text style={tw`text-red-500`}>*</Text>
            </Text>

            {/* Existing Remote Images */}
            {remoteImages.length > 0 && (
              <View>
                <Text style={tw`text-gray-500 text-xs mb-1.5`}>Current Images:</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={tw`flex-row items-center gap-x-3`}>
                    {remoteImages.map((img) => (
                      <View key={img.image_url} style={tw`relative w-24 h-24`}>
                        <Image
                          source={{ uri: img.image_url }}
                          style={tw`w-24 h-24 rounded-xl border border-gray-200`}
                          resizeMode="cover"
                        />
                        <TouchableOpacity
                          onPress={() => handleRemoveRemoteImage(img)}
                          activeOpacity={0.7}
                          style={tw`absolute top-1 right-1 bg-black/60 rounded-full p-1`}
                        >
                          <Ionicons name="close" size={12} color="#FFF" />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                </ScrollView>
              </View>
            )}

            {/* Upload New Images */}
            <ImageUpload
              label={remoteImages.length > 0 ? "Add More Images" : undefined}
              images={newImages}
              onPickImage={handlePickImages}
              onRemoveImage={handleRemoveNewImage}
            />
          </View>

          {/* ── 4. Product Name ── */}
          <ProductName
            label="Product Name"
            isRequired
            placeholder="Enter the product name"
            value={name}
            onChangeText={setName}
          />

          {/* ── 5. Pricing: Base Price & Discount Price ── */}
          <View style={tw`flex-row gap-x-3`}>
            <View style={tw`flex-1`}>
              <ProductName
                label={
                  currentCategory.slug === "grocery"
                    ? `Price (${currency}) /Per ${unitType.toUpperCase()} *`
                    : `Price (${currency}) *`
                }
                placeholder="0.00"
                keyboardType="decimal-pad"
                value={basePrice}
                onChangeText={setBasePrice}
              />
            </View>

            <View style={tw`flex-1`}>
              <ProductName
                label={`Discount Price (${currency})`}
                placeholder="Optional"
                keyboardType="decimal-pad"
                value={discountPrice}
                onChangeText={setDiscountPrice}
              />
            </View>
          </View>

          {/* ── 6. Base / Default Stock Quantity ── */}
          <ProductName
            label="Stock Quantity"
            isRequired
            placeholder="e.g. 50"
            keyboardType="number-pad"
            value={stockQuantity}
            onChangeText={setStockQuantity}
          />

          {/* ── 7. Description ── */}
          <ProductName
            label="Description"
            placeholder="Enter product description"
            multiline
            numberOfLines={4}
            value={description}
            onChangeText={setDescription}
          />

          {/* ── CATEGORY-SPECIFIC SECTIONS ── */}

          {/* ── Fashion Section ── */}
          {currentCategory.slug === "fashion" && (
            <View style={tw`border border-gray-100 rounded-2xl p-4 bg-[#FAFAFA] gap-y-4`}>
              <Text style={tw`text-sm font-bold text-gray-800`}>
                Fashion Attributes
              </Text>

              {/* Collections Radio */}
              <RadioSelectGroup
                label="Collections"
                options={[
                  { label: "Men", value: "Men" },
                  { label: "Women", value: "Women" },
                  { label: "Kids", value: "Kids" },
                ]}
                selectedValue={collection}
                onSelect={setCollection}
              />

              {/* Color Selection */}
              <ColorSelection
                label="Color"
                options={FASHION_COLORS}
                selectedValue={selectedColors}
                multiSelect
                onSelect={(val) => setSelectedColors(val)}
              />

              {/* Size Picker Group (Standard + Custom) */}
              <SizePickerGroup
                label="Size"
                standardSizes={STANDARD_SIZES}
                selectedSizes={selectedSizes}
                customSizes={customSizes}
                onSizesChange={setSelectedSizes}
                onCustomSizesChange={setCustomSizes}
              />

              {/* Collapsible Variant Stock Breakdown */}
              {fashionCombinations.length > 1 && (
                <View style={tw`border border-gray-200 rounded-xl p-3 bg-white mt-2`}>
                  <TouchableOpacity
                    onPress={() => setShowVariantTable((prev) => !prev)}
                    style={tw`flex-row justify-between items-center`}
                  >
                    <Text style={tw`text-xs font-semibold text-gray-700`}>
                      Generated Variants ({fashionCombinations.length})
                    </Text>
                    <Text style={tw`text-xs text-[#5A7314] font-medium`}>
                      {showVariantTable ? "Hide details ▲" : "Adjust stock per variant ▼"}
                    </Text>
                  </TouchableOpacity>

                  {showVariantTable && (
                    <View style={tw`mt-3 gap-y-2`}>
                      <Text style={tw`text-[11px] text-gray-400 mb-1`}>
                        Set +Price and stock per variant (default stock: {stockQuantity || "0"}):
                      </Text>
                      {fashionCombinations.map((combo) => {
                        const adj = parseFloat(variantPrices[combo.key] || "0") || 0;
                        const base = parseFloat(basePrice || "0") || 0;
                        const total = (base + adj).toFixed(2);

                        return (
                          <View
                            key={combo.key}
                            style={tw`flex-row justify-between items-center py-1.5 border-b border-gray-100`}
                          >
                            <View style={tw`flex-1 mr-2`}>
                              <Text style={tw`text-xs font-medium text-gray-800`}>
                                {combo.label}
                              </Text>
                              {adj !== 0 && (
                                <Text style={tw`text-[10px] text-[#5A7314]`}>
                                  Total: {currency} {total}
                                </Text>
                              )}
                            </View>

                            <View style={tw`flex-row gap-x-1.5 items-center`}>
                              <TextInput
                                placeholder="+Price"
                                placeholderTextColor="#A0A0A0"
                                keyboardType="decimal-pad"
                                value={variantPrices[combo.key] || ""}
                                onChangeText={(t) =>
                                  setVariantPrices((prev) => ({
                                    ...prev,
                                    [combo.key]: t,
                                  }))
                                }
                                style={tw`border border-gray-200 rounded-lg px-2 py-1 text-xs w-16 text-center bg-gray-50`}
                              />
                              <TextInput
                                placeholder={stockQuantity || "0"}
                                placeholderTextColor="#A0A0A0"
                                keyboardType="number-pad"
                                value={variantStocks[combo.key] || ""}
                                onChangeText={(t) =>
                                  setVariantStocks((prev) => ({
                                    ...prev,
                                    [combo.key]: t,
                                  }))
                                }
                                style={tw`border border-gray-200 rounded-lg px-2 py-1 text-xs w-16 text-center bg-gray-50`}
                              />
                              <TouchableOpacity
                                onPress={() =>
                                  setExcludedFashionCombinations((prev) => [...prev, combo.key])
                                }
                                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                                style={tw`p-1.5 rounded-full bg-red-50 ml-1`}
                              >
                                <Ionicons name="trash-outline" size={13} color="#EF4444" />
                              </TouchableOpacity>
                            </View>
                          </View>
                        );
                      })}

                      {excludedFashionCombinations.length > 0 && (
                        <View style={tw`flex-row items-center justify-between bg-amber-50 border border-amber-200/80 rounded-lg p-2 mt-1`}>
                          <Text style={tw`text-[10px] text-amber-800`}>
                            {excludedFashionCombinations.length} combination(s) excluded
                          </Text>
                          <TouchableOpacity onPress={() => setExcludedFashionCombinations([])}>
                            <Text style={tw`text-[10px] font-bold text-amber-800 underline`}>
                              Restore All
                            </Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                  )}
                </View>
              )}
            </View>
          )}

          {/* ── Grocery Section ── */}
          {currentCategory.slug === "grocery" && (
            <View style={tw`border border-gray-100 rounded-2xl p-4 bg-[#FAFAFA] gap-y-4`}>
              <Text style={tw`text-sm font-bold text-gray-800`}>
                Grocery Units & Quantity
              </Text>
              <UnitSelector
                label="Unit Type & Measure"
                isRequired
                selectedUnit={unitType}
                unitValue={unitValue}
                onUnitChange={setUnitType}
                onValueChange={setUnitValue}
              />
            </View>
          )}

          {/* ── Electronics Section ── */}
          {currentCategory.slug === "electronics" && (
            <View style={tw`border border-gray-100 rounded-2xl p-4 bg-[#FAFAFA] gap-y-4`}>
              <Text style={tw`text-sm font-bold text-gray-800`}>
                Electronics Specifications
              </Text>
              <ColorSelection
                label="RAM Options"
                options={ELECTRONICS_RAM}
                selectedValue={selectedRam}
                multiSelect
                onSelect={setSelectedRam}
              />
              <ColorSelection
                label="Storage Options"
                options={ELECTRONICS_STORAGE}
                selectedValue={selectedStorage}
                multiSelect
                onSelect={setSelectedStorage}
              />

              {/* Add Specific Configuration Button */}
              <View style={tw`flex-row justify-between items-center mt-1`}>
                <Text style={tw`text-xs font-bold text-gray-700`}>
                  Configurations ({electronicsCombinations.length})
                </Text>
                <TouchableOpacity
                  onPress={() => setIsAddConfigModalVisible(true)}
                  style={tw`flex-row items-center bg-[#5A7314]/10 border border-[#5A7314]/30 px-3 py-1.5 rounded-full`}
                >
                  <Ionicons name="add-circle-outline" size={14} color="#5A7314" style={tw`mr-1`} />
                  <Text style={tw`text-xs font-semibold text-[#5A7314]`}>
                    + Add Specific Pair
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Configuration Pricing & Stock Breakdown */}
              {electronicsCombinations.length > 0 && (
                <View style={tw`border border-gray-200 rounded-xl p-3 bg-white mt-1`}>
                  <Text style={tw`text-xs font-bold text-gray-800 mb-0.5`}>
                    Configuration Pricing & Stock ({electronicsCombinations.length})
                  </Text>
                  <Text style={tw`text-[11px] text-gray-400 mb-2.5`}>
                    Base price is {currency} {basePrice || "0.00"}. Enter "+ Price Adj" if upgraded configurations cost more.
                  </Text>

                  <View style={tw`gap-y-2`}>
                    {electronicsCombinations.map((combo) => {
                      const adj = parseFloat(variantPrices[combo.key] || "0") || 0;
                      const base = parseFloat(basePrice || "0") || 0;
                      const total = (base + adj).toFixed(2);

                      return (
                        <View
                          key={combo.key}
                          style={tw`border border-gray-100 rounded-xl p-2.5 bg-gray-50`}
                        >
                          <View style={tw`flex-row justify-between items-center mb-1.5`}>
                            <View style={tw`flex-row items-center gap-x-2`}>
                              <Text style={tw`text-xs font-bold text-gray-800`}>
                                {combo.label}
                              </Text>
                              <Text style={tw`text-[11px] font-semibold text-[#5A7314]`}>
                                Total: {currency} {total}
                              </Text>
                            </View>

                            <TouchableOpacity
                              onPress={() =>
                                setExcludedElectronicsCombinations((prev) => [...prev, combo.key])
                              }
                              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                              style={tw`p-1.5 rounded-full bg-red-50`}
                            >
                              <Ionicons name="trash-outline" size={14} color="#EF4444" />
                            </TouchableOpacity>
                          </View>

                          <View style={tw`flex-row gap-x-2`}>
                            <View style={tw`flex-1`}>
                              <Text style={tw`text-[10px] text-gray-500 mb-1`}>
                                + Price Adj ({currency})
                              </Text>
                              <TextInput
                                placeholder="+0"
                                placeholderTextColor="#A0A0A0"
                                keyboardType="decimal-pad"
                                value={variantPrices[combo.key] || ""}
                                onChangeText={(t) =>
                                  setVariantPrices((prev) => ({
                                    ...prev,
                                    [combo.key]: t,
                                  }))
                                }
                                style={tw`border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs bg-white text-gray-800`}
                              />
                            </View>

                            <View style={tw`flex-1`}>
                              <Text style={tw`text-[10px] text-gray-500 mb-1`}>
                                Stock Qty
                              </Text>
                              <TextInput
                                placeholder={stockQuantity || "0"}
                                placeholderTextColor="#A0A0A0"
                                keyboardType="number-pad"
                                value={variantStocks[combo.key] || ""}
                                onChangeText={(t) =>
                                  setVariantStocks((prev) => ({
                                    ...prev,
                                    [combo.key]: t,
                                  }))
                                }
                                style={tw`border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs bg-white text-gray-800`}
                              />
                            </View>
                          </View>
                        </View>
                      );
                    })}
                  </View>

                  {/* Restoring Excluded Combinations Banner */}
                  {excludedElectronicsCombinations.length > 0 && (
                    <View style={tw`flex-row items-center justify-between bg-amber-50 border border-amber-200/80 rounded-xl p-2.5 mt-2`}>
                      <View style={tw`flex-row items-center gap-1.5`}>
                        <Ionicons name="information-circle-outline" size={14} color="#D97706" />
                        <Text style={tw`text-[11px] text-amber-800 font-medium`}>
                          {excludedElectronicsCombinations.length} combination(s) excluded
                        </Text>
                      </View>
                      <TouchableOpacity
                        onPress={() => setExcludedElectronicsCombinations([])}
                        style={tw`bg-white px-2 py-0.5 rounded border border-amber-300`}
                      >
                        <Text style={tw`text-[10px] font-bold text-amber-800`}>
                          Restore All
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              )}
            </View>
          )}

          {/* ── Beauty Section ── */}
          {currentCategory.slug === "beauty" && (
            <View style={tw`border border-gray-100 rounded-2xl p-4 bg-[#FAFAFA] gap-y-4`}>
              <Text style={tw`text-sm font-bold text-gray-800`}>
                Beauty & Care Attributes
              </Text>
              <ColorSelection
                label="Shades / Tones"
                options={BEAUTY_SHADES}
                selectedValue={selectedShades}
                multiSelect
                onSelect={setSelectedShades}
              />
              <ProductName
                label="Net Volume / Weight (optional)"
                placeholder="e.g. 50ml or 100g"
                value={netVolume}
                onChangeText={setNetVolume}
              />
            </View>
          )}

          {/* ── 8. Availability Radio ── */}
          <RadioSelectGroup
            label="Availability"
            isRequired
            options={[
              { label: "Available", value: "Available" },
              { label: "Unavailable", value: "Unavailable" },
            ]}
            selectedValue={availability}
            onSelect={setAvailability}
          />

          {/* ── 9. Submit Button ── */}
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={isUpdating}
            activeOpacity={0.85}
            style={[
              tw`bg-[#5A7314] py-4 rounded-full items-center justify-center mt-2 shadow-md`,
              isUpdating && tw`opacity-70`,
            ]}
          >
            {isUpdating ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={tw`text-white font-bold text-base`}>
                Update Product
              </Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Add Custom Configuration Modal */}
      <Modal
        visible={isAddConfigModalVisible}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setIsAddConfigModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setIsAddConfigModalVisible(false)}>
          <View style={tw`flex-1 bg-black/50 justify-center items-center px-5`}>
            <TouchableWithoutFeedback>
              <View style={tw`w-full bg-white rounded-3xl p-5 shadow-xl`}>
                <View style={tw`flex-row justify-between items-center mb-4 pb-3 border-b border-gray-100`}>
                  <Text style={tw`text-base font-bold text-gray-900`}>
                    Add Specific Configuration
                  </Text>
                  <TouchableOpacity
                    onPress={() => setIsAddConfigModalVisible(false)}
                    style={tw`p-1`}
                  >
                    <Ionicons name="close" size={20} color="#6B7280" />
                  </TouchableOpacity>
                </View>

                {/* RAM selection / input */}
                <Text style={tw`text-xs font-semibold text-gray-700 mb-1.5`}>
                  RAM (e.g. 8GB, 16GB)
                </Text>
                <View style={tw`flex-row flex-wrap gap-1.5 mb-2`}>
                  {ELECTRONICS_RAM.map((r) => (
                    <TouchableOpacity
                      key={r}
                      onPress={() => setNewConfigRam(r)}
                      style={tw`px-2.5 py-1 rounded-full border ${
                        newConfigRam === r
                          ? "bg-[#5A7314] border-[#5A7314]"
                          : "bg-gray-100 border-gray-200"
                      }`}
                    >
                      <Text
                        style={tw`text-xs ${
                          newConfigRam === r ? "text-white font-bold" : "text-gray-700"
                        }`}
                      >
                        {r}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <TextInput
                  placeholder="Or type custom RAM..."
                  placeholderTextColor="#9CA3AF"
                  value={newConfigRam}
                  onChangeText={setNewConfigRam}
                  style={tw`border border-gray-200 rounded-xl px-3 py-2 text-xs bg-gray-50 text-gray-800 mb-3`}
                />

                {/* Storage selection / input */}
                <Text style={tw`text-xs font-semibold text-gray-700 mb-1.5`}>
                  Storage (e.g. 128GB, 256GB)
                </Text>
                <View style={tw`flex-row flex-wrap gap-1.5 mb-2`}>
                  {ELECTRONICS_STORAGE.map((s) => (
                    <TouchableOpacity
                      key={s}
                      onPress={() => setNewConfigStorage(s)}
                      style={tw`px-2.5 py-1 rounded-full border ${
                        newConfigStorage === s
                          ? "bg-[#5A7314] border-[#5A7314]"
                          : "bg-gray-100 border-gray-200"
                      }`}
                    >
                      <Text
                        style={tw`text-xs ${
                          newConfigStorage === s ? "text-white font-bold" : "text-gray-700"
                        }`}
                      >
                        {s}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <TextInput
                  placeholder="Or type custom Storage..."
                  placeholderTextColor="#9CA3AF"
                  value={newConfigStorage}
                  onChangeText={setNewConfigStorage}
                  style={tw`border border-gray-200 rounded-xl px-3 py-2 text-xs bg-gray-50 text-gray-800 mb-4`}
                />

                {/* Add button */}
                <TouchableOpacity
                  onPress={() => {
                    const ram = newConfigRam.trim();
                    const storage = newConfigStorage.trim();
                    if (!ram && !storage) {
                      Toast.show({ type: "error", text1: "Required", text2: "Enter at least RAM or Storage" });
                      return;
                    }
                    const r = ram || "Standard RAM";
                    const s = storage || "Standard Storage";
                    const key = `${r}-${s}`;

                    setCustomElectronicsConfigs((prev) => {
                      if (prev.some((p) => p.ram === r && p.storage === s)) return prev;
                      return [...prev, { ram: r, storage: s }];
                    });

                    // Remove from excluded if it was previously excluded
                    setExcludedElectronicsCombinations((prev) => prev.filter((k) => k !== key));

                    setNewConfigRam("");
                    setNewConfigStorage("");
                    setIsAddConfigModalVisible(false);
                  }}
                  style={tw`w-full bg-[#5A7314] py-3 rounded-full items-center justify-center shadow-sm`}
                >
                  <Text style={tw`text-white font-bold text-sm`}>
                    Add Configuration
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}

import {
  useDeleteProductMutation,
  useGetProductsQuery,
  useToggleProductStatusMutation,
} from "@/redux/productApi";
import { router } from "expo-router";
import { Edit, Trash } from "lucide-react-native";
import { useMemo, useState } from "react";
import {
  FlatList,
  Image,
  RefreshControl,
  ScrollView,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import BackButton from "../../../components/ui/BackButton";
import FadeTabScreen from "../../../components/ui/FadeTabScreen";
import tw from "../../../lib/tailwind";

const STATUS_TABS = [
  { id: "all", label: "All", key: "all" as const },
  { id: "active", label: "Active", key: "active" as const },
  { id: "inactive", label: "Inactive", key: "inactive" as const },
  { id: "out_of_stock", label: "Out of stock", key: "out_of_stock" as const },
];

const CATEGORIES = [
  { id: "", label: "All" },
  { id: "fashion", label: "Fashion" },
  { id: "grocery", label: "Grocery" },
  { id: "electronics", label: "Electronics" },
  { id: "beauty", label: "Beauty" },
];

/* ───────── Skeleton ───────── */
const ProductCardSkeleton = () => (
  <View
    style={tw`flex-row border border-gray-100 rounded-2xl p-3 mb-3 bg-white`}
  >
    <View style={tw`w-16 h-16 rounded-xl bg-gray-200 mr-3`} />
    <View style={tw`flex-1 justify-center`}>
      <View style={tw`w-32 h-3.5 bg-gray-200 rounded mb-2`} />
      <View style={tw`w-20 h-3 bg-gray-100 rounded mb-2`} />
      <View style={tw`w-16 h-3.5 bg-gray-200 rounded mb-1.5`} />
      <View style={tw`w-14 h-2.5 bg-gray-100 rounded`} />
    </View>
    <View style={tw`items-end justify-between py-0.5`}>
      <View style={tw`w-10 h-6 bg-gray-200 rounded-full`} />
      <View style={tw`w-16 h-3 bg-gray-100 rounded`} />
    </View>
  </View>
);

const FilterSkeleton = () => (
  <View style={tw`flex-row px-5 gap-2 mb-2`}>
    {[1, 2, 3, 4].map((i) => (
      <View key={i} style={tw`w-20 h-8 bg-gray-200 rounded-full`} />
    ))}
  </View>
);

export default function ProductsScreen() {
  const insets = useSafeAreaInsets();
  const [status, setStatus] = useState("all");
  const [category, setCategory] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  const params = useMemo(
    () => ({
      search: search || undefined,
      status: status === "all" ? undefined : status,
      category_slug: category || undefined,
      per_page: 20,
      sort: "latest",
    }),
    [search, status, category],
  );

  const { data, isLoading, isFetching, isError, refetch } =
    useGetProductsQuery(params);

  const [toggleStatus, { isLoading: isToggling }] =
    useToggleProductStatusMutation();
  const [deleteProduct] = useDeleteProductMutation();

  const products = data?.data?.products?.data ?? [];
  const counts = data?.data?.counts;

  const onToggle = async (id: number, current: boolean) => {
    try {
      await toggleStatus({ id, is_active: !current }).unwrap();
    } catch {
      Toast.show({
        type: "error",
        text1: "Status update failed",
        text2: "Failed to update status",
      });
    }
  };

  const onDelete = async (id: number, name: string) => {
    try {
      await deleteProduct(id).unwrap();
      Toast.show({
        type: "success",
        text1: "Product deleted",
        text2: `"${name}" was removed`,
      });
    } catch {
      Toast.show({
        type: "error",
        text1: "Delete failed",
        text2: "Failed to delete product",
      });
    }
  };

  const handleSearch = () => setSearch(searchInput.trim());

  const clearSearch = () => {
    setSearchInput("");
    setSearch("");
  };

  return (
    <FadeTabScreen>
      <View style={[tw`flex-1 bg-white`, { paddingBottom: insets.bottom }]}>
        <BackButton title="Products" showBackButton={false} />

        {/* ── Search ── */}
        <View style={tw`px-5 mt-1 mb-3`}>
          <View
            style={tw`flex-row items-center bg-[#F7F7F7] border border-[#EEEEEE] rounded-full px-4 h-11 mt-3`}
          >
            <Text style={tw`text-gray-400 text-base mr-2`}>🔍</Text>
            <TextInput
              style={tw`flex-1 text-sm text-gray-800 py-0`}
              placeholder="Search products..."
              placeholderTextColor="#A0A0A0"
              value={searchInput}
              onChangeText={setSearchInput}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
              autoCapitalize="none"
              autoCorrect={false}
            />
            {searchInput.length > 0 && (
              <TouchableOpacity
                onPress={clearSearch}
                hitSlop={8}
                style={tw`mr-2`}
              >
                <Text style={tw`text-gray-400 text-sm`}>✕</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={handleSearch} hitSlop={8}>
              <Text style={tw`text-[#5A7314] font-semibold text-sm`}>
                Search
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Status Tabs ── */}
        <View style={tw`mb-2.5`}>
          {isLoading ? (
            <FilterSkeleton />
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={tw`px-5 gap-2`}
            >
              {STATUS_TABS.map((tab) => {
                const isActive = status === tab.id;
                const count =
                  tab.key === "all"
                    ? counts?.all
                    : counts?.[tab.key as keyof typeof counts];

                return (
                  <TouchableOpacity
                    key={tab.id}
                    onPress={() => setStatus(tab.id)}
                    activeOpacity={0.75}
                    style={tw`px-3.5 py-2 rounded-full ${
                      isActive
                        ? "bg-[#FEF0E8]"
                        : "bg-white border border-[#E8E8E8]"
                    }`}
                  >
                    <Text
                      style={tw`text-xs ${
                        isActive
                          ? "text-[#E8752F] font-semibold"
                          : "text-[#606060]"
                      }`}
                    >
                      {tab.label}
                      {count != null ? ` (${count})` : ""}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}
        </View>

        {/* ── Category Chips ── */}
        <View style={tw`mb-3`}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={tw`px-5 gap-2`}
          >
            {CATEGORIES.map((cat) => {
              const isActive = category === cat.id;
              return (
                <TouchableOpacity
                  key={cat.id || "all-cat"}
                  onPress={() => setCategory(cat.id)}
                  activeOpacity={0.75}
                  style={tw`px-3.5 py-1.5 rounded-full ${
                    isActive ? "bg-[#5A7314]" : "bg-[#F3F3F3]"
                  }`}
                >
                  <Text
                    style={tw`text-xs ${
                      isActive
                        ? "text-white font-semibold"
                        : "text-[#505050] font-medium"
                    }`}
                  >
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* ── List ── */}
        {isLoading ? (
          <View style={tw`px-5`}>
            <ProductCardSkeleton />
            <ProductCardSkeleton />
            <ProductCardSkeleton />
            <ProductCardSkeleton />
            <ProductCardSkeleton />
          </View>
        ) : isError ? (
          <View style={tw`flex-1 items-center justify-center px-5`}>
            <Text style={tw`text-gray-500 text-sm mb-3`}>
              Failed to load products
            </Text>
            <TouchableOpacity
              onPress={() => refetch()}
              style={tw`bg-[#5A7314] px-6 py-2.5 rounded-full`}
            >
              <Text style={tw`text-white font-semibold text-sm`}>
                Try Again
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={products}
            keyExtractor={(item: any) => String(item.id)}
            contentContainerStyle={tw`px-5 pb-24`}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={isFetching && !isLoading}
                onRefresh={refetch}
                colors={["#5A7314"]}
                tintColor="#5A7314"
              />
            }
            ListEmptyComponent={
              <View style={tw`py-20 items-center`}>
                <Text style={tw`text-4xl mb-3`}>📦</Text>
                <Text style={tw`text-gray-500 text-sm font-medium`}>
                  No products found
                </Text>
                <Text style={tw`text-gray-400 text-xs mt-1`}>
                  Try changing filters or add a new product
                </Text>
              </View>
            }
            renderItem={({ item }: { item: any }) => (
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() =>
                  router.push({
                    pathname: "/product-details/[id]",
                    params: { id: String(item.id) },
                  })
                }
                style={tw`flex-row items-center border border-[#F0F0F0] rounded-2xl p-3 mb-2.5 bg-white`}
              >
                {/* Image */}
                <View
                  style={tw`w-16 h-16 rounded-xl bg-[#F5F5F5] overflow-hidden mr-3`}
                >
                  <Image
                    source={
                      item.primary_image
                        ? { uri: item.primary_image }
                        : require("../../../assets/order/order.png")
                    }
                    style={tw`w-full h-full`}
                    resizeMode="cover"
                  />
                </View>

                {/* Info */}
                <View style={tw`flex-1 pr-2`}>
                  <Text
                    style={tw`text-sm font-semibold text-gray-900`}
                    numberOfLines={1}
                  >
                    {item.name}
                  </Text>
                  <Text
                    style={tw`text-[11px] text-gray-400 mt-0.5`}
                    numberOfLines={1}
                  >
                    {item.category?.name || "—"}
                  </Text>
                  <Text style={tw`text-sm font-bold text-[#5A7314] mt-1`}>
                    {item.currency || "KES"}{" "}
                    {Number(
                      item.effective_price ?? item.base_price,
                    ).toLocaleString()}
                  </Text>
                  <View style={tw`flex-row items-center mt-1 gap-1.5`}>
                    <View
                      style={tw`w-1.5 h-1.5 rounded-full ${
                        item.in_stock ? "bg-green-500" : "bg-red-400"
                      }`}
                    />
                    <Text
                      style={tw`text-[10px] ${
                        item.in_stock ? "text-green-600" : "text-red-500"
                      }`}
                    >
                      {item.in_stock
                        ? `Stock: ${item.total_stock}`
                        : "Out of stock"}
                    </Text>
                  </View>
                </View>

                {/* Actions */}
                <View style={tw`items-end justify-between h-16`}>
                  <Switch
                    value={!!item.is_active}
                    onValueChange={() => onToggle(item.id, item.is_active)}
                    trackColor={{ false: "#D1D5DB", true: "#A8C46A" }}
                    thumbColor={item.is_active ? "#5A7314" : "#f4f3f4"}
                    disabled={isToggling}
                    style={{ transform: [{ scaleX: 0.85 }, { scaleY: 0.85 }] }}
                  />
                  <View style={tw`flex-row items-center gap-3`}>
                    <TouchableOpacity
                      onPress={() =>
                        router.push({
                          pathname: "/edit-product/[id]",
                          params: { id: String(item.id) },
                        })
                      }
                      hitSlop={6}
                    >
                      <Text style={tw`text-[11px] text-blue-600 font-semibold`}>
                        <Edit size={16} />
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => onDelete(item.id, item.name)}
                      hitSlop={6}
                    >
                      <Text style={tw`text-[11px] text-red-500 font-semibold`}>
                        <Trash size={16} color="#EF4444" />
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            )}
          />
        )}

        {/* ── FAB ── */}
        <TouchableOpacity
          onPress={() => router.push("/add-product")}
          activeOpacity={0.85}
          style={tw`absolute bottom-7 right-5 bg-[#5A7314] w-14 h-14 rounded-full items-center justify-center shadow-lg elevation-6`}
        >
          <Text style={tw`text-white text-3xl font-light leading-none`}>+</Text>
        </TouchableOpacity>
      </View>
    </FadeTabScreen>
  );
}

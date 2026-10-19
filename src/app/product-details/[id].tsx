import {
    useDeleteProductMutation,
    useGetProductByIdQuery,
    useToggleProductStatusMutation,
} from "@/redux/productApi";
import { router, useLocalSearchParams } from "expo-router";
import {
    ActivityIndicator,
    Image,
    ScrollView,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import BackButton from "../../../components/ui/BackButton";
import tw from "../../../lib/tailwind";

export default function ProductDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data, isLoading, isError, refetch } = useGetProductByIdQuery(id!);
  const [toggleStatus] = useToggleProductStatusMutation();
  const [deleteProduct] = useDeleteProductMutation();

  const p = data?.data?.product;

  if (isLoading) {
    return (
      <SafeAreaView style={tw`flex-1 items-center justify-center bg-white`}>
        <ActivityIndicator color="#5A7314" size="large" />
      </SafeAreaView>
    );
  }

  if (isError || !p) {
    return (
      <SafeAreaView style={tw`flex-1 items-center justify-center bg-white`}>
        <Text style={tw`text-gray-500 mb-2`}>Failed to load</Text>
        <TouchableOpacity onPress={() => refetch()}>
          <Text style={tw`text-[#5A7314] font-semibold`}>Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={tw`flex-1 bg-white`} edges={["bottom"]}>
      <BackButton title="Product Details" />
      <ScrollView contentContainerStyle={tw`px-5 pb-10`}>
        {/* Images */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={tw`mt-3`}
        >
          {(p.images?.length ? p.images : [null]).map((img: any, i: number) => (
            <Image
              key={i}
              source={
                img?.url || img
                  ? { uri: typeof img === "string" ? img : img.url }
                  : require("../../../assets/order/order.png")
              }
              style={tw`w-40 h-40 rounded-2xl mr-2 bg-gray-100`}
              resizeMode="cover"
            />
          ))}
        </ScrollView>

        <Text style={tw`text-xl font-bold text-gray-900 mt-4`}>{p.name}</Text>
        <Text style={tw`text-[#5A7314] text-lg font-bold mt-1`}>
          {p.currency || "KES"} {p.effective_price ?? p.base_price}
        </Text>
        <Text style={tw`text-xs text-gray-500 mt-1`}>
          {p.category?.name} · {p.unit_type} · Stock: {p.total_stock}
        </Text>
        {p.description ? (
          <Text style={tw`text-sm text-gray-600 mt-3 leading-5`}>
            {p.description}
          </Text>
        ) : null}

        {/* Status */}
        <View
          style={tw`flex-row items-center justify-between mt-5 py-3 border-t border-gray-100`}
        >
          <Text style={tw`text-sm font-medium`}>Active</Text>
          <Switch
            value={!!p.is_active}
            // onValueChange={(v) => toggleStatus({ id: p.id, is_active: v })}
            trackColor={{ false: "#D1D5DB", true: "#5A7314" }}
          />
        </View>

        {/* Variants */}
        {p.variants?.length > 0 && (
          <>
            <Text style={tw`text-base font-semibold mt-4 mb-2`}>Variants</Text>
            {p.variants.map((v: any) => (
              <View
                key={v.id || v.sku}
                style={tw`border border-gray-100 rounded-xl p-3 mb-2`}
              >
                <Text style={tw`text-sm font-medium`}>{v.sku}</Text>
                <Text style={tw`text-xs text-gray-500`}>
                  Stock: {v.stock_quantity ?? v.stock}
                </Text>
                {v.attributes &&
                  Object.entries(v.attributes).map(([k, val]) => (
                    <Text key={k} style={tw`text-xs text-gray-600`}>
                      {k}: {String(val)}
                    </Text>
                  ))}
              </View>
            ))}
          </>
        )}

        <View style={tw`flex-row gap-3 mt-6`}>
          <TouchableOpacity
            onPress={() =>
              router.push({
                pathname: "/edit-product/[id]",
                params: { id: String(p.id) },
              })
            }
            style={tw`flex-1 bg-[#5A7314] py-3.5 rounded-full items-center`}
          >
            <Text style={tw`text-white font-semibold`}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={async () => {
              try {
                await deleteProduct(p.id).unwrap();
                Toast.show({
                  type: "success",
                  text1: "Product deleted",
                  text2: `"${p.name}" was removed`,
                });
                router.back();
              } catch (error: any) {
                Toast.show({
                  type: "error",
                  text1: "Delete failed",
                  text2:
                    error?.data?.message ||
                    error?.error ||
                    "Failed to delete product",
                });
              }
            }}
            style={tw`flex-1 border border-red-400 py-3.5 rounded-full items-center`}
          >
            <Text style={tw`text-red-500 font-semibold`}>Delete</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

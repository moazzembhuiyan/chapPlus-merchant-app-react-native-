
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  RefreshControl,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import BackButton from "../../../components/ui/BackButton";
import { hotelAdd } from "../../../lib/icon";
import tw from "../../../lib/tailwind";
import { useDeleteHotelMerchantHotelManageMutation, useGetHotelMerchantHotelManageQuery } from "@/redux/hotelmerchantHotelManageApi";

const avgRating = (reviews: any[] = []) => {
  if (!reviews.length) return "—";
  const sum = reviews.reduce((a, r) => a + (r.rating || 0), 0);
  return (sum / reviews.length).toFixed(1);
};

const HotelSkeleton = () => (
  <View
    style={tw`bg-white rounded-3xl border border-gray-100 overflow-hidden mb-4`}
  >
    <View style={tw`h-44 bg-gray-200`} />
    <View style={tw`p-4`}>
      <View style={tw`w-40 h-4 bg-gray-200 rounded mb-2`} />
      <View style={tw`w-28 h-3 bg-gray-100 rounded mb-3`} />
      <View style={tw`flex-row justify-between`}>
        <View style={tw`w-16 h-4 bg-gray-200 rounded`} />
        <View style={tw`w-10 h-3 bg-gray-100 rounded`} />
      </View>
    </View>
  </View>
);

export default function HotelList() {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  const { data, isLoading, isFetching, isError, refetch } =
    useGetHotelMerchantHotelManageQuery({ search: search || undefined });

  const [deleteHotel] = useDeleteHotelMerchantHotelManageMutation();

  const hotels = data?.data?.hotels?.data ?? [];

  const onDelete = (id: number, name: string) => {
    Alert.alert("Delete Hotel", `Delete "${name}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteHotel(id).unwrap();
            Toast.show({ type: "success", text1: "Hotel deleted" });
          } catch (e: any) {
            Toast.show({
              type: "error",
              text1: "Delete failed",
              text2: e?.data?.message || "Try again",
            });
          }
        },
      },
    ]);
  };

  return (
    <View style={tw`flex-1 bg-white`}>
      <BackButton
        title="Hotels"
        showBackButton={false}
        showAddIcon
        icon={hotelAdd}
        onAddPress={() => router.push("/add-hotel")}
      />

      <View style={tw`px-5 mt-2 mb-3`}>
        <View
          style={tw`flex-row items-center bg-[#F7F7F7] border border-[#EEEEEE] rounded-full px-4 h-11`}
        >
          <Ionicons name="search" size={16} color="#9CA3AF" style={tw`mr-2`} />
          <TextInput
            style={tw`flex-1 text-sm text-gray-800 py-0`}
            placeholder="Search hotels..."
            placeholderTextColor="#A0A0A0"
            value={searchInput}
            onChangeText={setSearchInput}
            onSubmitEditing={() => setSearch(searchInput.trim())}
            returnKeyType="search"
          />
          <TouchableOpacity onPress={() => setSearch(searchInput.trim())}>
            <Text style={tw`text-[#5A7314] font-semibold text-sm`}>Search</Text>
          </TouchableOpacity>
        </View>
      </View>

      {isLoading ? (
        <View style={tw`px-5`}>
          <HotelSkeleton />
          <HotelSkeleton />
          <HotelSkeleton />
        </View>
      ) : isError ? (
        <View style={tw`flex-1 items-center justify-center`}>
          <Text style={tw`text-gray-500 mb-3`}>Failed to load hotels</Text>
          <TouchableOpacity
            onPress={() => refetch()}
            style={tw`bg-[#5A7314] px-5 py-2.5 rounded-full`}
          >
            <Text style={tw`text-white font-semibold`}>Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={hotels}
          keyExtractor={(item: any) => String(item.id)}
          contentContainerStyle={tw`px-5 pb-10`}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isFetching && !isLoading}
              onRefresh={refetch}
              tintColor="#5A7314"
            />
          }
          ListEmptyComponent={
            <View style={tw`py-20 items-center`}>
              <Text style={tw`text-gray-400`}>No hotels yet</Text>
            </View>
          }
          renderItem={({ item }: { item: any }) => {
            const img =
              item.images?.find((i: any) => i.is_primary)?.image_url ||
              item.images?.[0]?.image_url;

            return (
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() =>
                  router.push({
                    pathname: "/hotel-details/[id]",
                    params: { id: String(item.id) },
                  })
                }
                style={tw`bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden mb-4`}
              >
                <View style={tw`h-44 w-full bg-gray-100`}>
                  {img ? (
                    <Image
                      source={{ uri: img }}
                      style={tw`w-full h-full`}
                      resizeMode="cover"
                    />
                  ) : null}
                </View>
                <View style={tw`p-4`}>
                  <Text
                    style={tw`text-base font-bold text-gray-900 mb-1`}
                    numberOfLines={1}
                  >
                    {item.name}
                  </Text>
                  <View style={tw`flex-row items-center mb-3`}>
                    <Ionicons
                      name="location-outline"
                      size={14}
                      color="#9CA3AF"
                    />
                    <Text
                      style={tw`text-xs text-gray-400 ml-1 flex-1`}
                      numberOfLines={1}
                    >
                      {item.address}, {item.city}
                    </Text>
                  </View>
                  <View style={tw`flex-row items-center justify-between`}>
                    <Text style={tw`text-base font-bold text-[#FF6200]`}>
                      KES {Number(item.price_per_night).toLocaleString()}
                      <Text style={tw`text-xs text-gray-400 font-normal`}>
                        /night
                      </Text>
                    </Text>
                    <View style={tw`flex-row items-center`}>
                      <FontAwesome name="star" size={13} color="#FFC107" />
                      <Text style={tw`text-xs font-bold text-gray-800 ml-1.5`}>
                        {avgRating(item.reviews)}
                      </Text>
                      <Text style={tw`text-[10px] text-gray-400 ml-1`}>
                        ({item.reviews?.length || 0})
                      </Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}
    </View>
  );
}
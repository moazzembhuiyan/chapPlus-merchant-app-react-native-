
import { Feather, FontAwesome5, Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useDeleteHotelMerchantHotelManageMutation, useGetHotelMerchantHotelManageByIdQuery } from "@/redux/hotelmerchantHotelManageApi";
import tw from "../../../lib/tailwind";
import ConfirmModal from "../../../components/ui/ConfirmModal";


const FACILITY_ICON: Record<
  string,
  { name: string; library: "Feather" | "FontAwesome5" }
> = {
  Wifi: { name: "wifi", library: "Feather" },
  Pool: { name: "swimming-pool", library: "FontAwesome5" },
  Beach: { name: "umbrella-beach", library: "FontAwesome5" },
  AC: { name: "wind", library: "Feather" },
  Gym: { name: "dumbbell", library: "FontAwesome5" },
  Spa: { name: "spa", library: "FontAwesome5" },
  Parking: { name: "local-parking", library: "FontAwesome5" },
};

const formatDate = (d?: string) => {
  if (!d) return "";
  return new Date(d).toLocaleDateString([], {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

export default function HotelDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [descExpanded, setDescExpanded] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const { data, isLoading, isError, refetch } =
    useGetHotelMerchantHotelManageByIdQuery(id!, { skip: !id });

  const [deleteHotel, { isLoading: deleting }] =
    useDeleteHotelMerchantHotelManageMutation();

  const hotel = data?.data?.hotel;

  const gallery = useMemo(() => {
    const imgs = (hotel?.images || [])
      .map((i: any) => i.image_url)
      .filter(Boolean);
    return imgs.length
      ? imgs
      : [
          "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=800",
        ];
  }, [hotel]);

  const avgRating = useMemo(() => {
    const reviews = hotel?.reviews || [];
    if (!reviews.length) return null;
    const sum = reviews.reduce((a: number, r: any) => a + (r.rating || 0), 0);
    return (sum / reviews.length).toFixed(1);
  }, [hotel]);

const handleDelete = async () => {
  try {
    await deleteHotel(id!).unwrap();
    setShowDeleteModal(false);
    Toast.show({ type: "success", text1: "Hotel deleted" });
    router.back();
  } catch (e: any) {
    Toast.show({
      type: "error",
      text1: "Delete failed",
      text2: e?.data?.message || "Please try again",
    });
  }
};

  if (isLoading) {
    return (
      <View style={tw`flex-1 bg-white`}>
        <View style={tw`h-80 bg-gray-200`} />
        <View style={tw`px-5 pt-5`}>
          <View style={tw`w-3/4 h-6 bg-gray-200 rounded mb-3`} />
          <View style={tw`w-1/2 h-4 bg-gray-100 rounded mb-6`} />
          <View style={tw`flex-row justify-between mb-6`}>
            {[1, 2, 3, 4, 5].map((i) => (
              <View key={i} style={tw`w-14 h-14 rounded-full bg-gray-100`} />
            ))}
          </View>
          <View style={tw`w-full h-20 bg-gray-100 rounded-xl`} />
        </View>
      </View>
    );
  }

  if (isError || !hotel) {
    return (
      <View style={tw`flex-1 bg-white items-center justify-center px-5`}>
        <Text style={tw`text-gray-500 mb-3`}>Failed to load hotel</Text>
        <TouchableOpacity
          onPress={() => refetch()}
          style={tw`bg-[#5A7314] px-5 py-2.5 rounded-full`}
        >
          <Text style={tw`text-white font-semibold`}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const description = hotel.description || "";
  const shortDesc =
    description.length > 140 && !descExpanded
      ? description.slice(0, 140) + "..."
      : description;

  return (
    <View style={tw`flex-1 bg-white`}>
      <StatusBar style="light" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={tw`pb-28`}
      >
        {/* Hero */}
        <View style={tw`relative w-full h-80 bg-gray-200`}>
          <Image
            source={{ uri: gallery[selectedIndex] || gallery[0] }}
            style={tw`w-full h-full`}
            resizeMode="cover"
          />

          <View
            style={[
              tw`absolute left-5 right-5 flex-row justify-between items-center`,
              { top: Math.max(insets.top + 8, 20) },
            ]}
          >
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => router.back()}
              style={tw`w-10 h-10 rounded-full bg-white items-center justify-center shadow-md`}
            >
              <Ionicons name="chevron-back" size={20} color="#1F2937" />
            </TouchableOpacity>

            <View
              style={tw`px-3 py-1 rounded-full ${
                hotel.is_active ? "bg-emerald-500" : "bg-gray-500"
              }`}
            >
              <Text style={tw`text-white text-[10px] font-bold`}>
                {hotel.is_active ? "Active" : "Inactive"}
              </Text>
            </View>
          </View>

          {/* Thumbs */}
          {gallery.length > 1 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={tw`absolute bottom-4 left-0 right-0`}
              contentContainerStyle={tw`px-5 gap-x-2`}
            >
              {gallery.map((imgUrl: string, index: number) => (
                <TouchableOpacity
                  key={index}
                  activeOpacity={0.8}
                  onPress={() => setSelectedIndex(index)}
                  style={[
                    tw`w-14 h-12 rounded-xl overflow-hidden bg-gray-300 border-2`,
                    {
                      borderColor:
                        selectedIndex === index
                          ? "#FFFFFF"
                          : "transparent",
                      opacity: selectedIndex === index ? 1 : 0.65,
                    },
                  ]}
                >
                  <Image
                    source={{ uri: imgUrl }}
                    style={tw`w-full h-full`}
                    resizeMode="cover"
                  />
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        <View style={tw`px-5 pt-5`}>
          {/* Title + rating */}
          <View style={tw`flex-row justify-between items-start mb-1`}>
            <Text
              style={tw`text-2xl font-bold text-[#1F2937] flex-1 mr-2`}
            >
              {hotel.name}
            </Text>
            {avgRating && (
              <View style={tw`flex-row items-center mt-1`}>
                <Ionicons name="star" size={16} color="#F59E0B" />
                <Text style={tw`text-sm font-semibold text-[#1F2937] ml-1`}>
                  {avgRating}
                </Text>
                <Text style={tw`text-sm text-gray-400 ml-1`}>
                  ({hotel.reviews?.length || 0})
                </Text>
              </View>
            )}
          </View>

          <View style={tw`flex-row items-center mb-4`}>
            <Ionicons name="location-outline" size={16} color="#9CA3AF" />
            <Text style={tw`text-sm text-gray-400 ml-1 flex-1`}>
              {hotel.address}
              {hotel.city ? `, ${hotel.city}` : ""}
            </Text>
          </View>

          {/* Quick stats */}
          <View style={tw`flex-row gap-3 mb-6`}>
            <StatChip
              label="Price/night"
              value={`KES ${Number(hotel.price_per_night).toLocaleString()}`}
            />
            <StatChip label="Rooms" value={String(hotel.room_quantity)} />
            <StatChip label="Max guests" value={String(hotel.max_guests)} />
          </View>

          {/* Facilities */}
          {hotel.facilities?.length > 0 && (
            <>
              <Text style={tw`text-base font-bold text-[#1F2937] mb-3.5`}>
                Property Facilities
              </Text>
              <View style={tw`flex-row flex-wrap gap-4 mb-6`}>
                {hotel.facilities.map((name: string) => {
                  const conf = FACILITY_ICON[name] || {
                    name: "check",
                    library: "Feather" as const,
                  };
                  return (
                    <View key={name} style={tw`items-center w-16`}>
                      <View
                        style={tw`w-14 h-14 rounded-full bg-[#FFF5F2] items-center justify-center mb-1.5`}
                      >
                        {conf.library === "Feather" ? (
                          <Feather
                            name={conf.name as any}
                            size={20}
                            color="#FF7A51"
                          />
                        ) : (
                          <FontAwesome5
                            name={conf.name as any}
                            size={18}
                            color="#FF7A51"
                          />
                        )}
                      </View>
                      <Text style={tw`text-xs text-gray-500`}>{name}</Text>
                    </View>
                  );
                })}
              </View>
            </>
          )}

          {/* Description */}
          <Text style={tw`text-base font-bold text-[#1F2937] mb-2`}>
            Description
          </Text>
          <Text style={tw`text-sm text-gray-400 leading-5 mb-6`}>
            {shortDesc}
            {description.length > 140 && (
              <Text
                onPress={() => setDescExpanded((v) => !v)}
                style={tw`text-[#FF5A1F] font-semibold`}
              >
                {descExpanded ? " Show less" : " Read more..."}
              </Text>
            )}
          </Text>

          {/* Reviews */}
          <Text style={tw`text-base font-bold text-[#1F2937] mb-3`}>
            User Feedbacks
          </Text>
          {(hotel.reviews || []).length === 0 ? (
            <Text style={tw`text-sm text-gray-400 mb-4`}>No reviews yet</Text>
          ) : (
            <View style={tw`bg-[#F9FAFB] rounded-2xl p-4 gap-4 mb-4`}>
              {hotel.reviews.map((review: any, idx: number) => (
                <View
                  key={review.id}
                  style={tw`${
                    idx !== hotel.reviews.length - 1
                      ? "pb-4 border-b border-gray-100"
                      : ""
                  }`}
                >
                  <View style={tw`flex-row justify-between items-center mb-1`}>
                    <Text style={tw`text-sm font-bold text-[#1F2937]`}>
                      Guest #{review.user_id}
                    </Text>
                    <View style={tw`flex-row gap-0.5`}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Ionicons
                          key={star}
                          name="star"
                          size={14}
                          color={
                            star <= (review.rating || 0) ? "#F59E0B" : "#E5E7EB"
                          }
                        />
                      ))}
                    </View>
                  </View>
                  <Text style={tw`text-xs text-gray-400 mb-2`}>
                    {formatDate(review.created_at)}
                  </Text>
                  <Text style={tw`text-xs text-gray-500 leading-4`}>
                    {review.comment}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bottom bar */}
      <View
        style={[
          tw`absolute bottom-0 left-0 right-0 bg-white px-5 py-3 flex-row justify-between items-center border-t border-gray-100 gap-3`,
          { paddingBottom: Math.max(insets.bottom, 12) },
        ]}
      >
        <TouchableOpacity
          activeOpacity={0.9}
         onPress={() => setShowDeleteModal(true)}
          disabled={deleting}
          style={tw`flex-1 bg-[#F8F8F8] py-3.5 rounded-full items-center`}
        >
          {deleting ? (
            <ActivityIndicator color="#5A7314" />
          ) : (
            <Text style={tw`text-[#5A7314] text-sm font-semibold`}>
              Remove
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() =>
            router.push({
              pathname: "/hotel-edit/[id]",
              params: { id: String(hotel.id) },
            })
          }
          style={tw`flex-1 bg-[#5B7410] py-3.5 rounded-full items-center`}
        >
          <Text style={tw`text-white text-sm font-semibold`}>
            Edit Details
          </Text>
        </TouchableOpacity>
      </View>

      {/* ===================delete confirmation modal================ */}
 <ConfirmModal
  visible={showDeleteModal}
  title="Delete Hotel?"
  message={`“${hotel?.name}” will be permanently removed. This cannot be undone.`}
  confirmText="Delete"
  cancelText="Keep"
  loading={deleting}
  destructive
  onCancel={() => setShowDeleteModal(false)}
  onConfirm={handleDelete}
/>
    </View>
  );
}

function StatChip({ label, value }: { label: string; value: string }) {
  return (
    <View
      style={tw`flex-1 border border-gray-100 rounded-xl p-2.5 bg-[#FAFAFA]`}
    >
      <Text style={tw`text-[10px] text-gray-400`}>{label}</Text>
      <Text
        style={tw`text-xs font-bold text-gray-900 mt-0.5`}
        numberOfLines={1}
      >
        {value}
      </Text>
    </View>
  );
}


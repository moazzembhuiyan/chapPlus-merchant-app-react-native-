// app/booking-details/[id].tsx  (path ঠিক করো)
import {
  useGetHotelMerchantBookingByIdQuery,
  useUpdateHotelMerchantBookingStatusMutation,
} from "@/redux/hotelmerchantBookingApi";
import { Feather, FontAwesome5, Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import BackButton from "../../../components/ui/BackButton";
import tw from "../../../lib/tailwind";

const formatDate = (dateString?: string) => {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleDateString([], {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const formatMoney = (amount?: string | number) =>
  `KES ${Number(amount || 0).toLocaleString(undefined, {
    maximumFractionDigits: 2,
  })}`;

const formatStatus = (status: string) => {
  const map: Record<string, string> = {
    pending_payment: "Pending Payment",
    paid: "Paid",
    checked_in: "Checked In",
    checked_out: "Checked Out",
    completed: "Completed",
    cancelled: "Cancelled",
    failed: "Failed",
  };
  return map[status] || status?.replace(/_/g, " ") || "—";
};

const statusBadge = (status: string) => {
  switch (status) {
    case "checked_in":
      return { bg: "bg-orange-50", text: "text-amber-600" };
    case "checked_out":
    case "completed":
    case "paid":
      return { bg: "bg-emerald-50", text: "text-emerald-600" };
    case "cancelled":
    case "failed":
      return { bg: "bg-rose-50", text: "text-rose-500" };
    default:
      return { bg: "bg-gray-100", text: "text-gray-600" };
  }
};

// Available actions based on current status
const getAvailableActions = (current: string) => {
  // update API: checked_in | checked_out | cancelled
  switch (current) {
    case "paid":
    case "pending_payment":
      return [
        { key: "checked_in", label: "Check In", color: "bg-[#5A7314]" },
        { key: "cancelled", label: "Cancel", color: "bg-rose-500" },
      ];
    case "checked_in":
      return [
        { key: "checked_out", label: "Check Out", color: "bg-[#5A7314]" },
        { key: "cancelled", label: "Cancel", color: "bg-rose-500" },
      ];
    case "checked_out":
    case "completed":
    case "cancelled":
    case "failed":
      return []; // final states
    default:
      return [
        { key: "checked_in", label: "Check In", color: "bg-[#5A7314]" },
        { key: "cancelled", label: "Cancel", color: "bg-rose-500" },
      ];
  }
};

export default function BookingDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();

  const { data, isLoading, isError, refetch } =
    useGetHotelMerchantBookingByIdQuery(id!, { skip: !id });

  const [updateStatus, { isLoading: isUpdating }] =
    useUpdateHotelMerchantBookingStatusMutation();

  const booking = data?.data?.booking;
  const hotel = booking?.hotel;
  const user = booking?.user;
  const images = hotel?.images ?? [];
  const primaryImage =
    images.find((img: any) => img.is_primary)?.image_url ||
    images[0]?.image_url ||
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=800";

  const badge = statusBadge(booking?.status || "");
  const actions = getAvailableActions(booking?.status || "");

  const onUpdateStatus = async (status: string) => {
    try {
      await updateStatus({ id: id!, status }).unwrap();
      Toast.show({
        type: "success",
        text1: "Status updated",
        text2: `Booking is now ${formatStatus(status)}`,
      });
      refetch();
    } catch (e: any) {
      Toast.show({
        type: "error",
        text1: "Update failed",
        text2: e?.data?.message || e?.error || "Please try again",
      });
    }
  };

  if (isLoading) {
    return (
      <View style={tw`flex-1 bg-white`}>
        <BackButton title="Booking Details" />
        <View style={tw`px-5 pt-4`}>
          <View style={tw`h-48 bg-gray-200 rounded-2xl mb-4`} />
          <View style={tw`w-40 h-5 bg-gray-200 rounded mb-2`} />
          <View style={tw`w-28 h-4 bg-gray-100 rounded mb-6`} />
          {[1, 2, 3, 4].map((i) => (
            <View key={i} style={tw`h-12 bg-gray-100 rounded-xl mb-3`} />
          ))}
        </View>
      </View>
    );
  }

  if (isError || !booking) {
    return (
      <View style={tw`flex-1 bg-white items-center justify-center px-5`}>
        <Text style={tw`text-gray-500 mb-3`}>Failed to load booking</Text>
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
    <View style={[tw`flex-1 bg-white`, { paddingBottom: insets.bottom }]}>
      <BackButton title="Booking Details" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={tw`pb-28`}
      >
        {/* Hotel image */}
        <View style={tw`mx-5 mt-3 h-48 rounded-2xl overflow-hidden bg-gray-100`}>
          <Image
            source={{ uri: primaryImage }}
            style={tw`w-full h-full`}
            resizeMode="cover"
          />
        </View>

        {/* Title + status */}
        <View style={tw`px-5 mt-4`}>
          <View style={tw`flex-row items-start justify-between gap-3`}>
            <View style={tw`flex-1`}>
              <Text style={tw`text-lg font-bold text-gray-900`}>
                {hotel?.name || "Hotel"}
              </Text>
              <Text style={tw`text-xs text-gray-400 mt-1`}>
                {hotel?.address}
                {hotel?.city ? `, ${hotel.city}` : ""}
              </Text>
            </View>
            <View style={tw`px-3 py-1.5 rounded-full ${badge.bg}`}>
              <Text style={tw`text-[11px] font-bold ${badge.text}`}>
                {formatStatus(booking.status)}
              </Text>
            </View>
          </View>

          {/* Dates */}
          <View
            style={tw`mt-4 flex-row items-center justify-between border border-gray-100 rounded-2xl p-4 bg-[#FAFAFA]`}
          >
            <View>
              <Text style={tw`text-[10px] text-gray-400 uppercase mb-1`}>
                Check-in
              </Text>
              <Text style={tw`text-sm font-semibold text-gray-900`}>
                {formatDate(booking.check_in_date)}
              </Text>
            </View>
            <Feather name="arrow-right" size={16} color="#5A7314" />
            <View style={tw`items-end`}>
              <Text style={tw`text-[10px] text-gray-400 uppercase mb-1`}>
                Check-out
              </Text>
              <Text style={tw`text-sm font-semibold text-gray-900`}>
                {formatDate(booking.check_out_date)}
              </Text>
            </View>
          </View>

          {/* Rooms / price */}
          <View style={tw`mt-3 flex-row gap-3`}>
            <InfoChip
              icon="door-open"
              label="Rooms"
              value={String(booking.rooms_booked)}
            />
            <InfoChip
              icon="users"
              label="Max guests"
              value={String(hotel?.max_guests ?? "—")}
            />
            <InfoChip
              icon="money-bill-wave"
              label="Total"
              value={formatMoney(booking.total_price)}
            />
          </View>
        </View>

        {/* Guest */}
        <Section title="Guest">
          <View style={tw`flex-row items-center gap-3`}>
            <Image
              source={{
                uri:
                  user?.profile_photo_url ||
                  "https://via.placeholder.com/80",
              }}
              style={tw`w-12 h-12 rounded-full bg-gray-200`}
            />
            <View style={tw`flex-1`}>
              <Text style={tw`text-sm font-semibold text-gray-900`}>
                {user?.name || "—"}
              </Text>
              <Text style={tw`text-xs text-gray-400 mt-0.5`}>
                {user?.email || "—"}
              </Text>
            </View>
          </View>
          <Row label="Phone" value={booking.customer_phone_number || user?.user_profile?.phone_number || "—"} />
          <Row
            label="Address"
            value={user?.user_profile?.address || "—"}
          />
        </Section>

        {/* Payment */}
        <Section title="Payment">
          <Row label="Amount" value={formatMoney(booking.total_price)} />
          <Row
            label="Price / night"
            value={formatMoney(hotel?.price_per_night)}
          />
          <Row
            label="M-Pesa receipt"
            value={booking.mpesa_receipt_number || "—"}
          />
          <Row
            label="Booked on"
            value={formatDate(booking.created_at)}
          />
        </Section>

        {/* Facilities */}
        {hotel?.facilities?.length > 0 && (
          <Section title="Facilities">
            <View style={tw`flex-row flex-wrap gap-2`}>
              {hotel.facilities.map((f: string) => (
                <View
                  key={f}
                  style={tw`px-3 py-1.5 rounded-full bg-[#EFF1E7]`}
                >
                  <Text style={tw`text-xs font-medium text-[#5A7314]`}>
                    {f}
                  </Text>
                </View>
              ))}
            </View>
          </Section>
        )}

        {/* Gallery thumbs */}
        {images.length > 1 && (
          <Section title="Photos">
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {images.map((img: any) => (
                <Image
                  key={img.id}
                  source={{ uri: img.image_url }}
                  style={tw`w-24 h-20 rounded-xl mr-2 bg-gray-100`}
                  resizeMode="cover"
                />
              ))}
            </ScrollView>
          </Section>
        )}
      </ScrollView>

      {/* Bottom status actions */}
      {actions.length > 0 && (
        <View
          style={[
            tw`absolute bottom-0 left-0 right-0 px-5 pt-3 bg-white border-t border-gray-100 flex-row gap-3`,
            { paddingBottom: Math.max(insets.bottom, 16) },
          ]}
        >
          {actions.map((action) => (
            <TouchableOpacity
              key={action.key}
              disabled={isUpdating}
              activeOpacity={0.85}
              onPress={() => onUpdateStatus(action.key)}
              style={tw`flex-1 py-3.5 rounded-full items-center ${action.color} ${
                isUpdating ? "opacity-60" : ""
              }`}
            >
              {isUpdating ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={tw`text-white font-semibold text-sm`}>
                  {action.label}
                </Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={tw`px-5 mt-5`}>
      <Text style={tw`text-sm font-semibold text-gray-900 mb-3`}>{title}</Text>
      <View
        style={tw`border border-gray-100 rounded-2xl p-4 bg-white gap-y-3`}
      >
        {children}
      </View>
    </View>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={tw`flex-row justify-between items-start`}>
      <Text style={tw`text-xs text-gray-400`}>{label}</Text>
      <Text
        style={tw`text-xs font-medium text-gray-800 flex-1 text-right ml-4`}
      >
        {value}
      </Text>
    </View>
  );
}

function InfoChip({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) {
  return (
    <View
      style={tw`flex-1 border border-gray-100 rounded-xl p-2.5 items-center bg-[#FAFAFA]`}
    >
      <FontAwesome5 name={icon as any} size={12} color="#5A7314" />
      <Text style={tw`text-[10px] text-gray-400 mt-1`}>{label}</Text>
      <Text
        style={tw`text-xs font-bold text-gray-900 mt-0.5`}
        numberOfLines={1}
      >
        {value}
      </Text>
    </View>
  );
}
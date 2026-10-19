import {
  MerchantOrderType,
  useGetOrderByIdQuery,
  useUpdateOrderStatusMutation,
} from "@/redux/orderApi";
import { getAuthUser } from "@/utils/authStorage";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Linking,
  Modal,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import BackButton from "../../../components/ui/BackButton";
import tw from "../../../lib/tailwind";

const CANCELLATION_REASONS = [
  "Item(s) out of stock",
  "Unable to fulfill in time",
  "Store currently closed or busy",
  "Incorrect item pricing or description",
  "Customer requested cancellation",
  "Other reason",
];

const formatPrice = (amount: number, currency = "KES") =>
  `${currency} ${Number(amount || 0).toLocaleString()}`;

const formatDate = (dateString: string) => {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleString([], {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatStatus = (status: string) =>
  status
    ?.split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ") || "—";

const parseAttributes = (rawAttrs: any): Record<string, any> => {
  if (!rawAttrs) return {};
  if (typeof rawAttrs === "string") {
    try {
      return JSON.parse(rawAttrs);
    } catch {
      return {};
    }
  }
  if (typeof rawAttrs === "object") {
    return rawAttrs;
  }
  return {};
};

const getStatusTheme = (status: string) => {
  switch (status?.toLowerCase()) {
    case "pending_payment":
      return {
        label: "Pending Payment",
        badgeBg: "bg-amber-50",
        badgeText: "text-amber-700",
        badgeBorder: "border-amber-200",
        icon: "time-outline" as const,
      };
    case "paid":
      return {
        label: "Paid / New",
        badgeBg: "bg-blue-50",
        badgeText: "text-blue-700",
        badgeBorder: "border-blue-200",
        icon: "card-outline" as const,
      };
    case "processing":
      return {
        label: "Processing",
        badgeBg: "bg-amber-50",
        badgeText: "text-amber-700",
        badgeBorder: "border-amber-200",
        icon: "cube-outline" as const,
      };
    case "ready_for_pickup":
      return {
        label: "Ready for Pickup",
        badgeBg: "bg-purple-50",
        badgeText: "text-purple-700",
        badgeBorder: "border-purple-200",
        icon: "archive-outline" as const,
      };
    case "picked_up":
    case "on_the_way":
      return {
        label: "On The Way",
        badgeBg: "bg-sky-50",
        badgeText: "text-sky-700",
        badgeBorder: "border-sky-200",
        icon: "bicycle-outline" as const,
      };
    case "delivered":
      return {
        label: "Delivered",
        badgeBg: "bg-emerald-50",
        badgeText: "text-emerald-700",
        badgeBorder: "border-emerald-200",
        icon: "checkmark-circle-outline" as const,
      };
    case "cancelled":
      return {
        label: "Cancelled",
        badgeBg: "bg-rose-50",
        badgeText: "text-rose-700",
        badgeBorder: "border-rose-200",
        icon: "close-circle-outline" as const,
      };
    default:
      return {
        label: formatStatus(status),
        badgeBg: "bg-gray-100",
        badgeText: "text-gray-700",
        badgeBorder: "border-gray-200",
        icon: "time-outline" as const,
      };
  }
};

const getStepperIndex = (status: string): number => {
  switch (status?.toLowerCase()) {
    case "paid":
      return 0;
    case "processing":
      return 1;
    case "ready_for_pickup":
      return 2;
    case "picked_up":
    case "on_the_way":
      return 3;
    case "delivered":
      return 4;
    default:
      return 0;
  }
};

export default function OrderDetails() {
  const { id, type } = useLocalSearchParams<{
    id: string;
    type?: MerchantOrderType;
  }>();
  const insets = useSafeAreaInsets();

  const [resolvedType, setResolvedType] = useState<MerchantOrderType>(
    type || "ecommerce",
  );

  useEffect(() => {
    if (type) {
      setResolvedType(type);
    } else {
      getAuthUser().then((user) => {
        if (
          user?.role === "RESTAURANT_MERCHANT" ||
          user?.role === "RESTAURANT_SERVICE_PROVIDER"
        ) {
          setResolvedType("restaurant");
        } else {
          setResolvedType("ecommerce");
        }
      });
    }
  }, [type]);

  const { data, isLoading, isFetching, isError, refetch } =
    useGetOrderByIdQuery(
      { id: id!, type: resolvedType },
      {
        skip: !id,
      },
    );

  const [updateStatus, { isLoading: isUpdating }] =
    useUpdateOrderStatusMutation();

  // Cancel Modal State
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [selectedReason, setSelectedReason] = useState(CANCELLATION_REASONS[0]);
  const [customReason, setCustomReason] = useState("");

  const order = data?.data?.order;
  const statusTheme = getStatusTheme(order?.status);
  const activeStep = getStepperIndex(order?.status);
  const isCancelled = order?.status === "cancelled";

  const onRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleCall = (phone?: string) => {
    if (!phone) {
      Toast.show({ type: "info", text1: "No phone number available" });
      return;
    }
    const cleanPhone = phone.replace(/[^0-9+]/g, "");
    Linking.openURL(`tel:${cleanPhone}`).catch(() => {
      Toast.show({ type: "error", text1: "Could not open dialer" });
    });
  };

  const handleOpenMap = () => {
    const address = order?.delivery_address;
    if (!address) {
      Toast.show({ type: "info", text1: "No address available" });
      return;
    }
    if (address.latitude && address.longitude) {
      const url = `https://www.google.com/maps/search/?api=1&query=${address.latitude},${address.longitude}`;
      Linking.openURL(url).catch(() => {
        Toast.show({ type: "error", text1: "Could not open map" });
      });
    } else if (address.address_text) {
      const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        address.address_text
      )}`;
      Linking.openURL(url).catch(() => {
        Toast.show({ type: "error", text1: "Could not open map" });
      });
    }
  };

  const handleStatusChange = async (
    newStatus: string,
    cancellationReason?: string
  ) => {
    if (!order) return;

    try {
      await updateStatus({
        id: order.id,
        status: newStatus,
        cancellation_reason: cancellationReason,
        type: resolvedType,
      }).unwrap();

      Toast.show({
        type: "success",
        text1: "Status updated",
        text2: `Order status changed to "${formatStatus(newStatus)}"`,
      });
      setCancelModalVisible(false);
      refetch();
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Update failed",
        text2: err?.data?.message || err?.data?.errors?.status?.[0] || "Failed to update status",
      });
    }
  };

  const handleConfirmCancel = () => {
    const reason =
      selectedReason === "Other reason" && customReason.trim()
        ? customReason.trim()
        : `${selectedReason}${customReason.trim() ? `: ${customReason.trim()}` : ""}`;
    handleStatusChange("cancelled", reason);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={tw`flex-1 bg-white items-center justify-center`}>
        <ActivityIndicator size="large" color="#5B7410" />
        <Text style={tw`text-gray-500 text-xs mt-3 font-medium`}>
          Loading order details...
        </Text>
      </SafeAreaView>
    );
  }

  if (isError || !order) {
    return (
      <SafeAreaView
        style={tw`flex-1 bg-white items-center justify-center px-5`}
      >
        <Ionicons name="alert-circle-outline" size={48} color="#9CA3AF" />
        <Text style={tw`text-gray-700 font-semibold text-base mt-3 mb-1`}>
          Failed to load order
        </Text>
        <Text style={tw`text-gray-400 text-xs text-center mb-5 px-6`}>
          We couldn't retrieve the details for this order. Check your connection and try again.
        </Text>
        <TouchableOpacity
          onPress={() => refetch()}
          style={tw`bg-[#5B7410] px-6 py-3 rounded-full flex-row items-center`}
        >
          <Ionicons name="refresh" size={16} color="white" style={tw`mr-2`} />
          <Text style={tw`text-white font-semibold text-sm`}>Try Again</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const steps = [
    { label: "Paid", key: "paid" },
    { label: "Processing", key: "processing" },
    { label: "Ready", key: "ready_for_pickup" },
    { label: "On Way", key: "on_the_way" },
    { label: "Delivered", key: "delivered" },
  ];

  return (
    <SafeAreaView style={tw`flex-1 bg-[#FAFAFA]`} edges={["bottom"]}>
      <BackButton title="Order Details" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          tw`px-4 pt-4`,
          { paddingBottom: Math.max(insets.bottom, 16) + 80 },
        ]}
        refreshControl={
          <RefreshControl
            refreshing={isFetching}
            onRefresh={onRefresh}
            colors={["#5B7410"]}
            tintColor="#5B7410"
          />
        }
      >
        {/* Order Header Card */}
        <View style={tw`bg-white rounded-2xl p-4 border border-[#ECECEC] shadow-sm mb-3.5`}>
          <View style={tw`flex-row items-center justify-between mb-2`}>
            <View>
              <Text style={tw`text-xs text-gray-400 font-medium`}>ORDER NUMBER</Text>
              <Text style={tw`text-base font-bold text-gray-900 mt-0.5`}>
                {order.order_number}
              </Text>
            </View>
            <View
              style={tw`flex-row items-center px-3 py-1.5 rounded-full border ${statusTheme.badgeBg} ${statusTheme.badgeBorder}`}
            >
              <Ionicons
                name={statusTheme.icon}
                size={14}
                style={tw`mr-1.5 ${statusTheme.badgeText}`}
              />
              <Text style={tw`text-xs font-semibold ${statusTheme.badgeText}`}>
                {statusTheme.label}
              </Text>
            </View>
          </View>
          <View style={tw`flex-row items-center justify-between pt-2 border-t border-gray-100`}>
            <Text style={tw`text-xs text-gray-500`}>
              Placed on {formatDate(order.created_at)}
            </Text>
            {order.type && (
              <View style={tw`bg-gray-100 px-2 py-0.5 rounded`}>
                <Text style={tw`text-[10px] text-gray-600 font-semibold uppercase tracking-wider`}>
                  {order.type}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Order Lifecycle Stepper or Cancellation Banner */}
        {isCancelled ? (
          <View style={tw`bg-rose-50 border border-rose-200 rounded-2xl p-4 mb-3.5`}>
            <View style={tw`flex-row items-center mb-1`}>
              <Ionicons name="alert-circle" size={18} color="#E11D48" style={tw`mr-2`} />
              <Text style={tw`text-rose-800 font-bold text-sm`}>Order Cancelled</Text>
            </View>
            <Text style={tw`text-rose-700 text-xs leading-5`}>
              {order.cancellation_reason
                ? `Reason: ${order.cancellation_reason}`
                : "This order was cancelled."}
            </Text>
          </View>
        ) : (
          <View style={tw`bg-white rounded-2xl p-4 border border-[#ECECEC] shadow-sm mb-3.5`}>
            <Text style={tw`text-xs font-bold text-gray-500 uppercase tracking-wider mb-3`}>
              Fulfillment Status
            </Text>
            <View style={tw`flex-row items-center justify-between`}>
              {steps.map((st, idx) => {
                const isPassed = activeStep > idx;
                const isCurrent = activeStep === idx;
                return (
                  <View key={st.key} style={tw`items-center flex-1`}>
                    <View
                      style={tw`w-7 h-7 rounded-full items-center justify-center border-2 ${
                        isPassed
                          ? "bg-[#5B7410] border-[#5B7410]"
                          : isCurrent
                          ? "bg-white border-[#5B7410]"
                          : "bg-gray-100 border-gray-200"
                      }`}
                    >
                      {isPassed ? (
                        <Ionicons name="checkmark" size={14} color="white" />
                      ) : (
                        <View
                          style={tw`w-2 h-2 rounded-full ${
                            isCurrent ? "bg-[#5B7410]" : "bg-gray-300"
                          }`}
                        />
                      )}
                    </View>
                    <Text
                      style={tw`text-[10px] mt-1.5 text-center ${
                        isCurrent
                          ? "text-[#5B7410] font-bold"
                          : isPassed
                          ? "text-gray-700 font-medium"
                          : "text-gray-400"
                      }`}
                      numberOfLines={1}
                    >
                      {st.label}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Ordered Items List */}
        <View style={tw`bg-white rounded-2xl p-4 border border-[#ECECEC] shadow-sm mb-3.5`}>
          <View style={tw`flex-row items-center justify-between mb-3`}>
            <Text style={tw`text-sm font-bold text-gray-900`}>
              Items ({order.items_count || order.items?.length || 0})
            </Text>
            <Text style={tw`text-xs text-gray-400`}>Package contents</Text>
          </View>

          {order.items?.map((it: any, index: number) => {
            const attrs = parseAttributes(it.variant?.attributes);
            const attrEntries = Object.entries(attrs);

            return (
              <View
                key={it.id || index}
                style={tw`border border-gray-100 rounded-xl p-3 mb-2.5 bg-[#FAFBF8]`}
              >
                <View style={tw`flex-row items-start`}>
                  <View
                    style={tw`w-16 h-16 bg-white border border-gray-200 rounded-xl overflow-hidden mr-3 items-center justify-center`}
                  >
                    <Image
                      source={
                        it.image
                          ? { uri: it.image }
                          : require("../../../assets/order/order.png")
                      }
                      style={tw`w-full h-full`}
                      resizeMode="cover"
                    />
                  </View>

                  <View style={tw`flex-1`}>
                    <Text
                      style={tw`text-sm font-semibold text-gray-800 leading-snug`}
                      numberOfLines={2}
                    >
                      {it.name}
                    </Text>

                    <Text style={tw`text-xs text-gray-500 mt-1`}>
                      Qty: <Text style={tw`font-bold text-gray-800`}>{it.quantity}</Text> ×{" "}
                      {formatPrice(it.price, order.currency)}
                    </Text>

                    {/* Variant & Attribute Tags */}
                    {attrEntries.length > 0 && (
                      <View style={tw`flex-row flex-wrap gap-1 mt-2`}>
                        {attrEntries.map(([k, v]) => (
                          <View
                            key={k}
                            style={tw`bg-white border border-[#D5E2B8] px-2 py-0.5 rounded-md`}
                          >
                            <Text style={tw`text-[10px] text-[#5B7410] font-semibold`}>
                              {k.toUpperCase()}: {String(v)}
                            </Text>
                          </View>
                        ))}
                      </View>
                    )}

                    {it.variant?.sku ? (
                      <Text style={tw`text-[10px] text-gray-400 font-mono mt-1`}>
                        SKU: {it.variant.sku}
                      </Text>
                    ) : null}
                  </View>

                  <Text style={tw`text-sm font-bold text-[#5B7410] ml-2`}>
                    {formatPrice(it.subtotal, order.currency)}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* Customer Information Card */}
        <View style={tw`bg-white rounded-2xl p-4 border border-[#ECECEC] shadow-sm mb-3.5`}>
          <View style={tw`flex-row items-center justify-between mb-3`}>
            <View style={tw`flex-row items-center`}>
              <Ionicons name="person-outline" size={16} color="#5B7410" style={tw`mr-1.5`} />
              <Text style={tw`text-sm font-bold text-gray-900`}>Customer</Text>
            </View>
            {order.customer?.phone_number ? (
              <TouchableOpacity
                onPress={() => handleCall(order.customer.phone_number)}
                style={tw`flex-row items-center bg-[#F4F7EC] px-3 py-1.5 rounded-full`}
              >
                <Ionicons name="call" size={12} color="#5B7410" style={tw`mr-1`} />
                <Text style={tw`text-xs font-semibold text-[#5B7410]`}>Call</Text>
              </TouchableOpacity>
            ) : null}
          </View>

          <View style={tw`flex-row items-center`}>
            {order.customer?.profile_photo ? (
              <Image
                source={{ uri: order.customer.profile_photo }}
                style={tw`w-12 h-12 rounded-full mr-3`}
              />
            ) : (
              <View
                style={tw`w-12 h-12 rounded-full bg-[#EAEFE0] mr-3 items-center justify-center`}
              >
                <Text style={tw`text-[#5B7410] font-bold text-base`}>
                  {order.customer?.name?.[0]?.toUpperCase() || "?"}
                </Text>
              </View>
            )}

            <View style={tw`flex-1`}>
              <Text style={tw`text-sm font-semibold text-gray-800`}>
                {order.customer?.name || "Customer"}
              </Text>
              {order.customer?.email ? (
                <Text style={tw`text-xs text-gray-500 mt-0.5`}>
                  {order.customer.email}
                </Text>
              ) : null}
              {order.customer?.phone_number ? (
                <Text style={tw`text-xs text-gray-600 mt-0.5 font-medium`}>
                  {order.customer.phone_number}
                </Text>
              ) : null}
            </View>
          </View>
        </View>

        {/* Delivery Address Card */}
        <View style={tw`bg-white rounded-2xl p-4 border border-[#ECECEC] shadow-sm mb-3.5`}>
          <View style={tw`flex-row items-center justify-between mb-3`}>
            <View style={tw`flex-row items-center`}>
              <Ionicons name="location-outline" size={16} color="#5B7410" style={tw`mr-1.5`} />
              <Text style={tw`text-sm font-bold text-gray-900`}>Delivery Address</Text>
            </View>
            {order.delivery_address && (
              <TouchableOpacity
                onPress={handleOpenMap}
                style={tw`flex-row items-center bg-[#F4F7EC] px-3 py-1.5 rounded-full`}
              >
                <Ionicons name="map-outline" size={12} color="#5B7410" style={tw`mr-1`} />
                <Text style={tw`text-xs font-semibold text-[#5B7410]`}>View Map</Text>
              </TouchableOpacity>
            )}
          </View>

          <Text style={tw`text-sm font-semibold text-gray-800 mb-1`}>
            {order.delivery_address?.title || "Customer Address"}
          </Text>
          <Text style={tw`text-xs text-gray-600 leading-5`}>
            {order.delivery_address?.address_text || "No specific address provided."}
          </Text>
          {order.delivery_address?.phone_number ? (
            <TouchableOpacity
              onPress={() => handleCall(order.delivery_address.phone_number)}
              style={tw`flex-row items-center mt-2.5`}
            >
              <Ionicons name="call-outline" size={13} color="#6B7280" style={tw`mr-1.5`} />
              <Text style={tw`text-xs text-gray-600 font-medium`}>
                {order.delivery_address.phone_number}
              </Text>
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Rider Information (if assigned) */}
        {order.rider && (
          <View style={tw`bg-white rounded-2xl p-4 border border-[#ECECEC] shadow-sm mb-3.5`}>
            <View style={tw`flex-row items-center justify-between mb-3`}>
              <View style={tw`flex-row items-center`}>
                <Ionicons name="bicycle-outline" size={16} color="#5B7410" style={tw`mr-1.5`} />
                <Text style={tw`text-sm font-bold text-gray-900`}>Assigned Rider</Text>
              </View>
              {order.rider.phone_number ? (
                <TouchableOpacity
                  onPress={() => handleCall(order.rider.phone_number)}
                  style={tw`flex-row items-center bg-[#F4F7EC] px-3 py-1.5 rounded-full`}
                >
                  <Ionicons name="call" size={12} color="#5B7410" style={tw`mr-1`} />
                  <Text style={tw`text-xs font-semibold text-[#5B7410]`}>Call Rider</Text>
                </TouchableOpacity>
              ) : null}
            </View>

            <View style={tw`flex-row items-center`}>
              {order.rider.profile_photo ? (
                <Image
                  source={{ uri: order.rider.profile_photo }}
                  style={tw`w-11 h-11 rounded-full mr-3`}
                />
              ) : (
                <View
                  style={tw`w-11 h-11 rounded-full bg-cyan-100 mr-3 items-center justify-center`}
                >
                  <Text style={tw`text-cyan-800 font-bold`}>
                    {order.rider.name?.[0]?.toUpperCase() || "R"}
                  </Text>
                </View>
              )}
              <View style={tw`flex-1`}>
                <Text style={tw`text-sm font-semibold text-gray-800`}>
                  {order.rider.name}
                </Text>
                <Text style={tw`text-xs text-gray-500 mt-0.5`}>
                  {order.rider.phone_number || "Courier Rider"}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Payment Breakdown Card */}
        <View style={tw`bg-white rounded-2xl p-4 border border-[#ECECEC] shadow-sm mb-3.5`}>
          <Text style={tw`text-sm font-bold text-gray-900 mb-3`}>
            Payment Breakdown
          </Text>

          <Row
            label="Payment Method"
            value={order.payment_method?.toUpperCase() || "M-PESA"}
          />
          {order.mpesa_receipt_number && (
            <Row label="M-Pesa Receipt" value={order.mpesa_receipt_number} />
          )}
          <Row
            label="Items Subtotal"
            value={formatPrice(
              order.subtotal ?? order.total_amount ?? 0,
              order.currency
            )}
          />
          <Row
            label="Customer Delivery Fee"
            value={formatPrice(order.delivery_fee || 0, order.currency)}
          />

          <View style={tw`h-[1px] bg-gray-100 my-2.5`} />

          <Row
            label="Customer Total Paid"
            value={formatPrice(
              order.grand_total ??
                ((order.total_amount || 0) + (order.delivery_fee || 0)),
              order.currency
            )}
            bold
          />

          {/* Highlighted Merchant Earnings */}
          <View
            style={tw`bg-[#F4F7EC] border border-[#D5E2B8] rounded-xl p-3.5 mt-3 flex-row items-center justify-between`}
          >
            <View>
              <Text style={tw`text-xs font-semibold text-gray-700`}>
                Your Estimated Payout
              </Text>
              <Text style={tw`text-[11px] text-gray-400 mt-0.5`}>
                Net earnings credited to merchant
              </Text>
            </View>
            <Text style={tw`text-base font-bold text-[#5B7410]`}>
              {formatPrice(
                (order.merchant_earnings && order.merchant_earnings > 0)
                  ? order.merchant_earnings
                  : (order.subtotal ?? order.total_amount ?? 0),
                order.currency
              )}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Floating Bottom Action Bar */}
      <View
        style={[
          tw`absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 pt-3 shadow-lg`,
          { paddingBottom: Math.max(insets.bottom, 16) },
        ]}
      >
        {isUpdating ? (
          <View style={tw`py-3 items-center justify-center`}>
            <ActivityIndicator color="#5B7410" />
            <Text style={tw`text-xs text-gray-500 font-medium mt-1`}>
              Updating order status...
            </Text>
          </View>
        ) : order.status === "paid" ? (
          <View style={tw`flex-row gap-3`}>
            <TouchableOpacity
              onPress={() => setCancelModalVisible(true)}
              style={tw`flex-1 py-3 px-2 rounded-full border border-rose-300 items-center justify-center`}
            >
              <Text
                style={tw`text-rose-600 font-semibold text-xs text-center`}
                numberOfLines={1}
              >
                Reject Order
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleStatusChange("processing")}
              style={tw`flex-[1.4] py-3 px-3 rounded-full bg-[#5B7410] items-center justify-center shadow-sm`}
            >
              <Text
                style={tw`text-white font-bold text-xs text-center`}
                numberOfLines={1}
              >
                Accept Order
              </Text>
            </TouchableOpacity>
          </View>
        ) : order.status === "processing" ? (
          <View style={tw`flex-row gap-3`}>
            <TouchableOpacity
              onPress={() => setCancelModalVisible(true)}
              style={tw`flex-1 py-3 px-2 rounded-full border border-rose-300 items-center justify-center`}
            >
              <Text
                style={tw`text-rose-600 font-semibold text-xs text-center`}
                numberOfLines={1}
              >
                Cancel Order
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleStatusChange("ready_for_pickup")}
              style={tw`flex-[1.4] py-3 px-3 rounded-full bg-[#5B7410] items-center justify-center shadow-sm`}
            >
              <Text
                style={tw`text-white font-bold text-xs text-center`}
                numberOfLines={1}
              >
                Ready for Pickup
              </Text>
            </TouchableOpacity>
          </View>
        ) : order.status === "ready_for_pickup" ? (
          <View style={tw`flex-row items-center justify-between`}>
            <View style={tw`flex-1 pr-3`}>
              <Text style={tw`text-xs font-semibold text-gray-800`}>
                Awaiting Rider Pickup
              </Text>
              <Text style={tw`text-[11px] text-gray-500`}>
                Riders have been alerted for dispatch.
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => setCancelModalVisible(true)}
              style={tw`px-4 py-2.5 rounded-full border border-rose-300`}
            >
              <Text style={tw`text-rose-600 font-semibold text-xs`}>Cancel</Text>
            </TouchableOpacity>
          </View>
        ) : order.status === "picked_up" || order.status === "on_the_way" ? (
          <View style={tw`py-1.5 flex-row items-center`}>
            <Ionicons
              name="bicycle"
              size={20}
              color="#0284C7"
              style={tw`mr-2`}
            />
            <View style={tw`flex-1`}>
              <Text style={tw`text-xs font-bold text-gray-800`}>
                Package in Transit
              </Text>
              <Text style={tw`text-[11px] text-gray-500`}>
                Rider has picked up the order and is on the way.
              </Text>
            </View>
          </View>
        ) : order.status === "delivered" ? (
          <View style={tw`py-1.5 flex-row items-center`}>
            <Ionicons
              name="checkmark-circle"
              size={22}
              color="#059669"
              style={tw`mr-2`}
            />
            <View style={tw`flex-1`}>
              <Text style={tw`text-xs font-bold text-emerald-800`}>
                Order Completed
              </Text>
              <Text style={tw`text-[11px] text-emerald-600`}>
                Successfully delivered to customer.
              </Text>
            </View>
          </View>
        ) : isCancelled ? (
          <View style={tw`py-1.5 flex-row items-center`}>
            <Ionicons
              name="close-circle"
              size={22}
              color="#E11D48"
              style={tw`mr-2`}
            />
            <View style={tw`flex-1`}>
              <Text style={tw`text-xs font-bold text-rose-800`}>
                Order Cancelled
              </Text>
              <Text style={tw`text-[11px] text-rose-600`}>
                This order was cancelled.
              </Text>
            </View>
          </View>
        ) : order.status === "pending_payment" ? (
          <View style={tw`py-1.5 flex-row items-center`}>
            <Ionicons
              name="time-outline"
              size={20}
              color="#D97706"
              style={tw`mr-2`}
            />
            <View style={tw`flex-1`}>
              <Text style={tw`text-xs font-bold text-amber-800`}>
                Awaiting Customer Payment
              </Text>
              <Text style={tw`text-[11px] text-amber-600`}>
                Customer has been prompted to enter their M-Pesa PIN.
              </Text>
            </View>
          </View>
        ) : null}
      </View>

      {/* Cancel Order Confirmation Modal */}
      <Modal
        visible={cancelModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setCancelModalVisible(false)}
      >
        <View
          style={tw`flex-1 bg-black/60 items-center justify-center px-4`}
        >
          <View
            style={tw`bg-white rounded-3xl p-5 w-full max-w-[360px] shadow-xl`}
          >
            <View style={tw`flex-row items-center justify-between mb-3`}>
              <View style={tw`flex-row items-center`}>
                <Ionicons
                  name="warning-outline"
                  size={20}
                  color="#E11D48"
                  style={tw`mr-2`}
                />
                <Text style={tw`text-base font-bold text-gray-900`}>
                  Cancel Order
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setCancelModalVisible(false)}
                style={tw`p-1`}
              >
                <Ionicons name="close" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            </View>

            <Text style={tw`text-xs text-gray-500 mb-3.5 leading-5`}>
              Select a cancellation reason. This explanation will be notified to the customer:
            </Text>

            {/* Quick Reason Selection */}
            <View style={tw`mb-3`}>
              {CANCELLATION_REASONS.map((r) => {
                const isSelected = selectedReason === r;
                return (
                  <TouchableOpacity
                    key={r}
                    onPress={() => setSelectedReason(r)}
                    style={tw`flex-row items-center py-2 px-2.5 rounded-xl mb-1 ${
                      isSelected ? "bg-rose-50" : "bg-transparent"
                    }`}
                  >
                    <View
                      style={tw`w-4 h-4 rounded-full border items-center justify-center mr-2.5 ${
                        isSelected
                          ? "border-rose-600 bg-rose-600"
                          : "border-gray-300"
                      }`}
                    >
                      {isSelected && (
                        <View style={tw`w-1.5 h-1.5 rounded-full bg-white`} />
                      )}
                    </View>
                    <Text
                      style={tw`text-xs ${
                        isSelected
                          ? "text-rose-900 font-semibold"
                          : "text-gray-700"
                      }`}
                    >
                      {r}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Optional Additional Note */}
            <TextInput
              placeholder="Optional notes or details for customer..."
              placeholderTextColor="#9CA3AF"
              value={customReason}
              onChangeText={setCustomReason}
              style={tw`border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-800 min-h-[60px] mb-4`}
              multiline
              textAlignVertical="top"
            />

            {/* Modal Actions */}
            <View style={tw`flex-row gap-2`}>
              <TouchableOpacity
                onPress={() => setCancelModalVisible(false)}
                style={tw`flex-1 py-3 rounded-full border border-gray-200 items-center justify-center`}
              >
                <Text style={tw`text-xs font-semibold text-gray-600`}>
                  Keep Order
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                disabled={isUpdating}
                onPress={handleConfirmCancel}
                style={tw`flex-1 py-3 rounded-full bg-rose-600 items-center justify-center ${
                  isUpdating ? "opacity-60" : ""
                }`}
              >
                <Text style={tw`text-xs font-bold text-white`}>
                  Confirm Cancel
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function Row({
  label,
  value,
  bold,
}: {
  label: string;
  value: string;
  bold?: boolean;
}) {
  return (
    <View style={tw`flex-row justify-between items-center mb-1.5`}>
      <Text style={tw`text-xs text-gray-500`}>{label}</Text>
      <Text
        style={tw`text-xs ${
          bold ? "font-bold text-[#5B7410]" : "font-medium text-gray-800"
        }`}
      >
        {value}
      </Text>
    </View>
  );
}

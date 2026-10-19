import AsyncStorage from "@react-native-async-storage/async-storage";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { apiUrl } from "../../lib/url";

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: `${apiUrl}/`,
    prepareHeaders: async (headers, api: any) => {
      const token = await AsyncStorage.getItem("token");
      const forget_password_token = await AsyncStorage.getItem(
        "forget-password-token",
      );

      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      } else if (forget_password_token) {
        headers.set("Authorization", `Bearer ${forget_password_token}`);
      }

      headers.set("Accept", "application/json");

      // DO NOT set Content-Type if the body is FormData!
      const body = api?.arg?.body || api?.body;
      if (body instanceof FormData) {
        headers.delete("Content-Type");
      } else {
        headers.set("Content-Type", "application/json");
      }

      return headers;
    },
  }),
  tagTypes: [
    "Auth",
    "Notification",
    "hotel",
    "Address",
    "Product",
    "Order",
    "Restaurant",
    "RestaurantFood",
    "Buses",
    "Order",
    "Payout",
    "HotelMerchantBooking"
  ],
  endpoints: () => ({}),
});

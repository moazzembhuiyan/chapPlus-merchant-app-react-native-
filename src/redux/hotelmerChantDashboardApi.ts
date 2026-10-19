import { baseApi } from "./baseApi";

const hotelMerchantDashboardApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getHotelMerchantDashboard: builder.query({
      query: () => ({
        url: `/merchant/hotel/home`,
        method: "GET",
      }),
    }),
  }),
});

export const { useGetHotelMerchantDashboardQuery } = hotelMerchantDashboardApi;
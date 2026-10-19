import { baseApi } from "./baseApi";

const hotelmerchantAnalyticsApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getHotelAnalytics: builder.query({
      query: (params?: { year?: number }) => ({
        url: `/merchant/hotel/analytics`,
        method: "GET",
        params: params?.year ? { year: params.year } : undefined,
      }),
    }),
    getHotelTopPerformers: builder.query({
      query: (params?: { page?: number }) => ({
        url: `/merchant/hotel/analytics/top-performers`,
        method: "GET",
        params: { page: params?.page || 1, per_page: 15 },
      }),
    }),
  }),
});

export const {
  useGetHotelAnalyticsQuery,
  useGetHotelTopPerformersQuery,
} = hotelmerchantAnalyticsApi;
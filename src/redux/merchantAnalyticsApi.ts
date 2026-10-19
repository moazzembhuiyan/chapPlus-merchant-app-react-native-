import { baseApi } from "./baseApi";

const AnalyticsApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getAnalytics: builder.query({
      query: (year?: number) => ({
        url: `/merchant/ecommerce/analytics`,
        method: "GET",
        params: year ? { year } : undefined,
      }),
    }),

    getTopSellingProducts: builder.query({
      query: (params?: { page?: number; per_page?: number }) => ({
        url: `/merchant/ecommerce/analytics/top-products`,
        method: "GET",
        params: {
          page: params?.page || 1,
          per_page: params?.per_page || 5,
        },
      }),
    }),
    getRestaurantAnalytics: builder.query({
      query: (year?: number) => ({
        url: `/merchant/restaurant/analytics`,
        method: "GET",
        params: year ? { year } : undefined,
      }),
    }),

    getHotelAnalytics: builder.query({
      query: (year?: number) => ({
        url: `/merchant/hotel/analytics`,
        method: "GET",
        params: year ? { year } : undefined,
      }),
    }),
  }),
});

export const {
  useGetAnalyticsQuery,
  useGetTopSellingProductsQuery,
  useGetRestaurantAnalyticsQuery,
  useGetHotelAnalyticsQuery,
} = AnalyticsApi;

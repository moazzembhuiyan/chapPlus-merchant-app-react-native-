import { baseApi } from "./baseApi";

export type BookingQueryParams = {
  page?: number;
  per_page?: number;
  status?: string; // pending_payment | paid | checked_in | completed | cancelled | failed
  search?: string;
};

const hotelmerchantBookingApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getHotelMerchantBooking: builder.query({
      query: (params: BookingQueryParams = {}) => ({
        url: `/merchant/hotel/bookings`,
        method: "GET",
        params: {
          page: params.page || 1,
          per_page: params.per_page || 10,
          ...(params.status && params.status !== "all"
            ? { status: params.status }
            : {}),
          ...(params.search ? { search: params.search } : {}),
        },
      }),
      // pagination merge
      serializeQueryArgs: ({ endpointName, queryArgs }) =>
        `${endpointName}-${queryArgs?.status || "all"}-${queryArgs?.search || ""}`,
      merge: (currentCache, newItems, { arg }) => {
        if (!currentCache || (arg?.page || 1) === 1) return newItems;
        const oldList = currentCache?.data?.bookings?.data ?? [];
        const newList = newItems?.data?.bookings?.data ?? [];
        return {
          ...newItems,
          data: {
            ...newItems.data,
            bookings: {
              ...newItems.data.bookings,
              data: [...oldList, ...newList],
            },
          },
        };
      },
      forceRefetch({ currentArg, previousArg }) {
        return (
          currentArg?.page !== previousArg?.page ||
          currentArg?.status !== previousArg?.status ||
          currentArg?.search !== previousArg?.search
        );
      },
      providesTags: ["HotelMerchantBooking"],
    }),

    getHotelMerchantBookingById: builder.query({
      query: (id: string | number) => ({
        url: `/merchant/hotel/bookings/${id}`,
        method: "GET",
      }),
      providesTags: ["HotelMerchantBooking"],
    }),

    updateHotelMerchantBookingStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/merchant/hotel/bookings/${id}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["HotelMerchantBooking"],
    }),
  }),
});

export const {
  useGetHotelMerchantBookingQuery,
  useGetHotelMerchantBookingByIdQuery,
    useUpdateHotelMerchantBookingStatusMutation,
} = hotelmerchantBookingApi;
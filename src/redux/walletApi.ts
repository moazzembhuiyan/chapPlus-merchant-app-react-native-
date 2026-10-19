import { baseApi } from "./baseApi";

const WalletApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getPayoutHistory: builder.query({
      query: () => ({
        url: `/wallet/payouts`,
        method: "GET",
      }),
      providesTags: ["Payout"],
    }),
    requestPayout: builder.mutation({
      query: (data: { amount: number; mpesa_number: string }) => ({
        url: `/wallet/payout`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Payout"],
    }),
  }),
});

export const { useGetPayoutHistoryQuery, useRequestPayoutMutation } = WalletApi;

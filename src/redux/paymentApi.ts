import { baseApi } from "./baseApi";

export const paymentApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    proceedToCheckout : builder.mutation({
        query : (payload)=>({
            url : `/ecommerce/checkout`,
            method : "POST",
            body : payload
        }),
        invalidatesTags : ["Order","Product"]
    })
    
  }),
});

export const {useProceedToCheckoutMutation} = paymentApi;
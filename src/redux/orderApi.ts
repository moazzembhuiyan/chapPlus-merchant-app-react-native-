import { baseApi } from "./baseApi";

export type MerchantOrderType = "ecommerce" | "restaurant";

export interface OrdersQueryParams {
  type?: MerchantOrderType;
  status?: string;
  search?: string;
  per_page?: number;
  page?: number;
  date_from?: string;
  date_to?: string;
}

export type OrderDetailArg =
  | string
  | number
  | { id: string | number; type?: MerchantOrderType };

export interface UpdateOrderStatusPayload {
  id: string | number;
  status: string;
  cancellation_reason?: string;
  type?: MerchantOrderType;
}

const OrderApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    // GET all orders (with filters)
    getOrders: builder.query({
      query: (params: OrdersQueryParams = {}) => {
        const merchantType = params.type || "ecommerce";
        const queryParams: Record<string, string | number> = {};

        if (params.status && params.status !== "all") {
          queryParams.status = params.status;
        }
        if (params.search?.trim()) {
          queryParams.search = params.search.trim();
        }
        if (params.per_page) queryParams.per_page = params.per_page;
        if (params.page) queryParams.page = params.page;
        if (params.date_from) queryParams.date_from = params.date_from;
        if (params.date_to) queryParams.date_to = params.date_to;

        return {
          url: `/merchant/${merchantType}/orders`,
          method: "GET",
          params: queryParams,
        };
      },
      providesTags: ["Order"],
    }),

    // GET single order
    getOrderById: builder.query({
      query: (arg: OrderDetailArg) => {
        const orderId = typeof arg === "object" ? arg.id : arg;
        const merchantType =
          typeof arg === "object" && arg.type ? arg.type : "ecommerce";

        return {
          url: `/merchant/${merchantType}/orders/${orderId}`,
          method: "GET",
        };
      },
      providesTags: (_result, _error, arg) => [
        { type: "Order", id: typeof arg === "object" ? arg.id : arg },
      ],
    }),

    // CHANGE status
    updateOrderStatus: builder.mutation({
      query: ({
        id,
        status,
        cancellation_reason,
        type = "ecommerce",
      }: UpdateOrderStatusPayload) => ({
        url: `/merchant/${type}/orders/${id}/status`,
        method: "PATCH",
        body: {
          status,
          ...(cancellation_reason ? { cancellation_reason } : {}),
        },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        "Order",
        { type: "Order", id },
      ],
    }),
  }),
});

export const {
  useGetOrdersQuery,
  useGetOrderByIdQuery,
  useUpdateOrderStatusMutation,
} = OrderApi;

// merchantDashboardApi.ts
interface DashboardResponse {
  status: string;
  message: string;
  data: {
    sales: {
      total: number;
      growth_percentage: number;
      is_positive: boolean;
    };
    stats: {
      orders: number;
      products: number;
      customers: number;
    };
    recent_activity: Array<{
      id: number;
      order_number: string;
      total_amount: number;
      items_count: number;
      status: string;
      created_at: string;
      product_name: string;
      product_image: string | null;
    }>;
  };
}
import { baseApi } from "./baseApi"


const MerchantDashboardApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
getMerchantDashboard: builder.query<DashboardResponse, void>({
  query: () => ({
    url: `/merchant/ecommerce/home`,
    method: "GET",
  }),
}),
    
  }),

})  

export const { useGetMerchantDashboardQuery } = MerchantDashboardApi
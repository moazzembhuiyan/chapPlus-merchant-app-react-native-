import AsyncStorage from "@react-native-async-storage/async-storage";
import { uploadFormData } from "../../lib/uploadFormData";
import { apiUrl } from "../../lib/url";
import { baseApi } from "./baseApi";

export interface ProductsQueryParams {
  search?: string;
  status?: string; // active | inactive | out_of_stock
  category_slug?: string;
  min_price?: number;
  max_price?: number;
  sort?: string;
  per_page?: number;
  page?: number;
}

const ProductApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getProducts: builder.query({
      query: (params: ProductsQueryParams = {}) => {
        const q: Record<string, string | number> = {};
        if (params.search?.trim()) q.search = params.search.trim();
        if (params.status) q.status = params.status;
        if (params.category_slug) q.category_slug = params.category_slug;
        if (params.min_price != null) q.min_price = params.min_price;
        if (params.max_price != null) q.max_price = params.max_price;
        if (params.sort) q.sort = params.sort;
        if (params.per_page) q.per_page = params.per_page;
        if (params.page) q.page = params.page;

        return {
          url: `/merchant/ecommerce/products`,
          method: "GET",
          params: q,
        };
      },
      providesTags: ["Product"],
    }),

    getProductById: builder.query({
      query: (id: string | number) => ({
        url: `/merchant/ecommerce/products/${id}`,
        method: "GET",
      }),
      providesTags: (_r, _e, id) => [{ type: "Product", id }],
    }),

    getCategories: builder.query({
      query: (params: { parent_category?: string; category_id?: number | string } = {}) => {
        const q: Record<string, string | number> = {};
        if (params.parent_category) q.parent_category = params.parent_category;
        if (params.category_id) q.category_id = params.category_id;

        return {
          url: `/merchant/ecommerce/categories`,
          method: "GET",
          params: q,
        };
      },
      providesTags: ["Product"],
    }),

    createProduct: builder.mutation({
      async queryFn(formData: FormData, _api, _extra, baseQuery) {
        try {
          const state: any = _api.getState();
          const token =
            state?.auth?.token || (await AsyncStorage.getItem("token"));

          const result = await uploadFormData(
            `${apiUrl}/merchant/ecommerce/products`,
            formData,
            token,
          );
          return { data: result };
        } catch (error: any) {
          const formatted = error?.message || "Upload failed";
          return {
            error: {
              status: error?.status || "CUSTOM_ERROR",
              error: formatted,
              data: error?.data || error,
              message: formatted,
            },
          };
        }
      },
      invalidatesTags: ["Product"],
    }),

    updateProduct: builder.mutation({
      async queryFn(
        { id, formData }: { id: string | number; formData: FormData },
        _api,
      ) {
        try {
          const state: any = _api.getState();
          const token =
            state?.auth?.token || (await AsyncStorage.getItem("token"));

          formData.append("_method", "PATCH");
          const result = await uploadFormData(
            `${apiUrl}/merchant/ecommerce/products/${id}`,
            formData,
            token,
          );
          return { data: result };
        } catch (error: any) {
          const formatted = error?.message || "Update failed";
          return {
            error: {
              status: error?.status || "CUSTOM_ERROR",
              error: formatted,
              data: error?.data || error,
              message: formatted,
            },
          };
        }
      },
      invalidatesTags: (_r, _e, { id }) => ["Product", { type: "Product", id }],
    }),

    deleteProduct: builder.mutation({
      query: (id: string | number) => ({
        url: `/merchant/ecommerce/products/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Product"],
    }),

    toggleProductStatus: builder.mutation({
      query: ({
        id,
        is_active,
      }: {
        id: string | number;
        is_active: boolean;
      }) => ({
        url: `/merchant/ecommerce/products/${id}/status`,
        method: "PATCH",
        body: { is_active },
      }),
      invalidatesTags: ["Product"],
    }),
  }),
});

export const {
  useGetProductsQuery,
  useGetProductByIdQuery,
  useGetCategoriesQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useToggleProductStatusMutation,
} = ProductApi;

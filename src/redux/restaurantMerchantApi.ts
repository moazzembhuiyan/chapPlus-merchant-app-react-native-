import AsyncStorage from "@react-native-async-storage/async-storage";
import { uploadFormData } from "../../lib/uploadFormData";
import { apiUrl } from "../../lib/url";
import { baseApi } from "./baseApi";

export interface RestaurantFoodsQueryParams {
  search?: string;
  status?: string; // active | inactive | out_of_stock
  category_slug?: string;
  min_price?: number;
  max_price?: number;
  sort?: string;
  per_page?: number;
  page?: number;
}

export interface FoodCategory {
  id: number;
  name: string;
  slug: string;
  subcategories?: FoodCategory[];
}

export interface FoodItem {
  id: number;
  name: string;
  description: string | null;
  base_price: number;
  discount_price: number | null;
  effective_price: number;
  currency: string;
  unit_type: string;
  unit_value: string | null;
  has_variants: boolean;
  is_active: boolean;
  total_stock: number;
  in_stock: boolean;
  primary_image: string | null;
  images?: { id: number; image_url: string; is_primary: boolean }[];
  category: { id: number; name: string; slug: string } | null;
}

export interface RestaurantFoodsResponse {
  status: string;
  message: string;
  data: {
    counts: {
      all: number;
      active: number;
      inactive: number;
      out_of_stock: number;
    };
    products: {
      current_page: number;
      data: FoodItem[];
      last_page: number;
      per_page: number;
      total: number;
    };
  };
}

export const restaurantMerchantApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getRestaurantFoods: builder.query<RestaurantFoodsResponse, RestaurantFoodsQueryParams | void>({
      query: (params = {}) => {
        const q: Record<string, string | number> = {};
        if (params?.search?.trim()) q.search = params.search.trim();
        if (params?.status) q.status = params.status;
        if (params?.category_slug) q.category_slug = params.category_slug;
        if (params?.min_price != null) q.min_price = params.min_price;
        if (params?.max_price != null) q.max_price = params.max_price;
        if (params?.sort) q.sort = params.sort;
        if (params?.per_page) q.per_page = params.per_page;
        if (params?.page) q.page = params.page;

        return {
          url: `/merchant/restaurant/foods`,
          method: "GET",
          params: q,
        };
      },
      providesTags: ["RestaurantFood"],
    }),

    getRestaurantFoodById: builder.query({
      query: (id: string | number) => ({
        url: `/merchant/restaurant/foods/${id}`,
        method: "GET",
      }),
      providesTags: (_r, _e, id) => [{ type: "RestaurantFood", id }],
    }),

    getRestaurantCategories: builder.query<{ status: string; message: string; data: { categories: FoodCategory[] } }, { parent_category?: string; category_id?: number | string } | void>({
      query: (params = {}) => {
        const q: Record<string, string | number> = {};
        if (params?.parent_category) q.parent_category = params.parent_category;
        if (params?.category_id) q.category_id = params.category_id;

        return {
          url: `/merchant/restaurant/categories`,
          method: "GET",
          params: q,
        };
      },
      providesTags: ["RestaurantFood"],
    }),

    createRestaurantCategory: builder.mutation<
      { status: string; message: string; data: { category: FoodCategory } },
      { name: string; parent_id?: number | null }
    >({
      query: (payload) => ({
        url: `/merchant/restaurant/categories`,
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["RestaurantFood"],
    }),

    createRestaurantFood: builder.mutation({
      async queryFn(formData: FormData, _api) {
        try {
          const state: any = _api.getState();
          const token =
            state?.auth?.token || (await AsyncStorage.getItem("token"));

          const result = await uploadFormData(
            `${apiUrl}/merchant/restaurant/foods`,
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
      invalidatesTags: ["RestaurantFood"],
    }),

    updateRestaurantFood: builder.mutation({
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
            `${apiUrl}/merchant/restaurant/foods/${id}`,
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
      invalidatesTags: (_r, _e, { id }) => ["RestaurantFood", { type: "RestaurantFood", id }],
    }),

    deleteRestaurantFood: builder.mutation({
      query: (id: string | number) => ({
        url: `/merchant/restaurant/foods/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_r, _e, id) => ["RestaurantFood", { type: "RestaurantFood", id }],
    }),

    toggleRestaurantFoodStatus: builder.mutation({
      query: ({
        id,
        is_active,
      }: {
        id: string | number;
        is_active: boolean;
      }) => ({
        url: `/merchant/restaurant/foods/${id}/status`,
        method: "PATCH",
        body: { is_active },
      }),
      invalidatesTags: (_r, _e, { id }) => ["RestaurantFood", { type: "RestaurantFood", id }],
    }),
  }),
});

export const {
  useGetRestaurantFoodsQuery,
  useGetRestaurantFoodByIdQuery,
  useGetRestaurantCategoriesQuery,
  useCreateRestaurantCategoryMutation,
  useCreateRestaurantFoodMutation,
  useUpdateRestaurantFoodMutation,
  useDeleteRestaurantFoodMutation,
  useToggleRestaurantFoodStatusMutation,
} = restaurantMerchantApi;

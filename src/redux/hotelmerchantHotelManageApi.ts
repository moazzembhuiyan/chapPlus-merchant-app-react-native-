// reuse your uploadFormData helper from products
import { apiUrl } from "../../lib/url";
import { baseApi } from "./baseApi";
import AsyncStorage from "@react-native-async-storage/async-storage";

const BASE_URL = apiUrl;
function uploadFormData(
  url: string,
  formData: FormData,
  token?: string | null,
  method: "POST" | "PUT" = "POST",
): Promise<any> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(method, url);
    if (token) {
      xhr.setRequestHeader("Authorization", `Bearer ${token}`);
      xhr.setRequestHeader("Accept", "application/json");
    }
    xhr.onload = () => {
      let json: any = null;
      try {
        json = JSON.parse(xhr.responseText);
      } catch {
        json = xhr.responseText;
      }
      if (xhr.status >= 200 && xhr.status < 300) resolve(json);
      else
        reject({
          status: xhr.status,
          data: json,
          message: json?.message || "Request failed",
        });
    };
    xhr.onerror = () => reject({ message: "Network request failed" });
    xhr.send(formData);
  });
}

const HotelMerchantHotelManageApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getHotelMerchantHotelManage: builder.query({
      query: (params?: { page?: number; search?: string }) => ({
        url: `/merchant/hotel/properties`,
        method: "GET",
        params: {
          page: params?.page || 1,
          per_page: 15,
          ...(params?.search ? { search: params.search } : {}),
        },
      }),
      providesTags: ["hotel"],
    }),

    getHotelMerchantHotelManageById: builder.query({
      query: (id: string | number) => ({
        url: `/merchant/hotel/properties/${id}`,
        method: "GET",
      }),
      providesTags: ["hotel"],
    }),

    createHotelMerchantHotelManage: builder.mutation({
      async queryFn(formData: FormData, api) {
        try {
          const token =
            (api.getState() as any)?.auth?.token ||
            (await AsyncStorage.getItem("token"));
          const result = await uploadFormData(
            `${BASE_URL}/merchant/hotel/properties`,
            formData,
            token,
            "POST",
          );
          return { data: result };
        } catch (error: any) {
          return {
            error: {
              status: error?.status || "CUSTOM_ERROR",
              data: error?.data || error,
              error: error?.message || "Create failed",
            },
          };
        }
      },
      invalidatesTags: ["hotel"],
    }),

    updateHotelMerchantHotelManage: builder.mutation({
      async queryFn(
        { id, formData }: { id: string | number; formData: FormData },
        api,
      ) {
        try {
          // Laravel often wants POST + _method=PUT for multipart
          formData.append("_method", "PUT");
          const token =
            (api.getState() as any)?.auth?.token ||
            (await AsyncStorage.getItem("token"));
          const result = await uploadFormData(
            `${BASE_URL}/merchant/hotel/properties/${id}`,
            formData,
            token,
            "POST",
          );
          return { data: result };
        } catch (error: any) {
          return {
            error: {
              status: error?.status || "CUSTOM_ERROR",
              data: error?.data || error,
              error: error?.message || "Update failed",
            },
          };
        }
      },
      invalidatesTags: ["hotel"],
    }),

    deleteHotelMerchantHotelManage: builder.mutation({
      query: (id: string | number) => ({
        url: `/merchant/hotel/properties/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["hotel"],
    }),
  }),
});

export const {
  useGetHotelMerchantHotelManageQuery,
  useGetHotelMerchantHotelManageByIdQuery,
  useCreateHotelMerchantHotelManageMutation,
  useUpdateHotelMerchantHotelManageMutation,
  useDeleteHotelMerchantHotelManageMutation,
} = HotelMerchantHotelManageApi;
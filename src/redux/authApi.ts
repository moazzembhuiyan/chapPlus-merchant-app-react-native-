import { baseApi } from "./baseApi";
export const authApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    userRegistration: builder.mutation({
      query: (data) => ({
        url: "/merchant/register",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Auth"],
    }),
    login: builder.mutation({
      query: (payload) => ({
        url: `/auth/merchant/login`,
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["Auth"],
    }),
    verifyOtp: builder.mutation({
      query: (payload) => ({
        url: `/auth/email/verify`,
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["Auth"],
    }),
    resendOtp: builder.mutation({
      query: (payload) => ({
        url: `/auth/email/resend`,
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["Auth"],
    }),
    userProfile: builder.query({
      query: () => ({
        url: "/merchant/profile",
        method: "GET",
      }),
      providesTags: ["Auth"],
    }),
    logout: builder.mutation({
      query: (payload?: { expo_push_token?: string; type?: "all" | string }) => ({
        url: "/auth/logout",
        method: "POST",
        body: payload || {},
      }),
      invalidatesTags: ["Auth", "Notification", "Product", "Order"],
    }),
    changePassword: builder.mutation({
      query: (payload) => ({
        url: "/merchant/profile/password",
        method: "PUT",
        body: payload,
      }),
      invalidatesTags: ["Auth"],
    }),
    deleteProfile: builder.mutation({
      query: () => ({
        url: "/merchant/profile",
        method: "DELETE",
      }),
      invalidatesTags: ["Auth"],
    }),
    userProfileUpdate: builder.mutation({
      query: (formData) => ({
        url: `/merchant/profile`,
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Auth"],
    }),
    forgotPassword: builder.mutation({
      query: (payload) => ({
        url: `/auth/forgot-password`,
        method: "POST",
        body: payload,
      }),
    }),

    resetPassword: builder.mutation({
      query: (payload) => ({
        url: `/auth/reset-password`,
        method: "POST",
        body: payload,
      }),
    }),
  }),
});

export const {
  useUserRegistrationMutation,
  useLoginMutation,
  useUserProfileQuery,
  useLogoutMutation,
  useChangePasswordMutation,
  useDeleteProfileMutation,
  useUserProfileUpdateMutation,
  useVerifyOtpMutation,
  useResendOtpMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
} = authApi;

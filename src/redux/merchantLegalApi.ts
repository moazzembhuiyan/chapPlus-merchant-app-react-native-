import { baseApi } from "./baseApi";

const LegalApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getAboutUs: builder.query({
      query: () => ({
        url: `/merchant/pages/about-us`,
        method: "GET",
      }),
    }),
    getPrivacyPolicy: builder.query({
      query: () => ({
        url: `/merchant/pages/privacy-policy`,
        method: "GET",
      }),
    }),
    getTerms: builder.query({
      query: () => ({
        url: `/merchant/pages/terms-and-conditions`,
        method: "GET",
      }),
    }),
  }),
});

export const {
  useGetAboutUsQuery,
  useGetPrivacyPolicyQuery,
  useGetTermsQuery,
} = LegalApi;

import { baseApi } from "./baseApi";

export const merchantNotificationApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getNotifications: builder.query({
      query: ({ page = 1, per_page = 15, filter = "all" }) => ({
        url: "/notifications",
        params: { page, per_page, filter },
      }),
      providesTags: ["Notification"],
      serializeQueryArgs: ({ endpointName, queryArgs }) =>
        `${endpointName}-${queryArgs?.filter || "all"}`,
      merge: (currentCache, newItems, { arg }) => {
        if (!currentCache || arg.page === 1) {
          return newItems;
        }
        // response: { data: [], pagination, unread_count }
        return {
          ...newItems,
          data: [...(currentCache.data || []), ...(newItems.data || [])],
          unread_count: newItems.unread_count,
          pagination: newItems.pagination,
        };
      },
      forceRefetch({ currentArg, previousArg }) {
        return (
          currentArg?.page !== previousArg?.page ||
          currentArg?.filter !== previousArg?.filter
        );
      },
    }),

    markAsRead: builder.mutation({
      query: (id: string) => ({
        url: `/notifications/${id}/read`,
        method: "POST",
      }),
      invalidatesTags: ["Notification"],
    }),

    markAllAsRead: builder.mutation({
      query: () => ({
        url: `/notifications/read-all`,
        method: "POST",
      }),
      invalidatesTags: ["Notification"],
    }),

    deleteNotification: builder.mutation({
      query: (id: string) => ({
        url: `/notifications/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Notification"],
    }),

    updatePushToken: builder.mutation({
      query: (body: {
        expo_push_token: string;
        platform?: string;
        device_name?: string;
        device_id?: string;
      }) => ({
        url: `/push-token`,
        method: "POST",
        body,
      }),
    }),

    removePushToken: builder.mutation({
      query: (params?: { expo_push_token?: string }) => ({
        url: `/push-token`,
        method: "DELETE",
        body: params,
      }),
    }),
  }),
});

export const {
  useGetNotificationsQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
  useDeleteNotificationMutation,
  useUpdatePushTokenMutation,
  useRemovePushTokenMutation,
} = merchantNotificationApi;

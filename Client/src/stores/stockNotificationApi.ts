import { baseApi } from "./baseApi";

export const stockNotificationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    subscribeToStock: builder.mutation<
      { message: string },
      { email: string; productId: number }
    >({
      query: (body) => ({
        url: "/StockNotifications",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const { useSubscribeToStockMutation } = stockNotificationApi;

import { baseApi } from "./baseApi";
import type { IBasket, BasketItemRequest } from "../types/basket";
import type { AddressDto } from "../types/account";

export const basketApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getBasket: builder.query<IBasket, void>({
      query: () => "/baskets",
      providesTags: ["Basket"],
    }),
    addProductToBasket: builder.mutation<IBasket, BasketItemRequest[]>({
      query: (items) => ({
        url: "/baskets",
        method: "POST",
        body: items,
      }),
      invalidatesTags: ["Basket"],
    }),
    updateBasket: builder.mutation<IBasket, BasketItemRequest[]>({
      query: (items) => ({
        url: "/baskets",
        method: "PUT",
        body: items,
      }),
      invalidatesTags: ["Basket"],
    }),
    removeProductFromBasket: builder.mutation<void, number>({
      query: (productId) => ({
        url: `/baskets/items/${productId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Basket"],
    }),
    setShippingAddress: builder.mutation<IBasket, AddressDto>({
      query: (address) => ({
        url: "/baskets/shipping-address",
        method: "PUT",
        body: address,
      }),
      invalidatesTags: ["Basket"],
    }),
  }),
});

export const {
  useGetBasketQuery,
  useAddProductToBasketMutation,
  useUpdateBasketMutation,
  useRemoveProductFromBasketMutation,
  useSetShippingAddressMutation,
} = basketApi;

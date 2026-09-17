import { baseApi } from './baseApi';
import type { IFavorite } from '../types/favorite';

export const favoriteApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getFavorite: builder.query<IFavorite, void>({
      query: () => '/favorites',
      providesTags: ['Favorite'],
    }),
    addFavorite: builder.mutation<IFavorite, number>({
      query: (productId) => ({
        url: `/favorites/${productId}`,
        method: 'POST',
      }),
      invalidatesTags: ['Favorite'],
    }),
    removeFavorite: builder.mutation<void, number>({
      query: (productId) => ({
        url: `/favorites/${productId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Favorite'],
    }),
    deleteFavorite: builder.mutation<void, void>({
      query: () => ({
        url: '/favorites',
        method: 'DELETE',
      }),
      invalidatesTags: ['Favorite'],
    }),
  }),
});

export const {
  useGetFavoriteQuery,
  useAddFavoriteMutation,
  useRemoveFavoriteMutation,
  useDeleteFavoriteMutation,
} = favoriteApi;

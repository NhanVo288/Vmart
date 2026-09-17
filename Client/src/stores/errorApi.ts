import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL } from '../config/constants';

export const errorApi = createApi({
  reducerPath: 'errorApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    credentials: 'include',
  }),
  endpoints: (builder) => ({
    getNotFound: builder.query<void, void>({
      query: () => '/buggy/not-found',
    }),
    getBadRequest: builder.query<void, void>({
      query: () => '/buggy/bad-request',
    }),
    getUnauthorized: builder.query<void, void>({
      query: () => '/buggy/unauthorized',
    }),
    getValidationError: builder.query<void, void>({
      query: () => '/buggy/validation-error',
    }),
    getServerError: builder.query<void, void>({
      query: () => '/buggy/server-error',
    }),
  }),
});

export const {
  useGetNotFoundQuery,
  useGetBadRequestQuery,
  useGetUnauthorizedQuery,
  useGetValidationErrorQuery,
  useGetServerErrorQuery,
} = errorApi;

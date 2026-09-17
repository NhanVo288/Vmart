import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { toast } from 'react-toastify';
import { API_BASE_URL } from '../config/constants';
import type { ErrorResponse } from '../types/error';
import { getErrorHandler, defaultHandler } from './errorHandlers';

const rawBaseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  credentials: 'include',
  prepareHeaders: (headers) => {
    const token = localStorage.getItem('token');
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    const language = localStorage.getItem('language') || 'en';
    headers.set('Accept-Language', language);
    return headers;
  },
});

const baseQueryWithErrorHandling: BaseQueryFn<
  FetchArgs | string,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const result = await rawBaseQuery(args, api, extraOptions);

  if (result.error) {
    const originalStatus = result.error.status === 'PARSING_ERROR' && result.error.originalStatus
      ? result.error.originalStatus
      : result.error.status;

    if (typeof originalStatus === 'string') {
      toast.error('Network error - please check your connection');
      return result;
    }

    if (originalStatus === 401) {
      return result;
    }

    const responseData = (result.error.data ?? {}) as ErrorResponse;
    const handler = getErrorHandler(originalStatus) ?? defaultHandler;
    handler(responseData);
  }

  return result;
};

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithErrorHandling,
  tagTypes: ['Product', 'Basket', 'Favorite', 'Order', 'User', 'StockNotification', 'Log', 'AdminNotification'],
  refetchOnFocus: false,    
  refetchOnReconnect: true,
  keepUnusedDataFor: 300,
  endpoints: () => ({}),
});

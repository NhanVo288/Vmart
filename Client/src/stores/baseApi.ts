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
    const language = localStorage.getItem('language') || 'en';
    headers.set('Accept-Language', language);
    return headers;
  },
});

let refreshRequest: Promise<boolean> | null = null;

const baseQueryWithErrorHandling: BaseQueryFn<
  FetchArgs | string,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await rawBaseQuery(args, api, extraOptions);

  const requestUrl = typeof args === 'string' ? args : args.url;
  const isAuthenticationRequest = [
    '/account/login',
    '/account/register',
    '/account/refresh',
  ].some((path) => requestUrl.endsWith(path));

  if (result.error?.status === 401 && !isAuthenticationRequest) {
    if (!refreshRequest) {
      refreshRequest = (async () => {
        const refreshResult = await rawBaseQuery(
          { url: '/account/refresh', method: 'POST' },
          api,
          extraOptions,
        );
        return !refreshResult.error;
      })().finally(() => {
        refreshRequest = null;
      });
    }

    if (await refreshRequest) {
      result = await rawBaseQuery(args, api, extraOptions);
    } else {
      api.dispatch({ type: 'auth/logout' });
    }
  }

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

import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import type { SerializedError } from '@reduxjs/toolkit';
import { useGetProductsQuery } from '../stores/productApi';
import { extractErrorMessage } from '../utils/errorMessage';
import type { IProductFilters } from '../types/product';

function getErrorMessage(error: FetchBaseQueryError | SerializedError): string {
  if ('status' in error) {
    return extractErrorMessage(error);
  }
  return error.message ?? 'Unknown error';
}

export function useProducts(filters?: IProductFilters) {
  const { data: result, isLoading: loading, error } = useGetProductsQuery(filters);

  return {
    products: result?.items ?? [],
    pagination: result ? {
      pageNumber: result.pageNumber,
      pageSize: result.pageSize,
      totalCount: result.totalCount,
      totalPages: result.totalPages,
      hasPreviousPage: result.hasPreviousPage,
      hasNextPage: result.hasNextPage,
    } : null,
    loading,
    error: error ? getErrorMessage(error) : null,
  };
}

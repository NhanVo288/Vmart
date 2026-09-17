import { useGetProductByIdQuery } from '../stores/productApi';
import { extractErrorMessage } from '../utils/errorMessage';

export function useProduct(id: number) {
  const { data: product, isLoading: loading, error } = useGetProductByIdQuery(id);

  const errorMessage = error
    ? 'status' in error
      ? extractErrorMessage(error)
      : (error.message ?? 'An unexpected error occurred')
    : null;

  return { product: product ?? null, loading, error: errorMessage };
}

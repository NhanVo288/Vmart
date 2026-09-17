import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import type { ErrorResponse } from '../types/error';

export function extractErrorMessage(error: FetchBaseQueryError): string {
  if (error.status === 'FETCH_ERROR') return 'Network error - please check your connection';
  if (error.status === 'PARSING_ERROR') return 'Failed to process server response';
  if (error.status === 'TIMEOUT_ERROR') return 'Request timed out';
  if (error.status === 'CUSTOM_ERROR') return error.error;

  const data = error.data as ErrorResponse | undefined;
  if (!data) return 'An unexpected error occurred';

  if (typeof data === 'string') return data;
  if (data.errors) return Object.values(data.errors).flat().join(', ');
  return data.title || 'An unexpected error occurred';
}
import { toast } from 'react-toastify';
import { navigate } from '../lib/navigation';
import type { ErrorResponse } from '../types/error';

const errorHandlers: Record<number, (data: ErrorResponse) => void> = {
  400: (data) => {
    if (!data) { toast.error('Bad request'); return; }
    if (typeof data === 'string') {
      toast.error(data);
    } else if (data.errors) {
      const messages = Object.values(data.errors).flat().join(', ');
      toast.error(messages);
    } else {
      toast.error(data.title || 'Bad request');
    }
  },
  401: () => {
    // Silent — token expired or missing; AuthInitializer handles cleanup
  },
  403: (data) => {
    const msg = typeof data === 'string' ? data : data?.title || 'You do not have permission to perform this action';
    toast.error(msg);
  },
  404: () => navigate('/not-found'),
  500: (data) => navigate('/server-error', { state: { error: data } }),
};

const defaultHandler = () => toast.error('An unexpected error occurred');

export function getErrorHandler(status: number): ((data: ErrorResponse) => void) | undefined {
  return errorHandlers[status];
}

export { defaultHandler };

export function registerErrorHandler(status: number, handler: (data: ErrorResponse) => void): void {
  errorHandlers[status] = handler;
}

export const GRADIENT = 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)';       // indigo-600 → violet-600
export const GRADIENT_DARK = 'linear-gradient(135deg, #818cf8 0%, #c4b5fd 100%)';  // indigo-400 → violet-300

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:7255/api';

export const PAGE_SIZES = [6, 10, 24, 48];

export const NAV_LINKS = [
  { label: 'Home', path: '/' },
  { label: 'Products', path: '/products' },
  { label: 'About', path: '/about' },
  { label: 'Contact', path: '/contact' },
  { label: 'Error Test', path: '/errors' },
];

export const NETWORK_ERROR = 'Network error - please check your connection';

export function formatPrice(amount: number): string {
  return Number.isInteger(amount) ? `${amount}` : `${amount.toFixed(2)}`;
}

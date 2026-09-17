import type { ReactNode } from 'react';

export type AppRoute = {
  path: string;
  element: ReactNode;
  children?: AppRoute[];
};

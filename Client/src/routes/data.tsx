import ProductDetailsPage from '../features/products/pages/ProductDetailsPage';
import { ProductsPage } from '../features/products/pages/ProductsPage';
import { HomePage } from '../features/home/pages/HomePage';
import { CartPage } from '../features/basket/pages/CartPage';
import { CheckoutPage } from '../features/checkout/pages/CheckoutPage';
import { NotFoundPage } from '../pages/NotFoundPage';
import { ServerErrorPage } from '../pages/ServerErrorPage';
import { ErrorTestPage } from '../pages/ErrorTestPage';
import { AboutPage } from '../pages/AboutPage';
import { TechnologiesPage } from '../pages/TechnologiesPage';
import { ContactPage } from '../pages/ContactPage';
import { LoginPage } from '../features/account/pages/LoginPage';
import { RegisterPage } from '../features/account/pages/RegisterPage';
import { ProfilePage } from '../features/account/pages/ProfilePage';
import { ForgotPasswordPage } from '../features/account/pages/ForgotPasswordPage';
import { ResetPasswordPage } from '../features/account/pages/ResetPasswordPage';
import { FavoritesPage } from '../features/favorites/pages/FavoritesPage';
import { OrdersPage } from '../features/orders/pages/OrdersPage';
import { OrderDetailsPage } from '../features/orders/pages/OrderDetailsPage';
import { AdminPage } from '../features/admin/pages/AdminPage';
import { AdminProductsPage } from '../features/admin/pages/AdminProductsPage';
import { AdminProductFormPage } from '../features/admin/pages/AdminProductFormPage';
import { AdminOrdersPage } from '../features/admin/pages/AdminOrdersPage';
import { AdminUsersPage } from '../features/admin/pages/AdminUsersPage';
import { AdminDashboardPage } from '../features/admin/pages/AdminDashboardPage';
import { AdminLogsPage } from '../features/admin/pages/AdminLogsPage';
import { AdminHealthChecksPage } from '../features/admin/pages/AdminHealthChecksPage';
import { VendorPage } from '../features/vendor/pages/VendorPage';
import { VendorProductsPage } from '../features/vendor/pages/VendorProductsPage';
import { VendorProductFormPage } from '../features/vendor/pages/VendorProductFormPage';
import { VendorOrdersPage } from '../features/vendor/pages/VendorOrdersPage';
import { VendorDashboardPage } from '../features/vendor/pages/VendorDashboardPage';
import type { AppRoute } from '../types/route';
import { Navigate } from 'react-router-dom';
import { PrivateRoute } from './PrivateRoute';
import { AdminRoute } from '../features/admin/components/AdminRoute';
import { VendorRoute } from '../features/vendor/components/VendorRoute';

export const publicRoutes: AppRoute[] = [
  { path: '/', element: <HomePage /> },
  { path: '/products', element: <ProductsPage /> },
  { path: '/about', element: <AboutPage /> },
  { path: '/technologies', element: <TechnologiesPage /> },
  { path: '/contact', element: <ContactPage /> },
  { path: '/favorites', element: <FavoritesPage /> },
  { path: '/items/:id', element: <ProductDetailsPage /> },
  { path: '/cart', element: <CartPage /> },
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
  { path: '/forgot-password', element: <ForgotPasswordPage /> },
  { path: '/reset-password', element: <ResetPasswordPage /> },
  { path: '/errors', element: <ErrorTestPage /> },
  { path: '/not-found', element: <NotFoundPage /> },
  { path: '/server-error', element: <ServerErrorPage /> },
  { path: '*', element: <Navigate replace to="/not-found" /> },
];

export const protectedRoutes: AppRoute[] = [
  { path: '/checkout', element: <PrivateRoute><CheckoutPage /></PrivateRoute> },
  { path: '/profile', element: <PrivateRoute><ProfilePage /></PrivateRoute> },
  { path: '/orders', element: <PrivateRoute><OrdersPage /></PrivateRoute> },
  { path: '/orders/:id', element: <PrivateRoute><OrderDetailsPage /></PrivateRoute> },
];

export const adminRoutes: AppRoute[] = [
  {
    path: '/admin',
    element: (
      <AdminRoute>
        <AdminPage />
      </AdminRoute>
    ),
    children: [
      { path: '', element: <AdminDashboardPage /> },
      { path: 'products', element: <AdminProductsPage /> },
      { path: 'products/new', element: <AdminProductFormPage /> },
      { path: 'products/:id/edit', element: <AdminProductFormPage /> },
      { path: 'orders', element: <AdminOrdersPage /> },
      { path: 'users', element: <AdminUsersPage /> },
      { path: 'logs', element: <AdminLogsPage /> },
      { path: 'health-checks', element: <AdminHealthChecksPage /> },
    ],
  },
];

export const vendorRoutes: AppRoute[] = [
  {
    path: '/vendor',
    element: (
      <VendorRoute>
        <VendorPage />
      </VendorRoute>
    ),
    children: [
      { path: '', element: <VendorDashboardPage /> },
      { path: 'products', element: <VendorProductsPage /> },
      { path: 'products/new', element: <VendorProductFormPage /> },
      { path: 'products/:id/edit', element: <VendorProductFormPage /> },
      { path: 'orders', element: <VendorOrdersPage /> },
    ],
  },
];

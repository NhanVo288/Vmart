import { baseApi } from "./baseApi";
import type { IProduct, IPaginatedList } from "../types/product";
import type { OrderDto, IOrderFilters } from "../types/order";
import type { LogEntry, LogStats, LogFilters } from "../types/log";
import type { IAdminNotification } from "../types/adminNotification";

type HealthCheckItem = {
  name: string;
  status: string;
  duration: number;
  description: string | null;
  exception: string | null;
};

export type HealthCheckResult = {
  status: string;
  totalDuration: number;
  checks: HealthCheckItem[];
};

type UserListItem = {
  id: string;
  email: string;
  userName: string;
  roles: string[];
};

export const adminApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createProduct: builder.mutation<IProduct, FormData>({
      query: (formData) => ({
        url: "/products",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Product"],
    }),
    updateProduct: builder.mutation<IProduct, { id: number; formData: FormData }>({
      query: ({ id, formData }) => ({
        url: `/products/${id}`,
        method: "PUT",
        body: formData,
      }),
      invalidatesTags: (_, __, { id }) => [
        { type: "Product", id },
        "Product",
      ],
    }),
    deleteProduct: builder.mutation<void, number>({
      query: (id) => ({
        url: `/products/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Product"],
    }),
    getAdminOrders: builder.query<IPaginatedList<OrderDto>, IOrderFilters | void>({
      query: (params) => {
        const searchParams = new URLSearchParams();
        if (params?.status) searchParams.set("status", params.status);
        if (params?.searchTerm) searchParams.set("searchTerm", params.searchTerm);
        if (params?.orderBy) searchParams.set("orderBy", params.orderBy);
        if (params?.ascending !== undefined) searchParams.set("ascending", String(params.ascending));
        if (params?.pageNumber) searchParams.set("pageNumber", String(params.pageNumber));
        if (params?.pageSize) searchParams.set("pageSize", String(params.pageSize));
        return `/admin/orders?${searchParams.toString()}`;
      },
      providesTags: ["Order"],
    }),
    updateOrderStatus: builder.mutation<void, { id: number; status: string }>({
      query: ({ id, status }) => ({
        url: `/admin/orders/${id}/status`,
        method: "PUT",
        body: { status },
      }),
      invalidatesTags: ["Order"],
    }),
    getAdminUsers: builder.query<UserListItem[], void>({
      query: () => "/admin/users",
      providesTags: ["User"],
    }),
    getUserById: builder.query<UserListItem, string>({
      query: (id) => `/admin/users/${id}`,
    }),
    updateUserRoles: builder.mutation<void, { id: string; roles: string[] }>({
      query: ({ id, roles }) => ({
        url: `/admin/users/${id}/roles`,
        method: "PUT",
        body: { roles },
      }),
      invalidatesTags: ["User"],
    }),
    getLogs: builder.query<IPaginatedList<LogEntry>, LogFilters | void>({
      query: (params) => {
        const searchParams = new URLSearchParams();
        if (params?.page) searchParams.set("page", String(params.page));
        if (params?.pageSize) searchParams.set("pageSize", String(params.pageSize));
        if (params?.level) searchParams.set("level", params.level);
        if (params?.from) searchParams.set("from", params.from);
        if (params?.to) searchParams.set("to", params.to);
        if (params?.search) searchParams.set("search", params.search);
        return `/admin/logs?${searchParams.toString()}`;
      },
      providesTags: ["Log"],
    }),
    getLogStats: builder.query<LogStats, void>({
      query: () => "/admin/logs/stats",
      providesTags: ["Log"],
    }),
    getAdminNotifications: builder.query<IPaginatedList<IAdminNotification>, { pageNumber?: number; pageSize?: number; isRead?: boolean | null } | void>({
      query: (params) => {
        const searchParams = new URLSearchParams();
        if (params?.pageNumber) searchParams.set("pageNumber", String(params.pageNumber));
        if (params?.pageSize) searchParams.set("pageSize", String(params.pageSize));
        if (params?.isRead !== undefined && params?.isRead !== null) searchParams.set("isRead", String(params.isRead));
        return `/admin/notifications?${searchParams.toString()}`;
      },
      providesTags: ["AdminNotification"],
    }),
    getUnreadNotificationCount: builder.query<number, void>({
      query: () => "/admin/notifications/unread-count",
      providesTags: ["AdminNotification"],
    }),
    markAdminNotificationRead: builder.mutation<void, number>({
      query: (id) => ({
        url: `/admin/notifications/${id}/read`,
        method: "PATCH",
      }),
      invalidatesTags: ["AdminNotification"],
    }),
    markAllAdminNotificationsRead: builder.mutation<void, void>({
      query: () => ({
        url: "/admin/notifications/read-all",
        method: "PATCH",
      }),
      invalidatesTags: ["AdminNotification"],
    }),
    getHealthChecks: builder.query<HealthCheckResult, void>({
      query: () => "/admin/health-checks",
    }),
  }),
});

export const {
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useGetAdminOrdersQuery,
  useUpdateOrderStatusMutation,
  useGetAdminUsersQuery,
  useGetUserByIdQuery,
  useUpdateUserRolesMutation,
  useGetLogsQuery,
  useGetLogStatsQuery,
  useGetAdminNotificationsQuery,
  useGetUnreadNotificationCountQuery,
  useMarkAdminNotificationReadMutation,
  useMarkAllAdminNotificationsReadMutation,
  useGetHealthChecksQuery,
} = adminApi;

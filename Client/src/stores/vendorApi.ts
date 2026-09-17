import { baseApi } from "./baseApi";
import type { IProduct, IPaginatedList } from "../types/product";
import type { IOrderFilters } from "../types/order";

export interface VendorOrderDto {
  id: number;
  buyerEmail?: string;
  orderDate: string;
  status: string;
  vendorSubtotal: number;
  orderItems: {
    productId: number;
    productName: string;
    pictureUrl: string;
    price: number;
    quantity: number;
  }[];
}

export interface VendorDashboardDto {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
}

export const vendorApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getVendorProducts: builder.query<IPaginatedList<IProduct>, Partial<{
      pageNumber: number;
      pageSize: number;
      searchTerm: string | null;
      orderBy: string;
      ascending: boolean;
    }> | void>({
      query: (params) => {
        const searchParams = new URLSearchParams();
        if (params?.pageNumber) searchParams.set("pageNumber", String(params.pageNumber));
        if (params?.pageSize) searchParams.set("pageSize", String(params.pageSize));
        if (params?.searchTerm) searchParams.set("searchTerm", params.searchTerm);
        if (params?.orderBy) searchParams.set("orderBy", params.orderBy);
        if (params?.ascending !== undefined) searchParams.set("ascending", String(params.ascending));
        return `/vendor/products?${searchParams.toString()}`;
      },
      providesTags: ["Product"],
    }),
    getVendorOrders: builder.query<IPaginatedList<VendorOrderDto>, IOrderFilters | void>({
      query: (params) => {
        const searchParams = new URLSearchParams();
        if (params?.status) searchParams.set("status", params.status);
        if (params?.searchTerm) searchParams.set("searchTerm", params.searchTerm);
        if (params?.orderBy) searchParams.set("orderBy", params.orderBy);
        if (params?.ascending !== undefined) searchParams.set("ascending", String(params.ascending));
        if (params?.pageNumber) searchParams.set("pageNumber", String(params.pageNumber));
        if (params?.pageSize) searchParams.set("pageSize", String(params.pageSize));
        return `/vendor/orders?${searchParams.toString()}`;
      },
      providesTags: ["Order"],
    }),
    getVendorDashboard: builder.query<VendorDashboardDto, void>({
      query: () => "/vendor/dashboard",
    }),
  }),
});

export const {
  useGetVendorProductsQuery,
  useGetVendorOrdersQuery,
  useGetVendorDashboardQuery,
} = vendorApi;

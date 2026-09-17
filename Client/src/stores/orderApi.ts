import { baseApi } from './baseApi';
import type { OrderDto, CreateOrderDto, IOrderFilters } from '../types/order';
import type { IPaginatedList } from '../types/product';

export const orderApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getOrders: builder.query<IPaginatedList<OrderDto>, IOrderFilters | void>({
      query: (params) => {
        const searchParams = new URLSearchParams();
        if (params?.status) searchParams.set('status', params.status);
        if (params?.searchTerm) searchParams.set('searchTerm', params.searchTerm);
        if (params?.orderBy) searchParams.set('orderBy', params.orderBy);
        if (params?.ascending !== undefined) searchParams.set('ascending', String(params.ascending));
        if (params?.pageNumber) searchParams.set('pageNumber', String(params.pageNumber));
        if (params?.pageSize) searchParams.set('pageSize', String(params.pageSize));
        return `/orders?${searchParams.toString()}`;
      },
      providesTags: ['Order'],
    }),
    getOrderById: builder.query<OrderDto, number>({
      query: (id) => `/orders/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Order', id }],
    }),
    createOrder: builder.mutation<OrderDto, CreateOrderDto>({
      query: (body) => ({
        url: '/orders',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Order','Basket'],
    }),
  }),
});

export const {
  useGetOrdersQuery,
  useGetOrderByIdQuery,
  useCreateOrderMutation,
} = orderApi;

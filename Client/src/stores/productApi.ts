import { baseApi } from "./baseApi";
import type { IProduct, IProductFilters, IPaginatedList, IProductFilterOptions } from "../types/product";

export const productApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProducts: builder.query<IPaginatedList<IProduct>, IProductFilters | void>({
      query: (params) => {
        const searchParams = new URLSearchParams();
        if (params?.orderBy) searchParams.set("orderBy", params.orderBy);
        if (params?.ascending !== undefined)
          searchParams.set("ascending", String(params.ascending));
        if (params?.searchTerm) searchParams.set("searchTerm", params.searchTerm);
        if (params?.brands) searchParams.set("brands", params.brands);
        if (params?.types) searchParams.set("types", params.types);
        if (params?.minPrice !== undefined && params?.minPrice !== null) searchParams.set("minPrice", String(params.minPrice));
        if (params?.maxPrice !== undefined && params?.maxPrice !== null) searchParams.set("maxPrice", String(params.maxPrice));
        if (params?.pageNumber) searchParams.set("pageNumber", String(params.pageNumber));
        if (params?.pageSize) searchParams.set("pageSize", String(params.pageSize));
        return `/products?${searchParams.toString()}`;
      },
      providesTags: ["Product"],
    }),
    getProductById: builder.query<IProduct, number>({
      query: (id) => `/products/${id}`,
      providesTags: (_, __, id) => [{ type: "Product", id }],
    }),
    getProductFilters: builder.query<IProductFilterOptions, IProductFilters | void>({
      query: (params) => {
        const searchParams = new URLSearchParams();
        if (params?.searchTerm) searchParams.set("searchTerm", params.searchTerm);
        if (params?.brands) searchParams.set("brands", params.brands);
        if (params?.types) searchParams.set("types", params.types);
        if (params?.minPrice !== undefined && params?.minPrice !== null) searchParams.set("minPrice", String(params.minPrice));
        if (params?.maxPrice !== undefined && params?.maxPrice !== null) searchParams.set("maxPrice", String(params.maxPrice));
        return `/products/filters?${searchParams.toString()}`;
      },
    }),
  }),
});

export const { useGetProductsQuery, useGetProductByIdQuery, useGetProductFiltersQuery } = productApi;

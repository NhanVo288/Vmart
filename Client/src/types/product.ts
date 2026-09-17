type IProduct = {
  id: number;
  name: string;
  description: string;
  price: number;
  pictureUrl: string;
  brand: string;
  type: string;
  quantityInStock: number;
  sellerId?: string | null;
}

interface IProductFilters {
  orderBy: string;
  ascending: boolean;
  searchTerm?: string | null;
  brands?: string | null;
  types?: string | null;
  minPrice?: number | null;
  maxPrice?: number | null;
  pageNumber?: number;
  pageSize?: number;
}

type IPaginatedList<T> = {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

type IProductFilterOptions = {
  brands: string[];
  types: string[];
  minPrice: number;
  maxPrice: number;
}

export type { IProduct, IProductFilters, IPaginatedList, IProductFilterOptions };
import type { AddressDto } from './account';

export interface OrderItemDto {
  productId: number;
  productName: string;
  pictureUrl: string;
  price: number;
  quantity: number;
}

export interface PaymentSummaryDto {
  last4: number;
  expMonth: number;
  expYear: number;
  brand: string;
}

export interface OrderDto {
  id: number;
  buyerId: string;
  buyerEmail?: string;
  orderDate: string;
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  status: string;
  shippingAddress?: AddressDto;
  paymentSummary?: PaymentSummaryDto;
  paymentReference?: string;
  emailSent?: boolean;
  emailError?: string;
  orderItems: OrderItemDto[];
}

export interface CreateOrderDto {
  shippingAddress: AddressDto;
  paymentReference?: string;
  paymentSummary?: PaymentSummaryDto;
}

export interface IOrderFilters {
  status?: string | null;
  searchTerm?: string | null;
  orderBy?: string;
  ascending?: boolean;
  pageNumber?: number;
  pageSize?: number;
}

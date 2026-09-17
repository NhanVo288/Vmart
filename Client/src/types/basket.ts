export type IBasketItem = {
  productId: number;
  productName: string;
  price: number;
  pictureUrl: string;
  brand: string;
  type: string;
  quantity: number;
  quantityInStock: number;
}

export type IBasket = {
  id: number;
  buyerId: string;
  paymentQrUrl?: string;
  paymentReference?: string;
  deliveryFee?: number;
  discount?: number;
  shippingAddress?: {
    name: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
  items: IBasketItem[];
}

export type BasketItemRequest = {
  productId: number;
  quantity: number;
}

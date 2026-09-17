export interface IFavoriteItem {
  productId: number;
  productName: string;
  price: number;
  pictureUrl: string;
  brand: string;
  type: string;
}

export interface IFavorite {
  id: number;
  buyerId: string;
  items: IFavoriteItem[];
}

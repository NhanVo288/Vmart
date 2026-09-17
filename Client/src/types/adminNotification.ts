export interface IAdminNotification {
  id: number;
  action: "ProductCreated" | "ProductDeleted" | string;
  productId: number;
  productName: string;
  vendorId?: string;
  vendorName?: string;
  message: string;
  createdAt: string;
  isRead: boolean;
}

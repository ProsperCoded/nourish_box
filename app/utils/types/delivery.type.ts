export type Delivery = {
  deliveryId: string;
  transactionId?: string; // Optional, will be set after transaction creation
  deliveryName: string;
  deliveryEmail: string;
  deliveryPhone: string;
  deliveryAddress: string;
  deliveryCity: string;
  deliveryState: string;
  deliveryNote: string;
  createdAt: string;
  updatedAt: string;
};

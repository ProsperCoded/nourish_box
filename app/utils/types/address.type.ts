export type Address = {
  id: string; // Unique identifier for the address
  name: string; // Recipient name
  street: string; // Street address
  city: string; // City
  state: string; // State
  lga: string; // Local Government Area
  isPrimary: boolean; // Primary address flag
  createdAt: string; // Creation timestamp
  updatedAt: string; // Last update timestamp
};

export type CreateAddressInput = Omit<
  Address,
  'id' | 'createdAt' | 'updatedAt'
>;
export type UpdateAddressInput = Partial<CreateAddressInput> & { id: string };

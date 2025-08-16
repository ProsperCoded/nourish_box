export type Category = {
  id: string;
  name: string;
  description?: string | null;
  order: number; // used for sorting categories
  createdAt: string; // date in ISO format
  updatedAt: string; // date in ISO format
};

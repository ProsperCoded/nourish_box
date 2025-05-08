export type User = {
  id: string;
  name: string;
  email: string;
  password: string;
  phone: string;
  address: string;
  role: string; // "admin" | "user"
  createdAt: string; // date in ISO format
  updatedAt: string; // date in ISO format
};

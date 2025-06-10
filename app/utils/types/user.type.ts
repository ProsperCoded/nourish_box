export type User = {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  role: "admin" | "user";
  createdAt: string; // date in ISO format
  updatedAt: string; // date in ISO format
};

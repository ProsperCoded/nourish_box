export type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  lga: string;
  role: "admin" | "user";
  profilePicture?: string; // URL to the profile picture
  createdAt: string;
  updatedAt: string;
};

import { Address } from './address.type';

export type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  // Legacy address fields for backward compatibility
  address?: string;
  city?: string;
  state?: string;
  lga?: string;
  // New addresses array for multiple address support
  addresses?: Address[];
  role: 'admin' | 'user';
  profilePicture?: string; // URL to the profile picture
  createdAt: string;
  updatedAt: string;
};

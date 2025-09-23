import { Address } from './address.type';

export type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  // Multiple address support
  addresses?: Address[];
  role: 'admin' | 'user';
  profilePicture?: string; // URL to the profile picture
  createdAt: string;
  updatedAt: string;
};

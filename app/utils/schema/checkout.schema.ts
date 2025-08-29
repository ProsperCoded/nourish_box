import { z } from 'zod';

// Zod validation for phone numbers, strips non-digit characters
const phoneValidation = z
  .string()
  .transform(val => val.replace(/\D/g, ''))
  .pipe(
    z
      .string()
      .min(10, { message: 'Phone number must be 10 or 13 digits' })
      .max(13, { message: 'Phone number must be 10 or 13 digits' })
  );

// Schema for the complete delivery form (for guests or new addresses)
export const deliveryInfoSchema = z.object({
  deliveryName: z
    .string()
    .trim()
    .min(1, { message: 'Recipient name is required' }),
  deliveryEmail: z
    .string()
    .email({ message: 'Please enter a valid email address' }),
  deliveryPhone: phoneValidation,
  deliveryAddress: z
    .string()
    .trim()
    .min(1, { message: 'Street address is required' }),
  deliveryCity: z.string().trim().min(1, { message: 'City is required' }),
  deliveryState: z.string().trim().min(1, { message: 'State is required' }),
  deliveryLGA: z.string().trim().min(1, { message: 'LGA is required' }),
});

// Schema for contact info when a saved address is used
export const contactInfoSchema = z.object({
  deliveryEmail: z
    .string()
    .email({ message: 'Please enter a valid email address' }),
  deliveryPhone: phoneValidation,
});

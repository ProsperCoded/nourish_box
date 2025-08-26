import { db } from '@/app/lib/firebase';
import { COLLECTION } from '@/app/utils/schema/collection.enum';
import {
  BusinessRules,
  DEFAULT_BUSINESS_RULES,
} from '@/app/utils/types/site-content.type';
import { doc, getDoc } from 'firebase/firestore';

const SITE_CONTENT_ID = 'main-site-content';

/**
 * Get business rules from Firestore (client-side)
 */
export async function getBusinessRules(): Promise<BusinessRules> {
  try {
    const docRef = doc(db, COLLECTION.site_content, SITE_CONTENT_ID);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      console.warn(
        'Site content document not found, using default business rules'
      );
      return DEFAULT_BUSINESS_RULES;
    }

    const data = docSnap.data();

    // Return business rules if they exist, otherwise use defaults
    return data.businessRules || DEFAULT_BUSINESS_RULES;
  } catch (error) {
    console.error('Error fetching business rules:', error);
    // Return default business rules on error
    return DEFAULT_BUSINESS_RULES;
  }
}

/**
 * Calculate tax amount based on subtotal and business rules
 */
export function calculateTax(
  subtotal: number,
  businessRules: BusinessRules
): number {
  if (!businessRules.taxEnabled || businessRules.taxRate === 0) {
    return 0;
  }

  return (subtotal * businessRules.taxRate) / 100;
}

/**
 * Calculate total amount including delivery fee and tax
 */
export function calculateTotalWithBusinessRules(
  subtotal: number,
  businessRules: BusinessRules
): {
  deliveryFee: number;
  tax: number;
  total: number;
} {
  const deliveryFee = businessRules.deliveryFee;
  const tax = calculateTax(subtotal, businessRules);
  const total = subtotal + deliveryFee + tax;

  return {
    deliveryFee,
    tax,
    total,
  };
}

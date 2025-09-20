import { getDeliveryCostForLocation } from '@/app/utils/firebase/delivery-costs.firebase';
import { BusinessRules } from '@/app/utils/types/site-content.type';
import { useRouter } from 'next/navigation';

/**
 * Utility function to navigate to checkout page
 * Can be used from anywhere in the application
 */
export const navigateToCheckout = (router: ReturnType<typeof useRouter>) => {
  router.push('/checkout');
};

/**
 * Hook to provide checkout navigation functionality
 */
export const useCheckoutNavigation = () => {
  const router = useRouter();

  const goToCheckout = () => {
    navigateToCheckout(router);
  };

  return { goToCheckout };
};

/**
 * Calculate tax amount based on subtotal and business rules
 */
export const calculateTax = (
  subtotal: number,
  businessRules: BusinessRules
): number => {
  if (!businessRules.taxEnabled || businessRules.taxRate === 0) {
    return 0;
  }

  return Math.round((subtotal * businessRules.taxRate) / 100);
};

/**
 * Calculate total price breakdown including delivery fee and tax (legacy version)
 * @deprecated Use calculateTotalWithDynamicDelivery instead for dynamic delivery costs
 */
export const calculateTotalWithBusinessRules = (
  subtotal: number,
  businessRules: BusinessRules
): {
  subtotal: number;
  deliveryFee: number;
  tax: number;
  total: number;
} => {
  const deliveryFee = businessRules.deliveryFee;
  const tax = calculateTax(subtotal, businessRules);
  const total = subtotal + deliveryFee + tax;

  return {
    subtotal,
    deliveryFee,
    tax,
    total,
  };
};

/**
 * Calculate total price breakdown with dynamic delivery cost
 */
export const calculateTotalWithDynamicDelivery = (
  subtotal: number,
  deliveryFee: number,
  businessRules: BusinessRules
): {
  subtotal: number;
  deliveryFee: number;
  tax: number;
  total: number;
} => {
  const tax = calculateTax(subtotal, businessRules);
  const total = subtotal + deliveryFee + tax;

  return {
    subtotal,
    deliveryFee,
    tax,
    total,
  };
};

/**
 * Fetch delivery cost for a specific location
 */
export const fetchDeliveryCostForLocation = async (
  state: string,
  lga: string
): Promise<number> => {
  try {
    const cost = await getDeliveryCostForLocation(state, lga);
    return cost || 0; // Return 0 if no cost found
  } catch (error) {
    console.error('Error fetching delivery cost:', error);
    return 0; // Return 0 as fallback
  }
};

/**
 * Format price for display
 */
export const formatPrice = (amount: number): string => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
  }).format(amount);
};

/**
 * Generate payment reference
 */
export const generatePaymentReference = (): string => {
  return `NB_${new Date().getTime()}_${Math.random()
    .toString(36)
    .substr(2, 9)}`;
};

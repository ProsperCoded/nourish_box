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
 * Validate delivery information
 */
export const validateDeliveryInfo = (
  deliveryInfo: any
): { isValid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};
  const requiredFields = [
    'deliveryName',
    'deliveryEmail',
    'deliveryPhone',
    'deliveryAddress',
    'deliveryCity',
    'deliveryState',
    'deliveryLGA',
  ];

  requiredFields.forEach(field => {
    if (!deliveryInfo[field]?.trim()) {
      errors[field] = 'This field is required';
    }
  });

  // Email validation
  if (
    deliveryInfo.deliveryEmail &&
    !/\S+@\S+\.\S+/.test(deliveryInfo.deliveryEmail)
  ) {
    errors.deliveryEmail = 'Please enter a valid email address';
  }

  // Phone validation
  if (
    deliveryInfo.deliveryPhone &&
    !/^\d{10,11}$/.test(deliveryInfo.deliveryPhone.replace(/\D/g, ''))
  ) {
    errors.deliveryPhone = 'Please enter a valid phone number';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
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
 * Calculate total price breakdown including delivery fee and tax
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

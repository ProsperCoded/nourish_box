export interface BusinessRules {
  deliveryFee: number; // Delivery fee in NGN
  taxRate: number; // Tax rate as percentage (e.g., 7.5 for 7.5%)
  taxEnabled: boolean; // Whether tax should be applied
}

export interface SiteContent {
  id: string;
  heroHeading: string;
  heroDescription: string;
  heroImage: {
    url: string;
    publicId: string;
    type: 'image' | 'video';
  };
  businessRules: BusinessRules;
  createdAt: string;
  updatedAt: string;
}

export interface SiteContentUpdate {
  heroHeading?: string;
  heroDescription?: string;
  heroImage?: {
    url: string;
    publicId: string;
    type: 'image' | 'video';
  };
  businessRules?: Partial<BusinessRules>;
  updatedAt: string;
}

export const DEFAULT_BUSINESS_RULES: BusinessRules = {
  deliveryFee: 1500, // Default delivery fee in NGN
  taxRate: 7.5, // Default tax rate of 7.5%
  taxEnabled: true, // Tax enabled by default
};

export const DEFAULT_SITE_CONTENT: Omit<
  SiteContent,
  'id' | 'createdAt' | 'updatedAt'
> = {
  heroHeading: 'Cooking Made Fun and Easy',
  heroDescription:
    'Nourish Box removes the hassle of meal prep by delivering pre-measured, pre-cut ingredients along with guided recipes.',
  heroImage: {
    url: '/hero.png', // This will be moved to public folder or use the imported asset
    publicId: 'hero-default',
    type: 'image',
  },
  businessRules: DEFAULT_BUSINESS_RULES,
};

export type Recipe = {
  id: string;
  name: string;
  description: string;
  displayUrl: string;
  samples: { variant: string; image: string }[];
  duration: number; //seconds
  price: number; //naira
  ingredients: string[];

  order: number; // used for sorting
  featured: boolean; // used for filtering recipe that that should appear on homepage

  clicks: number; // used for tracking recipe clicks
  createdAt: string; // date in ISO format
  updatedAt: string; // date in ISO format
};

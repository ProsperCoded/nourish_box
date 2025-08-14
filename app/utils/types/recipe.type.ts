// import { StaticImageData } from "next/image";

export type Recipe = {
  id: string;
  name: string;
  description: string | null;
  displayMedia: { url: string; publicId: string; type: 'image' | 'video' };
  samples: {
    variant: string;
    media: { url: string; publicId: string; type: 'image' | 'video' };
  }[];
  duration: number; //seconds
  price: number; //naira
  ingredients?: string | string[] | null;
  numberOfIngredients?: number | null;
  servings?: number | string | null;
  difficulty?: string;
  categoryId?: string | null; // reference to category
  category?: string | null; // reference to category
  order: number; // used for sorting
  featured: boolean; // used for filtering recipe that that should appear on homepage

  clicks: number; // used for tracking recipe clicks
  createdAt: string; // date in ISO format
  updatedAt: string; // date in ISO format
};

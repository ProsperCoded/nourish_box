export interface SiteContent {
  id: string;
  heroHeading: string;
  heroDescription: string;
  heroImage: {
    url: string;
    publicId: string;
    type: "image" | "video";
  };
  createdAt: string;
  updatedAt: string;
}

export interface SiteContentUpdate {
  heroHeading?: string;
  heroDescription?: string;
  heroImage?: {
    url: string;
    publicId: string;
    type: "image" | "video";
  };
  updatedAt: string;
}

export const DEFAULT_SITE_CONTENT: Omit<
  SiteContent,
  "id" | "createdAt" | "updatedAt"
> = {
  heroHeading: "Cooking Made Fun and Easy",
  heroDescription:
    "Nourish Box removes the hassle of meal prep by delivering pre-measured, pre-cut ingredients along with guided recipes.",
  heroImage: {
    url: "/app/assets/hero.png",
    publicId: "hero-default",
    type: "image",
  },
};

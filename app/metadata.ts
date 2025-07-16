import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Nourish Box – Fresh Meal Kits Delivered",
  description:
    "Nourish Box is a meal-kit delivery service dedicated to making fresh, high-quality ingredients accessible and convenient. Simplify home cooking with pre-portioned, pre-cut ingredients and step-by-step recipes. Enjoy healthy, delicious meals at home!",
  icons: {
    icon: "/logo.ico",
  },
  openGraph: {
    title: "Nourish Box – Fresh Meal Kits Delivered",
    description:
      "Nourish Box is your go-to destination for delicious and nutritious meal kits. Fresh ingredients, easy recipes, and unmatched convenience for all skill levels.",
    url: "https://nourishboxng.co",
    type: "website",
    images: [
      {
        url: "/hero.png",
        width: 1200,
        height: 630,
        alt: "Nourish Box Hero Image",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Nourish Box – Fresh Meal Kits Delivered",
    description:
      "Nourish Box makes healthy eating easy and enjoyable. Get fresh, pre-portioned ingredients and simple recipes delivered to your door.",
    images: [
      {
        url: "/hero-section.jpg",
        alt: "Nourish Box Hero Image",
      },
    ],
  },
};

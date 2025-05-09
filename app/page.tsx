"use client";
import Nav from "./components/nav";
import Image from "next/image";
import hero from "./assets/hero.png";
import hover_img_one from "./assets/Frame 464.png";
import hover_img_two from "./assets/Frame 466.png";
import broccoli from "./assets/Broccoli.png";
import tomato from "./assets/Tomato.png";
import RecipeCard from "./components/RecipeCard";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Recipe } from "./utils/types/recipe.type";
import { fetchRecipes } from "./utils/firebase/recipes";

import AboutUs from "./components/about_us";
import CommunityList from "./components/community";
import Banner from "./components/banner";
import Footer from "./components/footer";
import Link from "next/link";
// import { runSeed } from "@/app/utils/seed/seed-script";

export default function Home() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const loadRecipes = async () => {
      try {
        const fetchedRecipes = await fetchRecipes();
        setRecipes(fetchedRecipes);
      } catch (error) {
        console.error("Error loading recipes:", error);
      } finally {
        setLoading(false);
      }
    };

    loadRecipes();
  }, []);
  // Seeding
  // useEffect(() => {
  //   // console.log("seeding into database...");
  //   runSeed().catch(console.error);
  // }, []);
  return (
    <div>
      <div className="hidden justify-center items-center w-screen h-screen">
        This page is not available for small screen sizes
      </div>
      <div className="block">
        <div className="flex lg:flex-row flex-col justify-center">
          <div className="flex lg:flex-row flex-col md:flex-col justify-between items-center py-10 lg:py-20 lg:w-10/12">
            <div className="flex flex-col items-center lg:items-start p-4 lg:p-10 lg:w-1/2 lg:text-left text-center">
              <h1 className="font-custom font-medium text-5xl lg:text-6xl">
                Cooking Made Fun and Easy: Unleash Your Inner Chef
              </h1>
              <p className="mb-4 pt-[37px] font-inter font-extralight text-brand-sub_gray text-lg">
                Nourish Box removes the hassle of meal prep by delivering
                pre-measured, pre-cut ingredients along with guided recipes. We
                ensure every meal is made with carefully sourced ingredients,
                delivering farm-to-table goodness in every box.
              </p>{" "}
              <Link href="/recipes">
                <button className="bg-brand-btn_orange my-12 mt-4 px-2 lg:px-[30px] py-3 lg:py-[20px] rounded-xl font-inter lg:font-semibold text-white text-xl capitalize">
                  Order Now
                </button>
              </Link>
            </div>
            <div className="relative flex justify-center items-center m-6 lg:m-0 lg:w-1/2">
              <Image
                src={hero}
                height={600}
                width={658}
                className=""
                alt="jollof"
              />

              <Image
                src={hover_img_one}
                height={210}
                width={221}
                alt="hovering_img"
                className="bottom-[2px] left-0 absolute"
              />

              <Image
                src={hover_img_two}
                height={210}
                width={221}
                alt="hovering_img"
                className="top-[12px] right-[10px] bottom-[12px] absolute"
              />
              <Image
                src={broccoli}
                alt="broccoli"
                className="right-0 bottom-0 absolute animate-spinSlow"
              />
              <Image
                src={tomato}
                alt="tomato"
                className="top-0 left-0 absolute animate-float"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-center">
          <div className="flex flex-col lg:flex-col lg:justify-between items-center py-5 lg:py-10 md:w-[85%]">
            <div className="">
              <h2 className="mb-[5px] font-custom font-medium text-3xl lg:text-5xl">
                Discover, Create, Share
              </h2>
              <p className="lg:pb-5 font-inter font-light text-brand-sub_gray text-lg lg:text-2xl">
                {loading
                  ? "Loading recipes..."
                  : "Check out our recipes for the week"}
              </p>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap justify-center gap-6 p-6 lg:p-10 pt-0">
          {recipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
        <div className="flex justify-center items-center">
          {" "}
          <button
            className="bg-brand-btn_orange px-[25px] py-[10px] rounded-xl font-inter text-white text-lg capitalize"
            onClick={() => router.push("/receipes")}
          >
            See All
          </button>
        </div>
        <AboutUs />
        <div className="flex justify-center my-24 font-inter">
          <h1 className="font-custom font-medium text-5xl text-center">
            From Our Community
          </h1>
        </div>
        <CommunityList />
        <div className="flex justify-center items-center bg-brand-logo_green lg:mx-16 my-7 p-8 lg:p-10 lg:rounded-3xl lg:w-[92%]">
          <Banner />
        </div>
        <Footer />
      </div>
    </div>
  );
}

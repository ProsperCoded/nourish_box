import Image, { StaticImageData } from "next/image";
import user_green from "../assets/icons8-user-24.png";
import clock_green from "../assets/icons8-clock-24.png";
import graph from "../assets/icons8-graph-24.png";
import { Recipe } from "@/app/utils/types/recipe.type";
import friedRiceImage from "../assets/praw fried rice.webp";
const RecipeCard: React.FC<{ recipe: Recipe }> = ({ recipe }) => {
  return (
    <div className="bg-white shadow-md p-2 rounded-lg w-full lg:w-72">
      <a href={recipe.link}>
        {" "}
        <div className="relative">
          <Image
            // src={recipe.image}
            // ! temp
            src={friedRiceImage}
            alt={recipe.name}
            width={400}
            height={400}
            className="rounded-md"
          />
          <div className="bottom-[70px] z-50 absolute flex items-center bg-white/20 backdrop-blur-lg p-2 pb-3 w-full text-brand-logo_green text-sm">
            {" "}
            <p className="flex items-center mx-1">
              <Image
                className="mx-1 w-[12px] h-[12px]"
                src={clock_green}
                alt="green user"
              />{" "}
              {recipe.time}{" "}
            </p>
            <p className="flex items-center mx-1">
              <Image
                className="mx-1 w-[12px] h-[12px]"
                src={user_green}
                alt="user "
              />
              {recipe.servings}
            </p>
            <p className="flex items-center mx-1">
              <Image
                src={graph}
                alt="graph"
                className="mx-1 w-[12px] h-[12px]"
              />{" "}
              {recipe.difficulty}
            </p>
          </div>
          <div className="my-8 mb-4 font-inter">
            <h3 className="mt-2 font-custom font-semibold text-lg">
              {recipe.name}
            </h3>

            <a
              href={recipe.link}
              className="inline-block mt-2 font-inter text-orange-500 text-sm hover:underline"
            >
              View Recipe
            </a>
          </div>
        </div>
      </a>
    </div>
  );
};

export default RecipeCard;

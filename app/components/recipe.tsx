import Image, { StaticImageData } from "next/image";
import user_green from "../assets/icons8-user-24.png";
import clock_green from '../assets/icons8-clock-24.png';
import graph from '../assets/icons8-graph-24.png';
interface Recipe {
  id: number;
  name: string;
  image: string | StaticImageData;
  time: string;
  servings: string;
  difficulty: string;
  link: string;
}

const RecipeCard: React.FC<{ recipe: Recipe }> = ({ recipe }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-2 w-72">

      <div className="relative ">
        <Image
          src={recipe.image}
          alt={recipe.name}
          width={300}
          height={100}
          className="rounded-md"
        />
        <div className="text-sm flex  items-center absolute z-50 bottom-[70px] bg-white/20 backdrop-blur-lg w-full p-2 pb-3 text-brand-logo_green"> <p className="flex  items-center mx-1"><Image className="w-[12px] h-[12px] mx-1" src={clock_green} alt="green user" /> {recipe.time} </p>
         <p className="flex  items-center mx-1"><Image className="w-[12px] h-[12px] mx-1" src={user_green} alt="user " />{recipe.servings}</p> 
         <p className="flex  items-center mx-1"><Image src={graph} alt="graph" className="w-[12px] h-[12px] mx-1 " /> {recipe.difficulty}</p>
         </div>
        <div className="font-sans my-8 mb-4">
          <h3 className="text-lg font-semibold mt-2">{recipe.name}</h3>

          <a href={recipe.link} className="text-orange-500 hover:underline text-sm mt-2 inline-block">
            View Recipe
          </a>
       </div>
      </div>
    </div>
  );
};

export default RecipeCard;

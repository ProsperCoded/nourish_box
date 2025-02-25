
import Nav from "../app/components/nav";
import Image from "next/image";
import hero from "../app/assets/hero.png";
import hover_img_one from '../app/assets/Frame 464.png'
import hover_img_two from '../app/assets/Frame 466.png'
import broccoli from "../app/assets/Broccoli.png";
import tomato from '../app/assets/Tomato.png'
import RecipeCard from "./components/recipe";
import salad from '../app/assets/salad.avif'
import soup from '../app/assets/soup.avif'
import spag from '../app/assets/spag.avif'
import pie from '../app/assets/pie.avif'
import pie_one from '../app/assets/pie-1.avif'
import pancake from '../app/assets/pancake.avif'
import AboutUs from '../app/components/about_us';
import CommunityList from "./components/community";
import Banner from "./components/banner";
import Footer from "./components/footer";
export default function Home() {
  const recipeCards = [
    {
      id: 1,
      name: "Creamy Salad",
      image: salad,
      time: "10 Mins",
      servings: "2 Serving",
      difficulty: "Easy",
      link: "/recipes/creamy-salad"
    },
    {
      id: 2,
      name: "Tofu Tomatoes Soup",
      image: soup,
      time: "15 Mins",
      servings: "3 Serving",
      difficulty: "Easy",
      link: "/recipes/tofu-tomatoes-soup"
    },
    {
      id: 3,
      name: "Spagetti Bolognese",
      image: spag,
      time: "10 Mins",
      servings: "2 Serving",
      difficulty: "Easy",
      link: "/recipes/crunchy-potatoes"
    },
    {
      id: 4,
      name: "Apple Pie",
      image: pie,
      time: "25 Mins",
      servings: "2 Serving",
      difficulty: "Medium",
      link: "/recipes/mushroom-soup"
    },
    {
      id: 5,
      name: "Raspberry Pie",
      image: pie_one,
      time: "30 Mins",
      servings: "1 Serving",
      difficulty: "Easy",
      link: "/recipes/raspberry-pancake"
    },
    {
      id: 6,
      name: "Beef Teriyaki",
      image: pancake,
      time: "20 Mins",
      servings: "1 Serving",
      difficulty: "Medium",
      link: "/recipes/beef-teriyaki"
    }
  ];
  
  return (
    <div>
      <div className="flex md:hidden h-screen w-screen  justify-center items-center">
        This page is not available for small screen sizes
      </div>
      <div className="hidden md:block">
        <Nav />
        <div className="flex justify-center ">
          <div className="flex justify-between items-center w-10/12 py-20 ">
            <div className="w-1/2"><h1 className="text-6xl font-sans font-bold leading-tight">Cooking Made Fun and Easy: Unleash Your Inner Chef</h1>
              <p className="pt-[37px] font-sans font-extralight text-lg text-brand-sub_gray mb-4">Discover more than <span className="text-brand-btn_orange">10,000 recipes</span> in your hand with the best recipe. Help you to find the easiest way to cook.</p>
              <button className=" capitalize bg-brand-btn_orange font-semibold text-xl rounded-[20px] text-white py-[20px] px-[30px] my-12 mt-4">Explore recipes</button></div>
            <div className="flex items-center justify-center w-1/2 relative">
              <Image src={hero} height={600} width={658} className="" alt="jollof" />

              <Image src={hover_img_one} height={210} width={221} alt="hovering_img" className="absolute left-0 bottom-[2px]" />

              <Image src={hover_img_two} height={210} width={221} alt="hovering_img" className="absolute top-[12px] right-[10px] bottom-[12px]" />
              <Image src={broccoli} alt="broccoli" className="absolute right-0 bottom-0 animate-spinSlow" />
              <Image src={tomato} alt="tomato" className="absolute left-0 top-0  animate-float " />
            </div>


          </div>
        </div>
        <div className="flex justify-center">
          <div className="flex justify-between py-10 md:w-[80%] ">
            <div className="">
              <h2 className="font-semibold text-5xl mb-[5px]">Discover, Create, Share</h2>
              <p className="font-extralight text-brand-sub_gray">Check out our recipes for the week</p>
            </div>
            <div className="flex items-center"> <button className=" capitalize bg-brand-btn_orange text-xl rounded-[20px] text-white py-[10px] px-[25px]">See All</button></div>
          </div>
        </div>
        <div className="flex flex-wrap gap-6 justify-center p-10 pt-0">

          {recipeCards.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
        <AboutUs />
        <div className="flex justify-center my-24 font-sans ">
          <h1 className="text-5xl text-semibold">From Our Community</h1>
        </div>
        <CommunityList />
        <div className='flex justify-center bg-brand-logo_green p-10 rounded-3xl w-[92%] mx-16 my-7  '>
          <Banner />

        </div>
        <Footer />
      </div>
  </div>
  );
}

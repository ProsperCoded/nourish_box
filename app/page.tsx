'use client'
import Nav from "./components/nav";
import Image from "next/image";
import hero from "./assets/hero.png";
import hover_img_one from './assets/Frame 464.png'
import hover_img_two from './assets/Frame 466.png'
import broccoli from "./assets/Broccoli.png";
import tomato from './assets/Tomato.png'
import RecipeCard from "./components/recipe";
import prawnfriedrice from './assets/praw fried rice.webp'
import turkeyfriedrice from './assets/realturkeyfriedrice.webp'
import plantainporridge from './assets/shrimpand plantain porridge.webp'
// import chickenteriyaki from './assets/chicken teriyaki.webp'
import { useRouter } from 'next/navigation'

import gizdodo from './assets/gizdodo.webp';
import AboutUs from './components/about_us';
import CommunityList from "./components/community";
import Banner from "./components/banner";

import Footer from "./components/footer";
export default function Home() {
  const recipeCards = [
    {
      id: 1,
      name: "Prawn fried rice",
      image: prawnfriedrice,
      time: "10 Mins",
      servings: "2 Serving",
      difficulty: "Easy",
      link: 'https://paystack.shop/nourish-box?product=prawn-fried-rice-meal-kit-qgplsu'
    },
    {
      id: 2,
      name: 'Turkey fried rice',
      image: turkeyfriedrice,
      time: "25 Mins",
      servings: "2 Serving",
      difficulty: "Medium",
      link: "https://paystack.shop/nourish-box?product=turkey-fried-rice-meal-kit-xtehel"
    },
    {
      id: 3,
      name: "Shrimp and plaintain pottage",
      image: plantainporridge,
      time: "10 Mins",
      servings: "2 Serving",
      difficulty: "Easy",
      link: "https://paystack.shop/nourish-box?product=shrimp-and-plantain-porridge-meal-kit-oirbiq"
    },
    {
      id: 4,
      name: 'Gizdodo',
      image: gizdodo,
      time: "25 Mins",
      servings: "2 Serving",
      difficulty: "Medium",
      link: "https://paystack.shop/nourish-box?product=gizdodo-xyoogt"
    },
    {
      id: 5,
      name: "Prawn fried rice",
      image: prawnfriedrice,
      time: "30 Mins",
      servings: "1 Serving",
      difficulty: "Easy",
      link: "https://paystack.shop/nourish-box?product=prawn-fried-rice-meal-kit-qgplsu"
    },
    {
      id: 6,
      name: 'Turkey fried rice',
      image: turkeyfriedrice,
      time: "25 Mins",
      servings: "2 Serving",
      difficulty: "Medium",
      link: "https://paystack.shop/nourish-box?product=turkey-fried-rice-meal-kit-xtehel"
    }
  ];
  const router = useRouter()

  return (
    <div>
      <div className=" hidden h-screen w-screen  justify-center items-center">
        This page is not available for small screen sizes
      </div>
      <div className=" block">
        <Nav />
        <div className="flex flex-col lg:flex-row justify-center ">
          <div className="flex flex-col lg:flex-row  justify-between items-center  lg:w-full py-10 lg:py-20 md:flex-col ">
            <div className="lg:w-1/2 flex flex-col  items-center p-4  text-center lg:items-start lg:p-10 lg:text-left"><h1 className="text-5xl lg:text-6xl font-custom font-medium ">Cooking Made Fun and Easy: Unleash Your Inner Chef</h1>
              <p className="pt-[37px] font-sans font-extralight text-lg text-brand-sub_gray mb-4">Nourish Box removes the hassle of meal prep by
                delivering pre-measured, pre-cut ingredients
                along with guided recipes. We ensure every meal is
                made with carefully sourced ingredients,
                delivering farm-to-table goodness in every box.</p>
              <a href="https://l.instagram.com/?u=https%3A%2F%2Fpaystack.shop%2Fnourish-box%3Ffbclid%3DPAZXh0bgNhZW0CMTEAAadtGBs7PXoH7bl0Q_Q3-h86Ubt9ydzkY01mrRw0kHF7CbGk5yLa7Hox1vS3BA_aem_CVe_2rzSDyuZDGIHNXMEhg&e=AT01o97t6DhSd0Ph0fiFIl4a3GZv79KNc2lQBhy6Z1qF7sJnMTtMWHxHH1t48IxKXLbW0hB0tyYnWxcAJ1qxkeTyuwrV7CocoD_iD6F0Ee3XNSUEUEpCX3o"> <button className=" capitalize bg-brand-btn_orange font-inter lg:font-semibold text-xl rounded-xl text-white py-3 px-2 lg:py-[20px] lg:px-[30px] my-12 mt-4">Order now</button></a>
            </div>
            <div className="flex items-center justify-center lg:w-1/2 relative">
              <Image src={hero} height={600} width={658} className="" alt="jollof" />

              <Image src={hover_img_one} height={210} width={221} alt="hovering_img" className="absolute left-0 bottom-[2px]" />

              <Image src={hover_img_two} height={210} width={221} alt="hovering_img" className="absolute top-[12px] right-[10px] bottom-[12px]" />
              <Image src={broccoli} alt="broccoli" className="absolute right-0 bottom-0 animate-spinSlow" />
              <Image src={tomato} alt="tomato" className="absolute left-0 top-0  animate-float " />
            </div>


          </div>
        </div>

        <div className="flex justify-center">
          <div className="flex flex-col lg:flex-col items-center lg:justify-between py-5 lg:py-10 md:w-[85%] ">
            <div className="">
              <h2 className="font-medium font-custom text-3xl lg:text-5xl mb-[5px]">Discover, Create, Share</h2>
              <p className="font-inter text-lg lg:pb-5 font-light text-brand-sub_gray lg:text-2xl">Check out our recipes for the week</p>
            </div>
           
          </div>
        </div>
        <div className="flex flex-wrap gap-6 justify-center p-10 pt-0">

          {recipeCards.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
        <div className="flex justify-center items-center"> <button  className=" capitalize bg-brand-btn_orange text-lg font-inter rounded-xl text-white py-[10px] px-[25px]" onClick={()=>router.push('/receipes')}>See All</button></div>
        <AboutUs />
        <div className="flex justify-center my-24 font-sans ">
          <h1 className=" text-5xl text-center font-custom font-medium">From Our Community</h1>
        </div>
        <CommunityList />
        <div className='flex justify-center items-center bg-brand-logo_green p-8 lg:p-10 lg
        :rounded-3xl lg:w-[92%] lg:mx-16 my-7  '>
          <Banner />

        </div>
        <Footer />
      </div>
    </div>
  );
}

import Image from "next/image";
import colorful_banner from '../assets/nourish_box_folder/DPs and Banners/Twitter header - 1.png'
import bread from "../assets/Bread.png";
export default function AboutUs() {
  return (
    <div className="relative w-full h-[400px] overflow-hidden my-16">
      {/* Background Image */}
      <Image
        src={colorful_banner}
        alt="Background"
        fill
        className="object-cover bg-repeat-x object-left" // Ensures it aligns horizontally
        quality={100}
      />
      {/* Content */}
      <div className="absolute inset-0 flex items-center justify-center md:px-20 md:py-10 ">
        <div className="flex flex-col justify-start  bg-white lg:p-5 p-4 m-2 h-5/6 lg:h-full relative lg:w-1/3 rounded-xl">
          <h1 className=" text-4xl font-custom font-medium py-4 ">About Us </h1>
          <p className="font-light text-base font-inter" >Nourish Box is a meal-kit delivery service dedicated
            to making fresh, high-quality ingredients accessible
            and convenient. It simplifies home cooking by
            providing pre-portioned, pre-cut ingredients and
            step-by-step recipes. </p>
          <Image src={bread} alt="bread emoji" className="absolute top-0 right-[22px] w-[80px]" />
          <a href="#"><button className="bg-brand-btn_orange font-inter  w-1/3 py-2 px-1 rounded-xl text-white  my-4" > Learn more</button></a>
        </div>
        
      </div>
     
    </div>
  );
}

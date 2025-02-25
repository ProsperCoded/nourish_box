import Image from "next/image";
import crepes from "../assets/crepes.png"; 
import bread from "../assets/Bread.png"; 
export default function AboutUs() {
  return (
    <div className="relative w-full  h-[400px] overflow-hidden my-16">
    {/* Background Image */}
    <Image 
      src={crepes} 
      alt="Background" 
   fill
      className="object-cover bg-repeat-x object-left" // Ensures it aligns horizontally
      quality={100} 
    />
    {/* Content */}
    <div className="absolute inset-0 flex items-center justify-center px-20 py-10 ">
      <div className="flex flex-col justify-start  bg-white p-5 relative w-1/3 rounded-xl">
      <h1 className=" text-4xl font-bold py-4 ">About Us </h1>
      <p className="font-light text-base font-sans" >Our recipes are the heart and soul of our culinary community, and they reflect our commitment to providing you with memorable and delightful dining experiences.</p>
      <Image src={bread} alt="bread emoji" className="absolute top-0 right-[22px] w-[80px]"/>
      <button className="bg-brand-btn_orange  w-1/3 py-2 px-1 rounded-xl text-white  my-4">Learn more</button>
      </div>

    </div>
  </div>
  );
}

import Nav from "../components/nav";
// import Link from 'next/link';
import target from "../assets/icons8-target-100.png";
import vision from '../assets/icons8-vision-100.png';
import FooterMain from "../components/footer";
import hero_img from "../assets/Nourish Box62470.jpg"
import Image from 'next/image';
import icon from "../assets/nourish_box_folder/Logo files/icon.svg";
import Search_bar from "../components/Search_bar";
const page = () => {
  return (
    <div className="flex justify-center items-center">
      <div className='max-w-[1550px] mt-12'>
        <div className="hidden md:block">
          <Nav />
        </div>
        <div className="block md:hidden">
          <Search_bar PageTitle="About us"/>
              </div>
        <div className='flex  flex-col-reverse md:flex-row items-center  md:my-20 md:pt-20 lg:pt-0'>
          <div className='w-2/4 mt-20 md:mt-0 flex justify-center '> <Image src={icon} alt='nourish box icon' width={300} height={300} /></div>
          <div className="flex w-3/4 flex-col  md:mr-10">
            <h1 className="hidden md:block text-5xl text-center lg:text-left  font-bold font-custom  md:mt-10">About Us</h1>
            <p className=" md:pt-[37px] font-inter font-extralight text-lg text-center lg:text-left text-brand-sub_gray mb-4">
              Welcome to Nourish Box, your go-to destination for delicious and nutritious meal kits! We are passionate about making healthy eating easy and enjoyable for everyone. Our meal kits are carefully curated with fresh ingredients and simple recipes, allowing you to create wholesome meals in no time.
            </p>
            <div className="block md:hidden">
              <Image src={hero_img} alt="hero img"/>
            </div>
            <p className="pt-[10px] font-inter font-extralight text-lg text-brand-sub_gray mb-4 text-center md:text-left">
              At Nourish Box, we believe that cooking should be a fun and rewarding experience. That<span>&rbrace;</span> why we&rbrace;ve designed our meal kits to be user-friendly, with step-by-step instructions that guide you through the cooking process. Whether you&rbrace;re a seasoned chef or a beginner in the kitchen, our meal kits are perfect for all skill levels.
            </p>


          </div>
        </div>

        <div className='flex flex-col md:flex-row justify-center md:justify-evenly w-full mb-10'>
          <div className=' text-center mx-10 md:mx-0 md:w-1/3 flex flex-col items-center justify-center '>
            <Image src={target} alt='target icon' width={50} height={50} />
            <h1 className="text-2xl text-[#004C30] font-bold font-custom  mt-5">Our Mission</h1>
            <p className='font-inter font-extralight text-lg text-brand-sub_gray mb-4 '>To make home cooking effort less by
              delivering quality ingredients and step-
              by-step guidance, ensuring that every
              meal is fresh, delicious, and stress-free.</p>
          </div>
          <div className='text-center mx-10 md:mx-0 md:w-1/3 flex flex-col items-center justify-center'>
            <Image src={vision} alt=' vison icon' width={50} height={50} />
            <h1 className="text-2xl font-bold font-custom text-[#004C30]  mt-5">Our Vision</h1>
            <p className='font-inter font-extralight text-lg text-brand-sub_gray mb-4'>To be the go-to meal kit brand for busy people
              worldwide, providing a seamless, enjoyable
              cooking experience through fresh ingredients,
              easy recipes, and unmatched convenience.</p>
          </div>
        </div>
        <div >

          <FooterMain />
        </div>
      </div>
    </div>
  )
}

export default page

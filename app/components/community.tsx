import Image, { StaticImageData } from "next/image";
import like from '../assets/icons8-thumbs-up-50.png';
import share from "../assets/icons8-share-48.png";
import prawnfriedrice from '../assets/praw fried rice.webp'
import turkeyfriedrice from '../assets/realturkeyfriedrice.webp'
import plantainporridge from '../assets/shrimpand plantain porridge.webp'
import chickenteriyaki from '../assets/chicken teriyaki.webp'
import user_one from '../assets/frame_451.png';
import user_two from '../assets/frame_452.png';
import user_three from '../assets/frame_453.png';
import user_four from '../assets/frame_454.png';
type Community = {
  id: number;
  name: string;
  image: string | StaticImageData;
  user_image: string | StaticImageData;
  likes: string;
  sub: string;
  text: string;
  ratings: string;
  share: string;
  link: string;
};

const communities: Community[] = [
  {
    id: 1,
    name: "Prawn fried rice",
    sub: 'Lady rudgy',
    user_image: user_one,
    image: prawnfriedrice,
    text: "I have to say, your Spaghetti Bolognese recipe is nothing short of amazing! I've always been a fan of Italian cuisine, but I was a bit intimidated by the idea of making this classic at home.",
    likes: "15 Mins",
    ratings: "3 ",
    share: "Easy",
    link: "/Community/tofu-tomatoes-soup",
  },
  {
    id: 2,
    name: "Turkey fried rice",
    sub: 'Lady rudgy',
    user_image: user_two,
    image: turkeyfriedrice,
    likes: "10 Mins",
    ratings: "2 ",
    text: "I've always been a bit hesitant to roast a whole chicken, fearing it might be too complicated, but your recipe changed that for me. The instructions were so clear and easy to follow",
    share: "Easy",
    link: "/Community/crunchy-potatoes",
  },
  {
    id: 3,
    name: "Shrimp plantain pottage",
    sub: 'Lady rudgy',
    image: plantainporridge,
    user_image: user_three,
    likes: "10 Mins",
    ratings: "2 ",
    text: "I've always been a bit hesitant to roast a whole chicken, fearing it might be too complicated, but your recipe changed that for me. The instructions were so clear and easy to follow",
    share: "Easy",
    link: "/Community/crunchy-potatoes",
  },
  {
    id: 4,
    name: "Chicken teriyaki",
    sub: 'Emily rose',
    image: chickenteriyaki,
    user_image: user_four,
    likes: "10 Mins",
    ratings: "2 ",
    text: "I've always been a bit hesitant to roast a whole chicken, fearing it might be too complicated, but your recipe changed that for me. The instructions were so clear and easy to follow",
    share: "Easy",
    link: "/Community/crunchy-potatoes",
  },
];

export default function CommunityList() {
  return (
    <div className="grid grid-rows-2 lg:grid-cols-2 gap-6 lg:gap-20 m-6 lg:m-10  lg:mx-16 font-sans">

      {communities.map((i) => (
        <div key={i.id} className="p-7 cursor-pointer bg-white rounded-lg shadow-lg ">

          <div className="flex items-center mb-3">
            <div>
              <Image src={i.user_image} alt="img" width={50} height={50} className="mx-4 ml-2" />
            </div>
            <div className="flex flex-col justify-center">
              <h1 className="font-custom text-2xl">{i.name}</h1>
              <h3 className="font-light text-base text-brand-sub_gray">{i.sub}</h3>
            </div>
          </div>
          {/* <Image src="" alt="img" className="stars" /> */}
          <p className="my-5 text-base font-light leading-6  ">{i.text}</p>
          <Image
            src={i.image}
            alt={i.name}
            className="object-cover h-64 w-full rounded"
          />
          <div className="flex items-center my-4">
            <Image src={like} alt="thumbs" width={20} height={20} className="mr-2" />
            <p className="mr-4">{i.ratings}</p>
            <Image className="mr-2" src={share} alt="yh" width={20} height={20} />
            share
          </div>

        </div>
      ))}
    </div>
  );
}

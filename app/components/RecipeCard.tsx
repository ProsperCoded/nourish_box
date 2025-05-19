"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";

// import clock_green from "../assets/icons8-clock-24.png";
import { Modal, Box, FormControl, InputLabel, Select, MenuItem, Stack } from '@mui/material';
import { SelectChangeEvent } from '@mui/material/Select';
import Link from "next/link";
import { useFavorites } from '../contexts/FavContext';
import { Recipe } from "../utils/types/recipe.type";
import { useAuth } from "../contexts/AuthContext";
import { Heart } from "lucide-react";
import useMobileVs from "../hooks/useMobileVs";
import { useRouter } from "next/navigation";
interface RecipeCardProps {
  recipe: Recipe;
}

const RecipeCard: React.FC<RecipeCardProps> = ({ recipe }) => {
  const { addFavorite, deleteFavorite, isFavorite } = useFavorites();
  const { user } = useAuth();
  const [isFavorited, setIsFavorited] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [option, setOption] = useState<string>('');
  const [count, setCount] = useState(1);
  const isMobile = useMobileVs();
  const router = useRouter()
  useEffect(() => {
    const checkFavoriteStatus = async () => {
      if (!user) return;
      try {
        const favorited = await isFavorite(recipe.id.toString());
        setIsFavorited(favorited);
      } catch (error) {
        console.error("Error checking favorite status:", error);
      }
    };

    checkFavoriteStatus();
  }, [user, recipe.id, isFavorite]);

  const [showPopUp, setShowPopUp] = useState(false);
  const handlePopUp = () => setShowPopUp(true);
  const handleClosePopUp = () => setShowPopUp(false);

  const handleFavoriteClick = async (e) => {
    if (!user) {
      // You might want to show a login prompt here
      return;
    }
    e.stopPropagation();

    try {
      setIsLoading(true);
      if (isFavorited) {
        await deleteFavorite(recipe.id.toString());
        setIsFavorited(false);
      } else {
        await addFavorite(recipe);
        setIsFavorited(true);
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
    } finally {
      setIsLoading(false);
    }
  };


  const handleChange = (event: SelectChangeEvent) => {
    setOption(event.target.value);
  };
  // const liked = isFavorite(recipe?.id);
  const handleOpen = (e: React.MouseEvent) => {
    e.stopPropagation();
    setOpen(true);
  };

  const handleClose = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation();
    setOpen(false);
  };

  const handleCardClick = (e: React.MouseEvent) => {
    if (isMobile) {
      router.push(`/recipe/${recipe.id}`);
      e.stopPropagation();
    
    }
    e.stopPropagation();
    handleOpen(e);
  };

  const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '80%',
    maxWidth: '1000px',
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
    maxHeight: '90vh',
    overflow: 'auto',
    outline: 'none',
  };

  const popUpStyle = {
    ...modalStyle,
    width: { xs: 370, lg: 500 },
  }
  return (
    <div className="relative bg-white rounded-lg shadow-md overflow-hidden w-[300px] cursor-pointer"
      onClick={handleCardClick}
    >
      <div className="relative h-48">
        {recipe.displayMedia.type === "video" ? (
          <video
            src={recipe.displayMedia.url}
            className="object-cover w-full h-full"
            controls={false}
            autoPlay
            muted
            loop
          />
        ) : (
          <Image
            src={recipe.displayMedia.url}
            alt={recipe.name}
            fill
            className="object-cover"
          />
        )}
      </div>
      <div className="p-4">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-semibold mb-2">{recipe.name}</h3>
          <button
            onClick={handleFavoriteClick}
            disabled={isLoading}
            className={`p-2 rounded-full transition-colors ${isFavorited ? "text-red-500" : "text-gray-400"
              } hover:text-red-500`}
          >
            <Heart
              className={`w-5 h-5 ${isFavorited ? "fill-current" : ""}`}
            />
          </button>
        </div>
        <div className="my-8 mb-4 font-inter">
          <div className="px-2">
            <h3 className="mt-2 font-custom font-semibold text-lg">
              {recipe.name}
            </h3>

            {/* <Modal open={open} onClose={handleClose}>
        <Box sx={modalStyle}>
          <div className="flex flex-col md:flex-row">
            <div className="md:w-1/2 md:mr-8 mb-4 md:mb-0">
              
          </div> */}
            <Modal
              open={open}
              onClose={handleClose}
              onClick={(e) => e.stopPropagation()}
              disableAutoFocus={true}
              disableEnforceFocus={true}
            >
              <Box sx={modalStyle}>
                <button
                  onClick={handleClose}
                  className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors"
                  aria-label="Close modal"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
                <div className="flex flex-col md:flex-row">
                  {recipe.displayMedia.type === "video" ? (
                    <video
                      src={recipe.displayMedia.url}
                      className="rounded-md w-full max-h-[400px]"
                      controls
                      autoPlay
                    />
                  ) : (
                    <Image
                      src={recipe.displayMedia.url}
                      alt={recipe.name}
                      className="rounded-md w-full"
                      width={500}
                      height={300}
                      style={{ objectFit: "contain", maxHeight: "400px" }}
                    />
                  )}

                  <div className="flex items-center justify-between ">
                    {/* <button onClick={handleOpen} className="inline-block mt-2 font-inter text-orange-500 text-sm hover:underline" >View Recipe</button> */}
                    {/* <button onClick={() => toogleLiked()}>  <Image src={liked ? filled_liked : liked_empty} alt="like button" width={20} height={20} /></button> */}

                  </div>
                </div>

                <div className="text-gray-600 font-inter">
                  {recipe.description && (
                    <p className="font-inter mt-2">{recipe.description}</p>
                  )}

                  {recipe.ingredients && recipe.ingredients.length > 0 && (
                    <>
                      <h4 className="text-gray-700 font-semibold font-xl my-4 font-inter">Ingredients</h4>
                      <ul>
                        {recipe.ingredients.map((ingredient, index) => (
                          <li key={index}>{ingredient}</li>
                        ))}
                      </ul>
                    </>
                  )}
                </div>
                <div>
                  <p className="font-semibold text-gray-700 mt-4 mb-2 font-inter">
                    How do you want it packaged? (if more than one portion ordered)
                  </p>
                  <FormControl fullWidth>
                    <InputLabel id="dropdown-label">Choose an option</InputLabel>
                    <Select
                      labelId="dropdown-label"
                      value={option}
                      label="Choose an option"
                      onChange={handleChange}
                      className="font-inter"
                    >
                      <MenuItem value="separate">Pack separately</MenuItem>
                      <MenuItem value="together">Pack as one</MenuItem>
                    </Select>
                    <div className="flex w-full justify-center">
                      <Stack direction="row" spacing={2} alignItems="center" marginY={2}>
                        <div className="rounded-xl border-[1px] border-gray-400 flex p-2 w-[80px] my-2 text-gray-500">
                          <button className="mr-4" onClick={() => setCount(count - 1)}>-</button>
                          <p className="font-inter">{count}</p>
                          <button className="ml-4" onClick={() => setCount(count + 1)}>+</button>
                        </div>
                      </Stack>
                    </div>
                  </FormControl>
                </div>
                <div className="md:flex justify-between">
                  <div>
                    <h4 className="font-custom text-gray-700">Price</h4>
                    <p className="text-2xl font-inter text-gray-800 font-semibold">
                      {recipe.price ? `NGN ${recipe.price.toLocaleString()}` : 'Price not available'}
                    </p>
                  </div>
                  <div className="my-2 mt-4 flex justify-center">
                    <button className="bg-orange-400 rounded-lg text-white px-5 py-2" onClick={handlePopUp}>
                      Add to bag
                    </button>
                  </div>
                </div>
        </Box>
      </Modal>
    </div>
      </div >
  <Modal
    open={showPopUp}
    onClose={handleClosePopUp}
    aria-labelledby="modal-modal-title"
    aria-describedby="modal-modal-description"
  >
    <Box sx={popUpStyle}>
      <h1 className="text-black font-semibold font-inter text-2xl text-center">Skip the hassle next time</h1>
      <p className="text-center font-inter my-5">
        <span className="font-semibold">Sign up</span> to save your favorite and skip the hassle of filling in your details on every order
      </p>
      <div className="flex justify-evenly my-4">
        <Link href="/" className="bg-gray-400 text-center text-white px-4 py-2 w-36 rounded-lg font-inter">
          Never mind
        </Link>
        <Link href="/sign_up" className="bg-orange-400 text-white w-36 px-4 py-2 rounded-lg text-center font-inter">
          Sign up
        </Link>
      </div>
    </Box>
  </Modal>
    </div >
    </div >
  );
};

export default RecipeCard;

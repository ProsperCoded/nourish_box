"use client";
import Image from "next/image";
import user_green from "../assets/icons8-user-24.png";
import clock_green from "../assets/icons8-clock-24.png";
import graph from "../assets/icons8-graph-24.png";
import { auth } from "../lib/firebase";
import { Recipe } from "@/app/utils/types/recipe.type";
import friedRiceImage from "../assets/praw fried rice.webp";
import {
  Modal,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
} from "@mui/material";
import { SelectChangeEvent } from "@mui/material/Select";
import { useState } from "react";
import { useRouter } from "next/navigation";

const RecipeCard: React.FC<{ recipe: Recipe }> = ({ recipe }) => {
  const [option, setOption] = useState<string>("");
  const [open, setOpen] = useState(false);
  const [count, setCount] = useState(0);
  const router = useRouter();

  const handleChange = (event: SelectChangeEvent) => {
    setOption(event.target.value);
  };

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const handleAddToCart = () => {
    const user = auth.currentUser;
    if (!user) {
      router.push("/login");
      return;
    }
    console.log("hi");
  };
  const modalStyle = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: { xs: 370, lg: 1200 },
    overflow: "auto",
    maxHeight: "80vh",
    bgcolor: "background.paper",
    borderRadius: 2,
    boxShadow: 24,
    p: 4,
  };
  return (
    <div className="bg-white shadow-md p-2 rounded-lg w-full lg:w-72">
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
            {recipe.duration}{" "}
          </p>
          <p className="flex items-center mx-1">
            <Image
              className="mx-1 w-[12px] h-[12px]"
              src={user_green}
              alt="user "
            />
            {/* {recipe.servings} */}
          </p>
          {/* <p className="flex items-center mx-1">
            <Image src={graph} alt="graph" className="mx-1 w-[12px] h-[12px]" />{" "}
            {recipe.difficulty}
          </p> */}
        </div>
        <div className="my-8 mb-4 font-inter">
          <h3 className="mt-2 font-custom font-semibold text-lg">
            {recipe.name}
          </h3>

          <button
            onClick={handleOpen}
            className="inline-block mt-2 font-inter text-orange-500 text-sm hover:underline"
          >
            View Recipe
          </button>
          <Modal open={open} onClose={handleClose}>
            <Box sx={modalStyle}>
              <div className="flex flex-col md:flex-row ">
                <div className="md:w-1/2 md:mr-8 ">
                  <Image
                    src={friedRiceImage}
                    alt="recipe image"
                    className="rounded-md w-full"
                  />
                </div>
                <div>
                  <h2 className="font-custom font-medium text-2xl my-4">
                    Shrimp fried rice
                  </h2>
                  <sub className="text-gray-400 my-2">By Nourish Box</sub>
                  <div className="text-gray-600 font-inter">
                    <p className="font-inter mt-2">
                      {" "}
                      This meal kit has everything you need to make{" "}
                      {recipe.name} and grilled chicken. Specifically
                    </p>

                    <h4 className="text-gray-700 font-semibold font-xl my-4 font-inter">
                      For the Chicken
                    </h4>

                    <li>Chicken</li>
                    <li>Black pepper</li>
                    <li>Salt</li>
                    <li>Seasoning cubes</li>
                    <li>Tatshe</li>
                    <li>Rodo</li>
                    <li>Paprika</li>
                    <li>Garlic </li>
                    <li>Ginger</li>
                    <li>Onions</li>

                    <h4 className="text-gray-700 font-semibold font-xl my-4">
                      For the Rice
                    </h4>
                    <li>Rice</li>
                    <li>Tatshe</li>
                    <li>Rodo</li>
                    <li>Tomatoes</li>
                    <li>Onions</li>
                    <li>Curry</li>
                    <li>Salt</li>
                    <li>Thyme</li>
                    <li>Seasoning cubes</li>
                  </div>
                  <div>
                    <p className=" font-semibold text-gray-700 mt-4 mb-2 font-inter">
                      How do you want it packaged? (if more than one portion
                      ordered)
                    </p>
                    <FormControl fullWidth>
                      <InputLabel id="dropdown-label">
                        Choose an option
                      </InputLabel>
                      <Select
                        labelId="dropdown-label"
                        value={option}
                        label="Choose an option"
                        onChange={handleChange}
                        className="font-inter"
                      >
                        <MenuItem value="apple">Pack seperately</MenuItem>
                        <MenuItem value="banana">Pack as one</MenuItem>
                      </Select>
                      <div className="flex w-full justify-center">
                        <Stack
                          direction="row"
                          spacing={2}
                          alignItems="center"
                          marginY={2}
                        >
                          <div className="rounded-xl border-[1px] border-gray-400 flex p-2 w-[80px] my-2 text-gray-500">
                            <button
                              className="mr-4"
                              onClick={() => setCount(count - 1)}
                            >
                              -
                            </button>
                            <p className="font-inter">{count}</p>
                            <button
                              className="ml-4"
                              onClick={() => setCount(count + 1)}
                            >
                              +
                            </button>
                          </div>
                        </Stack>
                      </div>
                    </FormControl>
                  </div>
                  <div className="md:flex justify-between">
                    <div>
                      <h4 className="font-custom text-gray-700">Price</h4>
                      <p className="text-2xl font-inter text-gray-800 font-semibold">
                        NGN 10,000
                      </p>
                    </div>
                    <div className="my-2 mt-4 flex justify-center">
                      <button
                        className="bg-orange-400 rounded-lg text-white px-5 py-2"
                        onClick={handleAddToCart}
                      >
                        Add to bag
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </Box>
          </Modal>
        </div>
      </div>
    </div>
  );
};

export default RecipeCard;

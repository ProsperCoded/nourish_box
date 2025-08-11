import React from "react";
import { Box } from "@mui/material";
import Link from "next/link";
import cancel_icon from "../assets/icons8-cancel-48.png";
import Image from "next/image";
const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "80%",
  maxWidth: "1000px",
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
  maxHeight: "90vh",
  overflow: "auto",
  outline: "none",
};

const popUpStyle = {
  ...modalStyle,
  width: { xs: 370, lg: 500 },
};

export interface inputProps {
  main_text: string;
  onNeverMind?: () => void;
  onClose?: () => void;
}

const login_prompt = (props: inputProps) => {
  return (
    <div>
      <Box sx={popUpStyle}>
        <div>
          <button
            onClick={() => {
              if (props.onClose) {
                props.onClose();
              }
            }}
          >
            <Image src={cancel_icon} alt="cancel icon" />
          </button>
        </div>
        <h1 className="text-black font-semibold font-inter text-2xl text-center">
          Oh! you need to sign in.
        </h1>
        <p className="text-center font-inter my-5">
          <span className="font-semibold">Sign up</span> {props.main_text}
        </p>
        <div className="flex justify-evenly my-4">
          <button
            onClick={() => {
              if (props.onNeverMind) {
                props.onNeverMind();
              }
            }}
            className="bg-gray-400 text-center text-white px-4 py-2 w-36 rounded-lg font-inter"
          >
            Never mind
          </button>
          <Link
            href="/sign_up"
            className="bg-orange-400 text-white w-36 px-4 py-2 rounded-lg text-center font-inter"
          >
            Sign up
          </Link>
        </div>
      </Box>
    </div>
  );
};

export default login_prompt;

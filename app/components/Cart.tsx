"use client";
import React, { useState } from "react";
import Image from "next/image";
import { Drawer, IconButton, List, Badge } from "@mui/material";
import Cart from "../assets/icons8-cart-50.png";
import cancel_icon from "../assets/icons8-cancel-48.png";
import Logo from "../assets/nourish_box_folder/Logo files/Logomark.svg";
import Cart_tab from "./cart_tab";
import { useCart } from "../contexts/CartContext";

interface CartProps {
  className?: string;
}

const CartComponent: React.FC<CartProps> = ({ className = "" }) => {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { getItemsCount } = useCart();

  const cartItemsCount = getItemsCount();

  const toggleCartDrawer = () => {
    setIsCartOpen(!isCartOpen);
  };

  const closeCartDrawer = () => {
    setIsCartOpen(false);
  };

  return (
    <div className={className}>
      <IconButton
        onClick={toggleCartDrawer}
        edge="start"
        color="inherit"
        aria-label="cart"
      >
        <Badge badgeContent={cartItemsCount} color="error">
          <Image src={Cart} alt="cart" width={30} height={30.11} />
        </Badge>
      </IconButton>

      <Drawer anchor="right" open={isCartOpen} onClose={closeCartDrawer}>
        <List sx={{ width: 500 }}>
          <div className="flex justify-between items-center">
            <Image
              src={Logo}
              alt="Logo"
              className="m-4"
              width={50}
              height={50}
            />
            <Image
              src={cancel_icon}
              alt="close cart"
              className="m-4 cursor-pointer hover:opacity-70 transition-opacity"
              width={30}
              height={30}
              onClick={closeCartDrawer}
            />
          </div>
          <Cart_tab />
        </List>
      </Drawer>
    </div>
  );
};

export default CartComponent;

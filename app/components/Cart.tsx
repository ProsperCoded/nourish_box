"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Badge,
  IconButton,
  SwipeableDrawer,
  useMediaQuery,
  useTheme,
  Box,
} from "@mui/material";
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

  const cartItemsCount = getItemsCount?.() ?? 0;

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // iOS needs these flags for smoother swipe behavior
  const iOS =
    typeof navigator !== "undefined" &&
    /iPad|iPhone|iPod/.test(navigator.userAgent);

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  return (
    <div className={className}>
      {/* Trigger */}
      <IconButton
        onClick={openCart}
        edge="start"
        color="inherit"
        aria-label="Open cart"
        size="large"
      >
        <Badge badgeContent={cartItemsCount} color="error" max={99}>
          <Image src={Cart} alt="cart" width={28} height={28} />
        </Badge>
      </IconButton>

      {/* Drawer: bottom sheet on mobile, right panel on larger screens */}
      <SwipeableDrawer
        anchor={isMobile ? "bottom" : "right"}
        open={isCartOpen}
        onClose={closeCart}
        onOpen={openCart}
        disableBackdropTransition={!iOS}
        disableDiscovery={iOS}
        keepMounted
        PaperProps={{
          sx: {
            width: isMobile ? "100vw" : 480,
            height: isMobile ? "92vh" : "100vh",
            borderTopLeftRadius: isMobile ? 16 : 0,
            borderTopRightRadius: isMobile ? 16 : 0,
            // Safe area and backdrop blur on mobile
            pb: isMobile ? "env(safe-area-inset-bottom)" : 0,
            backdropFilter: isMobile ? "saturate(180%) blur(8px)" : "none",
          },
        }}
      >
        {/* Header (sticky) */}
        <Box
          sx={{
            position: "sticky",
            top: 0,
            zIndex: 1,
            bgcolor: "background.paper",
            borderBottom: "1px solid",
            borderColor: "divider",
            px: 2,
            py: 1.5,
          }}
          className="flex items-center justify-between"
        >
          {/* Mobile grab handle */}
          {isMobile && (
            <div className="absolute left-1/2 -translate-x-1/2 -top-2.5 w-12 h-1.5 rounded-full bg-gray-300" />
          )}

          <div className="flex items-center gap-2">
            <Image src={Logo} alt="Logo" width={100} height={100} />

          </div>
          <span className="font-semibold text-center hidden sm:inline">Your Cart</span>
          <IconButton
            aria-label="Close cart"
            onClick={closeCart}
            size="large"
            className="hover:opacity-80"
          >
            <Image src={cancel_icon} alt="close cart" width={24} height={24} />
          </IconButton>
        </Box>

        {/* Body (scrollable) */}
        <Box
          sx={{
            flex: 1,
            overflowY: "auto",
            // Keep inner content padded and centered
            px: { xs: 1.5, sm: 2 },
            py: { xs: 1.5, sm: 2 },
          }}
        >
          <Cart_tab />
        </Box>
      </SwipeableDrawer>
    </div>
  );
};

export default CartComponent;

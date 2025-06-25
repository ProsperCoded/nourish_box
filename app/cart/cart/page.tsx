"use client";
import React, { useState } from "react";
import dustbin from "../assets/icons8-trash-can-26.png";
import pottage from "../assets/chicken.png";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "../contexts/CartContext";
import { CartItem } from "../utils/types/cart.tyes";
import { CircularProgress } from "@mui/material";
import { PaystackButton } from "react-paystack";

const Cart_tab = () => {
  const {
    cart,
    updateQuantity,
    removeFromCart,
    clearCart,
    getTotalPrice,
    loading,
    isItemLoading,
  } = useCart();

  const [paymentLoading, setPaymentLoading] = useState(false);
  const [currentUrl, setCurrentUrl] = useState('');
  const handleQuantityChange = async (itemId: string, newQuantity: number) => {
    try {
      await updateQuantity(itemId, newQuantity);
    } catch (error) {
      console.error("Error updating quantity:", error);
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    try {
      await removeFromCart(itemId);
    } catch (error) {
      console.error("Error removing item:", error);
    }
  };

  const handleClearCart = async () => {
    try {
      await clearCart();
    } catch (error) {
      console.error("Error clearing cart:", error);
    }
  };

  if (loading) {
    return (
      <div className="h-full flex flex-col justify-center items-center">
        <CircularProgress size={24} />
        <p className="text-gray-600 mt-2">Loading cart...</p>
      </div>
    );
  }

  const cartItems = cart?.items || [];
  const totalPrice = getTotalPrice();

  // Paystack configuration
  const config = {
    reference: new Date().getTime().toString(),
    email: "test@test.com",
    amount: totalPrice * 100, // Amount in kobo (smallest currency unit)
    key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY!,
    publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY!,
  };

  // Payment success callback
  const handlePaystackSuccessAction = async (reference: any) => {
    console.log("Payment successful:", reference);
    setPaymentLoading(true);
    try {
      // Verify payment on backend
      const verifyRes = await fetch(
        `/api/paystack/verify?reference=${reference.reference}`
      );
      const verifyData = await verifyRes.json();

      if (verifyData.success) {
        alert(
          `Payment successful! Amount: NGN ${
            verifyData.data?.amount?.toLocaleString() ||
            totalPrice.toLocaleString()
          }`
        );
        await handleClearCart();
      } else {
        alert(
          `Payment verification failed: ${verifyData.error || "Unknown error"}`
        );
      }
    } catch (error) {
      console.error("Payment verification error:", error);
      alert("Payment verification failed. Please contact support.");
    } finally {
      setPaymentLoading(false);
    }
  };
  useEffect(() => {
    if (typeof window !== "undefined") {
      setCurrentUrl(window.location.href);
    }
  }, []);
  // Payment close callback
  const handlePaystackCloseAction = () => {
    console.log("Payment dialog closed");
    alert("Payment cancelled");
    setPaymentLoading(false);
  };

  // PaystackButton component props
  const paystackProps = {
    ...config,
    text: "Checkout",
    onSuccess: (reference: any) => handlePaystackSuccessAction(reference),
    onClose: handlePaystackCloseAction,
  };

  return (
    <div className="h-full flex flex-col justify-between">
     
      <div className=" flex flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-7xl my-4 space-y-4">
          <div className="flex justify-between">
            <h3 className='text-4xl font-custom'>Cart</h3>
            <ul className='text-gray-500 flex justify-between w-1/4 font-medium font-inter'>
              <Link href="/cart" className='text-orange-500 font-semibold'>Cart</Link>
              <Link href="/recipes">Recipes</Link>
              <Link href="/cart/checkout">Checkout</Link>
              <li>Payment</li>
            </ul>
          </div>
          <div className="flex flex-col items-start justify-center">
           
          </div>

          <div className="flex flex-col md:flex-row-reverse gap-6 font-inter">
            {/* Delivery Info */}
            <div className="flex-1 border border-grey-600 p-4 ">
              <h2 className="font-bold my-4">Delivery Information</h2>
              <label className='my-4'>Your name</label>
              <input type="text" placeholder="Recipent's name" className="w-full p-2 border my-2 border-grey-600 rounded-lg" required />
              <label className='my-4'>Your phone number</label>
              <input type="text" placeholder="A reachable phone number" className="w-full p-2 my-2 border border-grey-600 rounded-lg" required />
              <label className='my-4'>Delivery address</label>
              <input type="text" placeholder="Delivery address" className="w-full mt-2 mb-4 p-2 border border-grey-600 rounded-lg" required />

              <p className='my-4 text-orange-500 font-medium
                         text-sm'>To skip the hassle of filling in your delivery details on every checkout</p>
              <div className="flex justify-center text-center ">
                <Link href="/sign_up" className="rounded-lg w-1/3 border border-grey-600 bg-[#004C30] text-white px-4 py-2 " >
                  Sign up
                </Link>
              </div>
            </div>

            {/* Order Details */}
            <div className="flex-1 border border-grey-600 p-4 space-y-4">
              <h2 className="font-bold">Order Details</h2>
              {
                cartItems.length === 0 ? (
                  <div className="flex flex-col justify-end items-center ">
                    <h2 className="my-6 text-xl font-inter font-semibold">
                      Cart is empty
                    </h2>
                    <Link
                      href="/recipes"
                      className="bg-orange-500 py-2 px-4 text-white rounded-lg font-inter"
                    >
                      Add recipes to cart
                    </Link>
                  </div>
                ) : cartItems.map((item: CartItem) => {
                const itemLoading = isItemLoading(item.id);
                return (
                  <div key={item.id} className="flex items-center justify-between border border-grey-600 p-2">
                    <div className="w-20 h-20 bg-[#004C30]"/>
                    <div className="flex flex-col">
                    <span>{item.name}</span>
                  
                      <span className="font-semibold my-2">NGN {item.price}</span>
                      <span className="font-light text-sm"> Pack sepearately</span>
                      </div>
                    <div className="flex items-center">
                      <div className="rounded border-[1px] border-gray-400 flex p-1 w-[100px] my-2 text-gray-500 justify-center mr-2 relative">
                        {itemLoading && (
                          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-70 rounded-xl">
                            <CircularProgress size={14} />
                          </div>
                        )}
                        <button
                          className="mr-4"
                          onClick={() =>
                            handleQuantityChange(
                              item.id,
                              Math.max(1, item.quantity - 1)
                            )
                          }
                          disabled={item.quantity <= 1 || itemLoading}
                        >
                          -
                        </button>
                        <p className="font-inter text-center">{item.quantity}</p>
                        <button
                          className="ml-4"
                          onClick={() =>
                            handleQuantityChange(item.id, item.quantity + 1)
                          }
                          disabled={itemLoading}
                        >
                          +
                        </button>
                      </div>
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="hover:opacity-70 transition-opacity relative"
                        disabled={itemLoading}
                      >
                        {itemLoading ? (
                          <CircularProgress size={15} />
                        ) : (
                          <Image
                            src={dustbin}
                            alt="trash can"
                            width={15}
                            height={15}
                          />
                        )}
                      </button>
                    </div>
                  </div>
                )
              })}
              <div className="flex justify-between font-bold mt-4">
                <span>Total:</span>
                <span> NGN {totalPrice.toLocaleString()}</span>
              </div>
              {/* Action Buttons */}
              <div className="flex relative justify-between w-full  ">
                <div className="flex items-end h-full w-full absolute -bottom-48 justify-between px-5 py-4">
                  <button
                    className="w-[200px] px-5 py-2 rounded-md bg-gray-400 text-white hover:bg-gray-500 transition-colors flex items-center justify-center"
                    onClick={handleClearCart}
                    disabled={cartItems.some((item) => isItemLoading(item.id))}
                  >
                    {cartItems.some((item) => isItemLoading(item.id)) ? (
                      <CircularProgress size={20} color="inherit" />
                    ) : (
                      "Clear cart"
                    )}
                  </button>
                  <div className="w-[200px]">
                    <PaystackButton
                      {...paystackProps}
                      className="w-full px-5 py-2 rounded-md bg-orange-400 text-white hover:bg-orange-500 transition-colors flex items-center justify-center"
                      disabled={
                        cartItems.some((item) => isItemLoading(item.id)) ||
                        paymentLoading
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className='flex justify-center items-center'>
            
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart_tab;

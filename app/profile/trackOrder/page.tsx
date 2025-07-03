"use client";
import { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";

type TimelineEvent = {
  date: string;
  title: string;
  description: string;
  isActive: boolean;
  isCompleted: boolean;
};

type Order = {
  id: string;
  productName: string;
  purchaseDate: string;
  deliveryDate: string;
  price: number;
  quantity: number;
  status: "processing" | "shipped" | "delivered" | "completed" | "cancelled";
  timeline: TimelineEvent[];
  shippingMethod: string;
  shippingCost: string;
  address: {
    name: string;
    street: string;
    city: string;
    state: string;
    country: string;
  };
  restaurantNotes?: string;
  riderPhone?: string;
};

const OrderStatusPage = () => {
  const [activeTab, setActiveTab] = useState<"current" | "past">("current");
  const [deliveryNotes, setDeliveryNotes] = useState("");
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [showCartNotification, setShowCartNotification] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Sample order data
  const currentOrder: Order = {
    id: "115574487",
    productName: "Turkey fried rice",
    purchaseDate: "Mar 23, 2025",
    deliveryDate: "March 25 - March 29",
    price: 49.99,
    quantity: 1,
    status: "shipped",
    shippingMethod: "Standard Shipping",
    shippingCost: "Free",
    riderPhone: "+234 812 345 6789",
    restaurantNotes: "Please call before arrival",
    address: {
      name: "Sarah Ayodele",
      street: "33, kolawole cresent",
      city: "Illupeju Estate",
      state: "Lagos",
      country: "Nigeria",
    },
    timeline: [
      {
        date: "Mar 23",
        title: "Ordered Today",
        description: "Your order is received",
        isActive: false,
        isCompleted: true,
      },
      {
        date: "Mar 23",
        title: "Your order has been confirmed",
        description: "Your order is being prepared",
        isActive: false,
        isCompleted: true,
      },
      {
        date: "Mar 24 - Mar 25",
        title: "Your order is being delivered",
        description: "Fresh ingredients are on their way!",
        isActive: true,
        isCompleted: false,
      },
      {
        date: "Mar 26",
        title: "Your order is completed",
        description: "Enjoy your cooking experience!",
        isActive: false,
        isCompleted: false,
      },
    ],
  };

  const pastOrder: Order = {
    id: "115574488",
    productName: "shrimp fried rice",
    purchaseDate: "Jan 12, 2025",
    deliveryDate: "January 15 - January 17",
    price: 34.99,
    quantity: 1,
    status: "cancelled",
    shippingMethod: "Standard Shipping",
    shippingCost: "Free",
    address: {
      name: "Bayo Adewale",
      street: "4b, Akin Cole Street",
      city: "Ikeja",
      state: "Lagos",
      country: "Nigeria",
    },
    timeline: [
      {
        date: "Jan 12",
        title: "Ordered Today",
        description: "Your order is received",
        isActive: false,
        isCompleted: true,
      },
      {
        date: "Jan 13",
        title: "Your order has been confirmed",
        description: "Your order is being prepared",
        isActive: false,
        isCompleted: true,
      },
      {
        date: "Jan 14",
        title: "You cancelled your order",
        description: "You have successfully cancelled your order",
        isActive: false,
        isCompleted: true,
      },
    ],
  };

  const order = activeTab === "current" ? currentOrder : pastOrder;

  const handleReorder = () => {
    const newItem = {
      id: order.id,
      name: order.productName,
      price: order.price,
      quantity: order.quantity,
    };

    setCartItems([...cartItems, newItem]);
    setShowCartNotification(true);

    setTimeout(() => {
      setShowCartNotification(false);
    }, 3000);
  };

  const handleCallRider = () => {
    if (order.riderPhone) {
      window.location.href = `tel:${order.riderPhone.replace(/[^\d+]/g, "")}`;
    }
  };

  const handleSaveDeliveryNotes = () => {
    if (deliveryNotes.trim().length > 200) {
      alert("Notes should be less than 200 characters");
      return;
    }

    console.log("Delivery notes saved:", deliveryNotes);
    setShowNotesModal(false);
    currentOrder.restaurantNotes = deliveryNotes;
  };


  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Order Status | NourishBox</title>
        <meta name="description" content="Track your NourishBox order status" />
      </Head>

      {/* Cart Notification */}
      {showCartNotification && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-md shadow-lg z-50 flex items-center animate-fade-in">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          Item added to cart!
        </div>
      )}

      {/* Delivery Notes Modal */}
      {showNotesModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div
            className={`bg-white rounded-lg shadow-xl w-full ${
              isMobile ? "max-w-full mx-4" : "max-w-md"
            } p-6`}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Delivery Instructions
              </h3>
              <button
                onClick={() => setShowNotesModal(false)}
                className="text-gray-500 hover:text-gray-700"
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
            </div>

            <div className="mb-4">
              <label
                htmlFor="delivery-notes"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Special instructions for restaurant or rider:
              </label>
              <textarea
                id="delivery-notes"
                className="w-full h-32 p-3 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500 text-sm"
                placeholder="e.g. 'Call when arriving', 'Leave at security desk'"
                value={deliveryNotes}
                onChange={(e) => setDeliveryNotes(e.target.value)}
                maxLength={200}
              />
              <div className="text-xs text-gray-500 mt-1 text-right">
                {deliveryNotes.length}/200 characters
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
              <button
                onClick={() => setShowNotesModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveDeliveryNotes}
                className={`px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white ${
                  deliveryNotes.trim()
                    ? "bg-orange-600 hover:bg-orange-700"
                    : "bg-gray-400 cursor-not-allowed"
                }`}
                disabled={!deliveryNotes.trim()}
              >
                Save Instructions
              </button>
            </div>
          </div>
        </div>
      )}

      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-orange-600">Order Status</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Order details */}
          <div className="md:w-2/3">
            <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-800">
                  {order.productName}
                </h2>
                <div className="mt-2 flex flex-col sm:flex-row sm:items-center sm:justify-between text-sm text-gray-600">
                  <span>Purchased {order.purchaseDate}</span>
                  <span className="mt-1 sm:mt-0">
                    Arriving {order.deliveryDate}
                  </span>
                </div>
              </div>

              {/* Tabs */}
              <div className="border-b border-gray-200">
                <nav className="flex -mb-px">
                  <button
                    onClick={() => setActiveTab("current")}
                    className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                      activeTab === "current"
                        ? "border-orange-500 text-orange-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    Current Order
                  </button>
                  <button
                    onClick={() => setActiveTab("past")}
                    className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                      activeTab === "past"
                        ? "border-orange-500 text-orange-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    Order History
                  </button>
                </nav>
              </div>

              {/* Timeline */}
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Timeline
                </h3>
                <div className="space-y-6">
                  {order.timeline.map((event, index) => (
                    <div key={index} className="flex">
                      <div className="flex flex-col items-center mr-4">
                        <div
                          className={`flex items-center justify-center w-8 h-8 rounded-full ${
                            event.isCompleted
                              ? "bg-green-500 text-white"
                              : event.isActive
                              ? "bg-orange-500 text-white"
                              : "bg-gray-200 text-gray-600"
                          }`}
                        >
                          {event.isCompleted ? (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          ) : (
                            <span className="text-xs font-medium">
                              {event.date}
                            </span>
                          )}
                        </div>
                        {index < order.timeline.length - 1 && (
                          <div
                            className={`w-0.5 h-10 ${
                              event.isCompleted ? "bg-green-500" : "bg-gray-200"
                            }`}
                          ></div>
                        )}
                      </div>
                      <div className="pb-6">
                        <h4
                          className={`text-sm font-medium ${
                            event.isActive
                              ? "text-orange-600"
                              : event.isCompleted
                              ? "text-green-600"
                              : "text-gray-600"
                          }`}
                        >
                          {event.title}
                        </h4>
                        <p className="text-sm text-gray-500 mt-1">
                          {event.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Delivery Notes Section */}
                {activeTab === "current" && (
                  <div className="mt-6 bg-orange-50 border-l-4 border-orange-400 p-4 rounded-r">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <svg
                          className="h-5 w-5 text-orange-400"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <div className="ml-3 flex-1">
                        <h3 className="text-sm font-medium text-orange-800">
                          Delivery Instructions
                        </h3>
                        <div className="mt-2 text-sm text-orange-700">
                          {order.restaurantNotes ? (
                            <p>{order.restaurantNotes}</p>
                          ) : (
                            <p>No special instructions added yet</p>
                          )}
                        </div>
                        <div className="mt-4">
                          <button
                            onClick={() => {
                              setDeliveryNotes(order.restaurantNotes || "");
                              setShowNotesModal(true);
                            }}
                            className="inline-flex items-center text-sm font-medium text-orange-700 hover:text-orange-600"
                          >
                            <svg
                              className="-ml-1 mr-1 h-4 w-4 text-orange-500"
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                            </svg>
                            {order.restaurantNotes
                              ? "Edit instructions"
                              : "Add instructions"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Shipping Info */}
              <div className="p-6 border-t border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Shipping Info
                </h3>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-medium text-green-800">
                    {order.shippingMethod}
                  </h4>
                  <p className="text-sm text-green-700 mt-1">
                    Estimated Delivery: {order.deliveryDate}
                  </p>
                  <p className="text-sm text-green-700 mt-1">
                    Cost: {order.shippingCost}
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {activeTab === "current"
                    ? "Order Actions"
                    : "Reorder Options"}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {activeTab === "current" ? (
                    <>
                      {order.riderPhone && (
                        <button
                          onClick={handleCallRider}
                          className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 mr-2 text-orange-500"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                          </svg>
                          Call Delivery Rider
                        </button>
                      )}
                      <Link
                        href="/contact_us"
                        className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 mr-2 text-orange-500"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Contact Support
                      </Link>
                      <button className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 mr-2 text-orange-500"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Track Package
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={handleReorder}
                        className="flex items-center justify-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-orange-600 hover:bg-orange-700"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 mr-2"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Reorder Again
                      </button>
                      <Link
                        href="/contact_us"
                        className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 mr-2 text-orange-500"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Contact Support
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Order summary */}
          <div className="md:w-1/3">
            <div className="bg-white rounded-lg shadow-md overflow-hidden sticky top-8">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">
                  Order Summary
                </h3>
              </div>
              <div className="p-6">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Order Number</span>
                  <span className="font-medium">#{order.id}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Quantity</span>
                  <span className="font-medium">{order.quantity}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">₦{order.price.toFixed(2)}</span>
                </div>
                <div className="flex justify-between mb-4">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">{order.shippingCost}</span>
                </div>
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between">
                    <span className="font-medium">Total</span>
                    <span className="font-medium text-orange-600">
                      ₦{order.price.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Address */}
                <div className="mt-8">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">
                    Shipping Address
                  </h4>
                  <p className="text-sm text-gray-600">{order.address.name}</p>
                  <p className="text-sm text-gray-600">
                    {order.address.street}
                  </p>
                  <p className="text-sm text-gray-600">
                    {order.address.city}, {order.address.state}
                  </p>
                  <p className="text-sm text-gray-600">
                    {order.address.country}
                  </p>
                </div>

                {/* Special instructions */}
                {activeTab === "current" && order.restaurantNotes && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">
                      Special Instructions
                    </h4>
                    <p className="text-sm text-gray-600">
                      {order.restaurantNotes}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default OrderStatusPage;

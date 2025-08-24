"use client";
import { useAuth } from "@/app/contexts/AuthContext";
import { getUserOrdersWithDetails } from "@/app/utils/firebase/orders.firebase";
import { Delivery } from "@/app/utils/types/delivery.type";
import { DeliveryStatus, Order } from "@/app/utils/types/order.type";
import { Recipe } from "@/app/utils/types/recipe.type";
import Head from "next/head";
import Link from "next/link";
import { useEffect, useState } from "react";

// Extended order type with additional details
type OrderWithDetails = Order & {
  recipe?: Recipe;
  delivery?: Delivery;
};

type TimelineEvent = {
  date: string;
  title: string;
  description: string;
  isActive: boolean;
  isCompleted: boolean;
};

const OrderStatusPage = () => {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<"current" | "past">("current");
  const [selectedOrder, setSelectedOrder] = useState<OrderWithDetails | null>(null);
  const [orders, setOrders] = useState<OrderWithDetails[]>([]);
  const [deliveryNotes, setDeliveryNotes] = useState("");
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [showCartNotification, setShowCartNotification] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [ordersLoading, setOrdersLoading] = useState(true);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Fetch user orders on component mount and when user changes
  useEffect(() => {
    const fetchUserOrders = async () => {
      if (!user?.id) {
        setOrdersLoading(false);
        return;
      }

      try {
        setOrdersLoading(true);
        const userOrders = await getUserOrdersWithDetails(user.id);
        setOrders(userOrders);

        // Set the first current order as selected by default
        const currentOrders = userOrders.filter(order =>
          order.deliveryStatus !== DeliveryStatus.DELIVERED &&
          order.deliveryStatus !== DeliveryStatus.FAILED
        );
        if (currentOrders.length > 0) {
          setSelectedOrder(currentOrders[0]);
        } else if (userOrders.length > 0) {
          setSelectedOrder(userOrders[0]);
          setActiveTab("past");
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setOrdersLoading(false);
      }
    };

    fetchUserOrders();
  }, [user]);

  // Helper function to generate timeline based on delivery status
  const generateTimeline = (order: OrderWithDetails): TimelineEvent[] => {
    const { deliveryStatus, createdAt, deliveryDate } = order;

    const timeline: TimelineEvent[] = [
      {
        date: new Date(createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        title: "Order Placed",
        description: "Your order has been received",
        isActive: false,
        isCompleted: true,
      },
      {
        date: new Date(createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        title: "Order Confirmed",
        description: "Your order is being prepared",
        isActive: deliveryStatus === DeliveryStatus.PENDING,
        isCompleted: deliveryStatus !== DeliveryStatus.PENDING,
      },
      {
        date: new Date(deliveryDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        title: "Packed & Ready",
        description: "Your order is packed and ready for delivery",
        isActive: deliveryStatus === DeliveryStatus.PACKED,
        isCompleted: [DeliveryStatus.IN_TRANSIT, DeliveryStatus.DELIVERED].includes(deliveryStatus),
      },
      {
        date: new Date(deliveryDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        title: "Out for Delivery",
        description: "Fresh ingredients are on their way!",
        isActive: deliveryStatus === DeliveryStatus.IN_TRANSIT,
        isCompleted: deliveryStatus === DeliveryStatus.DELIVERED,
      },
      {
        date: new Date(deliveryDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        title: "Delivered",
        description: "Enjoy your cooking experience!",
        isActive: false,
        isCompleted: deliveryStatus === DeliveryStatus.DELIVERED,
      },
    ];

    // Handle failed delivery
    if (deliveryStatus === DeliveryStatus.FAILED) {
      timeline.push({
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        title: "Delivery Failed",
        description: "There was an issue with delivery. Contact support for assistance.",
        isActive: false,
        isCompleted: true,
      });
    }

    return timeline;
  };

  // Filter orders based on active tab
  const currentOrders = orders.filter(order =>
    order.deliveryStatus !== DeliveryStatus.DELIVERED &&
    order.deliveryStatus !== DeliveryStatus.FAILED
  );

  const pastOrders = orders.filter(order =>
    order.deliveryStatus === DeliveryStatus.DELIVERED ||
    order.deliveryStatus === DeliveryStatus.FAILED
  );

  const displayedOrders = activeTab === "current" ? currentOrders : pastOrders;

  // Get status color based on delivery status
  const getStatusColor = (status: DeliveryStatus) => {
    switch (status) {
      case DeliveryStatus.PENDING:
        return "bg-yellow-100 text-yellow-800";
      case DeliveryStatus.PACKED:
        return "bg-blue-100 text-blue-800";
      case DeliveryStatus.IN_TRANSIT:
        return "bg-orange-100 text-orange-800";
      case DeliveryStatus.DELIVERED:
        return "bg-green-100 text-green-800";
      case DeliveryStatus.FAILED:
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Format delivery status for display
  const formatStatus = (status: DeliveryStatus) => {
    return status.split('_').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const handleReorder = (order: OrderWithDetails) => {
    if (!order.recipe) return;

    const newItem = {
      id: order.id,
      name: order.recipe.name,
      price: order.amount,
      quantity: 1,
    };

    setCartItems([...cartItems, newItem]);
    setShowCartNotification(true);

    setTimeout(() => {
      setShowCartNotification(false);
    }, 3000);
  };

  const handleOrderSelect = (order: OrderWithDetails) => {
    setSelectedOrder(order);
    setDeliveryNotes(order.delivery?.deliveryNote || "");
  };

  const handleSaveDeliveryNotes = () => {
    if (deliveryNotes.trim().length > 200) {
      alert("Notes should be less than 200 characters");
      return;
    }

    console.log("Delivery notes saved:", deliveryNotes);
    setShowNotesModal(false);
    // Note: In a real implementation, you'd update this in the database
  };

  // Show loading or login prompt
  if (loading || ordersLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Please Login</h2>
          <p className="text-gray-600 mb-6">You need to be logged in to view your orders.</p>
          <Link
            href="/auth/login"
            className="bg-orange-600 text-white px-6 py-2 rounded-md hover:bg-orange-700"
          >
            Login
          </Link>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">No Orders Found</h2>
          <p className="text-gray-600 mb-6">You haven't placed any orders yet.</p>
          <Link
            href="/shop"
            className="bg-orange-600 text-white px-6 py-2 rounded-md hover:bg-orange-700"
          >
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen font-inter">
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
            className={`bg-white rounded-lg shadow-xl w-full ${isMobile ? "max-w-full mx-4" : "max-w-md"
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
                className={`px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white ${deliveryNotes.trim()
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

      <header className="">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold font-inter ">Track delivery</h1>
        </div>
        <hr />
      </header>

      <main className="max-w-7xl mx-auto px-4 py-2 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left side - Orders List and Details */}
          <div className="lg:w-2/3 space-y-6">
            {/* Tabs */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="border-b border-gray-200">
                <nav className="flex -mb-px">
                  <button
                    onClick={() => {
                      setActiveTab("current");
                      if (currentOrders.length > 0) {
                        setSelectedOrder(currentOrders[0]);
                      }
                    }}
                    className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${activeTab === "current"
                      ? "border-orange-500 text-orange-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                      }`}
                  >
                    Current Orders ({currentOrders.length})
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab("past");
                      if (pastOrders.length > 0) {
                        setSelectedOrder(pastOrders[0]);
                      }
                    }}
                    className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${activeTab === "past"
                      ? "border-orange-500 text-orange-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                      }`}
                  >
                    Order History ({pastOrders.length})
                  </button>
                </nav>
              </div>

              {/* Orders List */}
              <div className={`${isMobile ? 'max-h-60 overflow-y-auto' : 'max-h-80 overflow-y-auto'} p-4`}>
                {displayedOrders.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">
                      {activeTab === "current"
                        ? "No current orders found"
                        : "No order history found"
                      }
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {displayedOrders.map((order) => (
                      <div
                        key={order.id}
                        onClick={() => handleOrderSelect(order)}
                        className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${selectedOrder?.id === order.id
                          ? "border-orange-500 bg-orange-50"
                          : "border-gray-200 hover:border-gray-300"
                          }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">
                              {order.recipe?.name || "Recipe"}
                            </h4>
                            <p className="text-sm text-gray-500">
                              Order #{order.id.slice(-8)}
                            </p>
                            <p className="text-sm text-gray-500">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="mt-2 sm:mt-0 flex items-center space-x-4">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                order.deliveryStatus
                              )}`}
                            >
                              {formatStatus(order.deliveryStatus)}
                            </span>
                            <span className="text-sm font-medium">
                              ₦{order.amount.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Order Details */}
            {selectedOrder && (
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-800">
                        {selectedOrder.recipe?.name || "Recipe"}
                      </h2>
                      <p className="text-sm text-gray-500 mt-1">
                        Order #{selectedOrder.id}
                      </p>
                    </div>
                    <span
                      className={`mt-2 sm:mt-0 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                        selectedOrder.deliveryStatus
                      )}`}
                    >
                      {formatStatus(selectedOrder.deliveryStatus)}
                    </span>
                  </div>
                  <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between text-sm text-gray-600">
                    <span>
                      Ordered: {new Date(selectedOrder.createdAt).toLocaleDateString()}
                    </span>
                    <span className="mt-1 sm:mt-0">
                      Expected: {new Date(selectedOrder.deliveryDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Timeline */}
                <div className="p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Order Timeline
                  </h3>
                  <div className="space-y-6">
                    {generateTimeline(selectedOrder).map((event, index) => (
                      <div key={index} className="flex">
                        <div className="flex flex-col items-center mr-4">
                          <div
                            className={`flex items-center justify-center w-8 h-8 rounded-full ${event.isCompleted
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
                            ) : event.isActive ? (
                              <div className="w-3 h-3 rounded-full bg-current animate-pulse"></div>
                            ) : (
                              <div className="w-3 h-3 rounded-full bg-current"></div>
                            )}
                          </div>
                          {index < generateTimeline(selectedOrder).length - 1 && (
                            <div
                              className={`w-0.5 h-10 ${event.isCompleted ? "bg-green-500" : "bg-gray-200"
                                }`}
                            ></div>
                          )}
                        </div>
                        <div className="pb-6">
                          <h4
                            className={`text-sm font-medium ${event.isActive
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
                          <p className="text-xs text-gray-400 mt-1">
                            {event.date}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Delivery Notes Section */}
                  {activeTab === "current" && selectedOrder.deliveryStatus !== DeliveryStatus.DELIVERED && (
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
                            {selectedOrder.delivery?.deliveryNote ? (
                              <p>{selectedOrder.delivery.deliveryNote}</p>
                            ) : (
                              <p>No special instructions added</p>
                            )}
                          </div>
                          <div className="mt-4">
                            <button
                              onClick={() => {
                                setDeliveryNotes(selectedOrder.delivery?.deliveryNote || "");
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
                              {selectedOrder.delivery?.deliveryNote
                                ? "Edit instructions"
                                : "Add instructions"}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="p-6 border-t border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    {activeTab === "current" ? "Order Actions" : "Reorder Options"}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {activeTab === "current" ? (
                      <>
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
                    ) : (
                      <>
                        <button
                          onClick={() => handleReorder(selectedOrder)}
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
            )}
          </div>

          {/* Right side - Order Summary */}
          <div className="lg:w-1/3">
            {selectedOrder ? (
              <div className="bg-white rounded-lg shadow-md overflow-hidden sticky top-8">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">
                    Order Summary
                  </h3>
                </div>
                <div className="p-6">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Order Number</span>
                    <span className="font-medium">#{selectedOrder.id.slice(-8)}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Recipe</span>
                    <span className="font-medium text-right max-w-32 truncate">
                      {selectedOrder.recipe?.name || "Recipe"}
                    </span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Amount</span>
                    <span className="font-medium">₦{selectedOrder.amount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Status</span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        selectedOrder.deliveryStatus
                      )}`}
                    >
                      {formatStatus(selectedOrder.deliveryStatus)}
                    </span>
                  </div>
                  <div className="flex justify-between mb-4">
                    <span className="text-gray-600">Delivery Range</span>
                    <span className="font-medium text-sm">
                      {selectedOrder.deliveryDurationRange || "1-3 days"}
                    </span>
                  </div>

                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between">
                      <span className="font-medium">Total</span>
                      <span className="font-medium text-orange-600">
                        ₦{selectedOrder.amount.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Delivery Address */}
                  {selectedOrder.delivery && (
                    <div className="mt-6">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">
                        Delivery Address
                      </h4>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p className="font-medium">{selectedOrder.delivery.deliveryName}</p>
                        <p>{selectedOrder.delivery.deliveryAddress}</p>
                        <p>
                          {selectedOrder.delivery.deliveryCity}, {selectedOrder.delivery.deliveryState}
                        </p>
                        <p>{selectedOrder.delivery.deliveryLGA}</p>
                        {selectedOrder.delivery.deliveryPhone && (
                          <p className="text-orange-600">
                            📞 {selectedOrder.delivery.deliveryPhone}
                          </p>
                        )}
                        {selectedOrder.delivery.deliveryEmail && (
                          <p className="text-orange-600">
                            ✉️ {selectedOrder.delivery.deliveryEmail}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Recipe Details */}
                  {selectedOrder.recipe && (
                    <div className="mt-6">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">
                        Recipe Details
                      </h4>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>
                          <span className="font-medium">Duration:</span>{" "}
                          {selectedOrder.recipe.duration ? `${Math.floor(selectedOrder.recipe.duration / 60)} min` : "N/A"}
                        </p>
                        <p>
                          <span className="font-medium">Difficulty:</span>{" "}
                          {selectedOrder.recipe.difficulty || "N/A"}
                        </p>
                        <p>
                          <span className="font-medium">Servings:</span>{" "}
                          {selectedOrder.recipe.servings || "N/A"}
                        </p>
                        {selectedOrder.recipe.description && (
                          <p className="mt-2 text-xs">
                            {selectedOrder.recipe.description.slice(0, 100)}
                            {selectedOrder.recipe.description.length > 100 ? "..." : ""}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Order Dates */}
                  <div className="mt-6">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">
                      Important Dates
                    </h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>
                        <span className="font-medium">Ordered:</span>{" "}
                        {new Date(selectedOrder.createdAt).toLocaleDateString('en-US', {
                          weekday: 'short',
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </p>
                      <p>
                        <span className="font-medium">Expected Delivery:</span>{" "}
                        {new Date(selectedOrder.deliveryDate).toLocaleDateString('en-US', {
                          weekday: 'short',
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </p>
                      {selectedOrder.updatedAt !== selectedOrder.createdAt && (
                        <p>
                          <span className="font-medium">Last Updated:</span>{" "}
                          {new Date(selectedOrder.updatedAt).toLocaleDateString('en-US', {
                            weekday: 'short',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6">
                  <div className="text-center text-gray-500">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400 mb-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <p>Select an order to view details</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default OrderStatusPage;

"use client";

import { useAuth } from "@/app/contexts/AuthContext";
import { useInProfile } from "@/app/lib/useInProfile";
import { getPaginatedUserOrdersWithDetails } from "@/app/utils/firebase/orders.firebase";
import { Delivery } from "@/app/utils/types/delivery.type";
import {
  DeliveryStatus,
  Order
} from "@/app/utils/types/order.type";
import { Recipe } from "@/app/utils/types/recipe.type";
import {
  Calendar,
  ChevronRight,
  Clock,
  DollarSign,
  Loader2,
  MapPin,
  Package
} from "lucide-react";
import { useEffect, useState } from "react";
import OrderReviewManager from "../../components/OrderReviewManager";
import Link from "next/link";

type OrderWithDetails = Order & {
  recipes?: Recipe[];
  delivery?: Delivery;
};

type Props = { showHeader?: boolean /* optional override */ };

const statusColorMap = {
  [DeliveryStatus.PENDING]: "text-yellow-600 bg-yellow-100",
  [DeliveryStatus.PACKED]: "text-blue-600 bg-blue-100",
  [DeliveryStatus.IN_TRANSIT]: "text-purple-600 bg-purple-100",
  [DeliveryStatus.DELIVERED]: "text-green-600 bg-green-100",
  [DeliveryStatus.FAILED]: "text-red-600 bg-red-100",
};

const statusDisplayMap = {
  [DeliveryStatus.PENDING]: "Pending",
  [DeliveryStatus.PACKED]: "Packed",
  [DeliveryStatus.IN_TRANSIT]: "In Transit",
  [DeliveryStatus.DELIVERED]: "Delivered",
  [DeliveryStatus.FAILED]: "Failed",
};

const OrderHistory = ({ showHeader }) => {
  const inProfile = useInProfile();
  const shouldShowHeader = showHeader ?? !inProfile;
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<OrderWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [lastOrderId, setLastOrderId] = useState<string | undefined>();
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const toggleExpand = (id: string) => {
    setExpandedOrderId((prev) => (prev === id ? null : id));
  };

  const fetchOrders = async (reset = false) => {
    if (!user) return;

    try {
      if (reset) {
        setLoading(true);
        setOrders([]);
        setCurrentPage(1);
        setLastOrderId(undefined);
      } else {
        setLoadingMore(true);
      }

      setError(null);

      const result = await getPaginatedUserOrdersWithDetails(
        user.id,
        5, // pageSize
        reset ? undefined : lastOrderId
      );

      if (reset) {
        setOrders(result.orders);
      } else {
        setOrders((prev) => [...prev, ...result.orders]);
      }

      setHasMore(result.hasMore);
      setLastOrderId(result.lastOrderId);

      if (!reset) {
        setCurrentPage((prev) => prev + 1);
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError("Failed to load orders. Please try again.");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMore = () => {
    if (!loadingMore && hasMore) {
      fetchOrders(false);
    }
  };

  useEffect(() => {
    if (user && !authLoading) {
      fetchOrders(true);
    } else if (!authLoading && !user) {
      setLoading(false);
      setOrders([]);
    }
  }, [user, authLoading]);

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  if (authLoading) {
    return (
      <div className="h-full md:min-h-screen bg-gray-50 p-4 md:p-8 lg:p-16 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="h-full md:min-h-screen bg-gray-50 p-4 md:p-8 lg:p-16 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            Please Login
          </h1>
          <p className="text-gray-600 mb-6">
            You need to be logged in to view your order history.
          </p>
          <a
            href="/auth/login"
            className="bg-orange-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-orange-600 transition-colors"
          >
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full md:min-h-screen   p-4 md:p-6 ">

      <div className="max-w-4xl mx-auto">
        {shouldShowHeader && (
          <h1 className="text-2xl font-inter font-bold mb-2 text-center md:text-left">Order History</h1>
        )}
        <hr />
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
              <p className="text-gray-600">Loading your orders...</p>
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => fetchOrders(true)}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              No Orders Yet
            </h2>
            <p className="text-gray-600 mb-6">
              You haven't placed any orders yet. Start exploring our delicious
              recipes!
            </p>
            <a
              href="/shop"
              className="bg-orange-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-orange-600 transition-colors inline-block"
            >
              Browse Recipes
            </a>
          </div>
        ) : (
          <>
            <div className="space-y-6">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white shadow-md rounded-xl p-6 border border-gray-100 hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1"
                >
                  {/* Order Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="flex items-center gap-3">
                          {/* Recipe Image Preview */}
                          {order.recipes && order.recipes.length > 0 && (
                            <div className="relative">


                              <img
                                src={order.recipes[0].displayMedia?.url || '/app/assets/food.png'}
                                alt={order.recipes[0].name}
                                className="w-24 h-24 md:w-12 md:h-12 rounded-lg object-cover border-2 border-orange-200"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = '/app/assets/food.png';
                                }}
                              />
                              {order.recipes.length > 1 && (
                                <div className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold border-2 border-white">
                                  {order.recipes.length}
                                </div>
                              )}
                            </div>
                          )}
                          <div className="flex flex-col">
                            <div >
                            <h3 className="text-lg font-semibold text-gray-800">
                              Order #{order.id.slice(-8).toUpperCase()}
                            </h3>
                              <div className="flex items-center my-2">
                                {order.recipes && order.recipes.length > 0 && (
                                  <p className="text-sm text-gray-600">
                                    {order.recipes.length === 1
                                      ? order.recipes[0].name
                                      : `${order.recipes.length} recipes`}
                                  </p>

                                )}
                                <div className="mx-2 ">
                                  <span
                                    className={`px-3 py-[2px] text-sm rounded-sm font-medium ${statusColorMap[order.deliveryStatus]
                                      }`}
                                  >
                                    {statusDisplayMap[order.deliveryStatus]}
                                  </span>
                                </div>
                              </div>

                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                <span>{formatDate(order.createdAt)}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <span className="font-medium text-orange-600">
                                  {formatCurrency(order.amount)}
                                </span>
                              </div>
                              {order.deliveryDurationRange && (
                                <div className="flex items-center gap-1">
                                  <Package className="h-4 w-4" />
                                  <span>{order.deliveryDurationRange}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                      </div>

                    </div>
                    <button
                      className="text-orange-500 hover:text-orange-600 text-sm font-medium md:hidden flex items-center gap-1"
                      onClick={() => toggleExpand(order.id)}
                    >
                      {expandedOrderId === order.id
                        ? "Hide Details"
                        : "View Details"}
                      <ChevronRight className={`h-4 w-4 transition-transform ${expandedOrderId === order.id ? 'rotate-90' : ''}`} />
                    </button>
                  </div>

                  {/* Recipe Information */}
                  {order.recipes && order.recipes.length > 0 && (
                    <div className="border-t border-gray-100 pt-4 mb-4">
                      <h4 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
                        <Package className="h-4 w-4" />
                        Recipe{order.recipes.length > 1 ? 's' : ''} ({order.recipes.length})
                      </h4>

                      {/* Recipe Grid for Multiple Recipes */}
                      {order.recipes.length > 1 ? (
                        <div className="space-y-3">
                          {order.recipes.map((recipe, index) => (
                            <div key={recipe.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                              <div className="flex-shrink-0">
                                <img
                                  src={recipe.displayMedia?.url || '/app/assets/food.png'}
                                  alt={recipe.name}
                                  className="w-16 h-16 rounded-lg object-cover border border-gray-200"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.src = '/app/assets/food.png';
                                  }}
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-800 mb-1">
                                  {index + 1}. {recipe.name}
                                </p>
                                {recipe.description && (
                                  <p className="text-sm text-gray-500 overflow-hidden" style={{
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical' as any
                                  }}>
                                    {recipe.description.slice(0, 100)}
                                    {recipe.description.length > 100 ? "..." : ""}
                                  </p>
                                )}
                                <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                                  {recipe.duration && (
                                    <span className="flex"><Clock className="w-4 mx-1 h-4"/> {Math.floor(recipe.duration / 60)} min</span>
                                  )}
                                  <span className="font-medium text-orange-600">
                                    ₦{recipe.price.toLocaleString()}
                                  </span>
                                  {recipe.difficulty && (
                                    <span>🔥 {recipe.difficulty}</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                          <div className="bg-orange-50 p-3 rounded border-l-4 border-orange-400">
                            <div className="flex justify-between items-center text-sm">
                              <span className="font-medium text-gray-800">Total Recipe Value:</span>
                              <span className="font-bold text-orange-600">
                                ₦{order.recipes.reduce((sum, recipe) => sum + recipe.price, 0).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        /* Single Recipe Display */
                        <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg border border-orange-100">
                          <div className="flex-shrink-0">
                            <img
                              src={order.recipes[0].displayMedia?.url || '/app/assets/food.png'}
                              alt={order.recipes[0].name}
                              className="w-20 h-20 rounded-lg object-cover border-2 border-orange-200 shadow-sm"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = '/app/assets/food.png';
                              }}
                            />
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-gray-800 text-lg mb-2">
                              {order.recipes[0].name}
                            </p>
                            {order.recipes[0].description && (
                              <p className="text-sm text-gray-600 mb-2 overflow-hidden" style={{
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical' as any
                              }}>
                                {order.recipes[0].description}
                              </p>
                            )}
                            <div className="flex items-center gap-4 text-sm">
                              {order.recipes[0].duration && (
                                <span className="flex items-center gap-1 text-gray-600">
                                  ⏱️ {Math.floor(order.recipes[0].duration / 60)} min
                                </span>
                              )}
                              <span className="flex items-center gap-1 font-medium text-orange-600">
                                💰 ₦{order.recipes[0].price.toLocaleString()}
                              </span>
                              {order.recipes[0].difficulty && (
                                <span className="flex items-center gap-1 text-gray-600">
                                  🔥 {order.recipes[0].difficulty}
                                </span>
                              )}
                              {order.recipes[0].servings && (
                                <span className="flex items-center gap-1 text-gray-600">
                                  👥 {order.recipes[0].servings} servings
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Mobile collapsible details */}
                  {expandedOrderId === order.id && (
                    <div className="md:hidden mt-4 pt-4 border-t border-gray-100 space-y-4">
                      {/* Mobile Recipe List */}
                      {order.recipes && order.recipes.length > 0 && (
                        <div>
                          <h4 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
                            <Package className="h-4 w-4" />
                            Recipe{order.recipes.length > 1 ? 's' : ''}
                          </h4>
                          <div className="space-y-2">
                            {order.recipes.map((recipe, index) => (
                              <div key={recipe.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                                <img
                                  src={recipe.displayMedia?.url || '/app/assets/food.png'}
                                  alt={recipe.name}
                                  className="w-12 h-12 rounded-lg object-cover border border-gray-200"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.src = '/app/assets/food.png';
                                  }}
                                />
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-gray-800 text-sm">{recipe.name}</p>
                                  <p className="text-xs text-orange-600 font-medium">₦{recipe.price.toLocaleString()}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {order.delivery && (
                        <div>
                          <h4 className="font-medium text-gray-800 mb-2 flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            Delivery Information
                          </h4>
                          <div className="text-sm text-gray-600 space-y-1 bg-gray-50 p-3 rounded-lg">
                            <p>
                              <span className="font-medium">Name:</span>{" "}
                              {order.delivery.deliveryName}
                            </p>
                            <p>
                              <span className="font-medium">Phone:</span>{" "}
                              {order.delivery.deliveryPhone}
                            </p>
                            <p>
                              <span className="font-medium">Address:</span>{" "}
                              {order.delivery.deliveryAddress}
                            </p>
                            <p>
                              <span className="font-medium">City:</span>{" "}
                              {order.delivery.deliveryCity},{" "}
                              {order.delivery.deliveryState}
                            </p>
                            {order.delivery.deliveryNote && (
                              <p>
                                <span className="font-medium">Note:</span>{" "}
                                {order.delivery.deliveryNote}
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      {(order.deliveryDate || order.deliveryDurationRange) && (
                        <div className="grid grid-cols-1 gap-3">
                          {order.deliveryDate && (
                            <div className="bg-blue-50 p-3 rounded-lg">
                              <h4 className="font-medium text-gray-800 mb-1 text-sm">
                                Delivery Date
                              </h4>
                              <p className="text-sm text-gray-600">
                                {formatDate(order.deliveryDate)}
                              </p>
                            </div>
                          )}

                          {order.deliveryDurationRange && (
                            <div className="bg-green-50 p-3 rounded-lg">
                              <h4 className="font-medium text-gray-800 mb-1 text-sm">
                                Delivery Duration
                              </h4>
                              <p className="text-sm text-gray-600">
                                {order.deliveryDurationRange}
                              </p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Mobile Action Buttons */}
                      <div className="flex gap-2 pt-2">
                        <Link href="/shop" className=" text-center flex-1 px-3 py-2 text-sm bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors">
                          Reorder
                        </Link>
                        <Link href="/profile?tab=track" className="text-center flex-1 px-3 py-2 text-sm border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors">
                          Track Order
                        </Link>
                      </div>
                    </div>
                  )}

                  {/* Desktop view always shows details */}
                  <div className="hidden md:block space-y-4">
                    {order.delivery && (
                      <div className="border-t border-gray-100 pt-4">
                        <h4 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          Delivery Information
                        </h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600 mb-1">
                              Name:{" "}
                              <span className="font-medium text-gray-800">
                                {order.delivery.deliveryName}
                              </span>
                            </p>
                            <p className="text-gray-600 mb-1">
                              Phone:{" "}
                              <span className="font-medium text-gray-800">
                                {order.delivery.deliveryPhone}
                              </span>
                            </p>
                            <p className="text-gray-600">
                              Email:{" "}
                              <span className="font-medium text-gray-800">
                                {order.delivery.deliveryEmail}
                              </span>
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-600 mb-1">
                              Address:{" "}
                              <span className="font-medium text-gray-800">
                                {order.delivery.deliveryAddress}
                              </span>
                            </p>
                            <p className="text-gray-600 mb-1">
                              City:{" "}
                              <span className="font-medium text-gray-800">
                                {order.delivery.deliveryCity},{" "}
                                {order.delivery.deliveryState}
                              </span>
                            </p>
                            {order.delivery.deliveryNote && (
                              <p className="text-gray-600">
                                Note:{" "}
                                <span className="font-medium text-gray-800">
                                  {order.delivery.deliveryNote}
                                </span>
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="border-t border-gray-100 pt-4 grid grid-cols-2 gap-4 text-sm">
                      {order.deliveryDate && (
                        <div>
                          <h4 className="font-medium text-gray-800 mb-1">
                            Delivery Date
                          </h4>
                          <p className="text-gray-600">
                            {formatDate(order.deliveryDate)}
                          </p>
                        </div>
                      )}

                    </div>

                  </div>

                  {/* Review Manager for Completed Orders */}
                  {order.deliveryStatus === DeliveryStatus.DELIVERED && order.recipes && order.recipes.length > 0 && (
                    <div className="border-t border-gray-100 pt-4">
                      <OrderReviewManager
                        recipes={order.recipes}
                        orderId={order.id}
                        onReviewSubmitted={() => {
                          // Optionally refresh orders or show success message
                          console.log('Review submitted/updated for order:', order.id);
                        }}
                      />
                    </div>
                  )}
                </div>

              ))}
            </div>

            {/* Load More / Pagination */}
            {hasMore && (
              <div className="mt-8 text-center">
                <button
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="bg-orange-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-orange-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
                >
                  {loadingMore ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading more...
                    </>
                  ) : (
                    <>
                      Load More Orders
                      <ChevronRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Page indicator */}
            {orders.length > 0 && (
              <div className="mt-6 text-center text-sm text-gray-600">
                Showing {orders.length} order{orders.length !== 1 ? "s" : ""}
                {hasMore && " (more available)"}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default OrderHistory;

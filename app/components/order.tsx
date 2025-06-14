"use client";

import Link from "next/link";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  Package,
  Clock,
  MapPin,
  Phone,
  Mail,
  User,
  ChevronRight,
  Calendar,
  DollarSign,
  Truck,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { getUserOrdersWithDelivery } from "../utils/firebase/orders.firebase";
import { Order, DeliveryStatus } from "../utils/types/order.type";
import { Delivery } from "../utils/types/delivery.type";
import { Recipe } from "../utils/types/recipe.type";
import { RecipeDetailModal } from "./admin/RecipeDetailModal";
import { cn } from "../lib/utils/cn";

type OrderWithDelivery = Order & { delivery?: Delivery };

const OrderComponent = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<OrderWithDelivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const userOrders = await getUserOrdersWithDelivery(user.id);
        setOrders(userOrders);
      } catch (error) {
        console.error("Error fetching orders:", error);
        setError("Failed to load orders. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  const getStatusColor = (status: DeliveryStatus) => {
    switch (status) {
      case DeliveryStatus.DELIVERED:
        return "text-green-600 bg-green-50";
      case DeliveryStatus.PENDING:
        return "text-yellow-600 bg-yellow-50";
      case DeliveryStatus.FAILED:
        return "text-red-600 bg-red-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const getStatusIcon = (status: DeliveryStatus) => {
    switch (status) {
      case DeliveryStatus.DELIVERED:
        return <CheckCircle size={16} className="text-green-600" />;
      case DeliveryStatus.PENDING:
        return <AlertCircle size={16} className="text-yellow-600" />;
      case DeliveryStatus.FAILED:
        return <XCircle size={16} className="text-red-600" />;
      default:
        return <Package size={16} className="text-gray-600" />;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      return "Invalid date";
    }
  };

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleRecipeClick = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
  };

  const closeRecipeModal = () => {
    setSelectedRecipe(null);
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <Package className="w-16 h-16 text-gray-300 mb-4" />
        <h3 className="text-xl font-semibold text-gray-600 mb-2">
          Sign in to view orders
        </h3>
        <p className="text-gray-500 mb-4">
          You need to be signed in to see your order history
        </p>
        <Link
          href="/auth/login"
          className="bg-orange-400 hover:bg-orange-500 text-white px-6 py-2 rounded-lg transition-colors"
        >
          Sign In
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800">Order History</h2>
        </div>
        {/* Loading skeleton */}
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-lg border border-gray-200 p-4 animate-pulse"
            >
              <div className="flex gap-4">
                <div className="w-20 h-20 bg-gray-200 rounded-lg flex-shrink-0"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <XCircle className="w-16 h-16 text-red-300 mb-4" />
        <h3 className="text-xl font-semibold text-red-600 mb-2">
          Error loading orders
        </h3>
        <p className="text-gray-500 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-orange-400 hover:bg-orange-500 text-white px-6 py-2 rounded-lg transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <Package className="w-16 h-16 text-gray-300 mb-4" />
        <h3 className="text-xl font-semibold text-gray-600 mb-2">
          No orders yet
        </h3>
        <p className="text-gray-500 mb-4">
          Place your first order to see it here
        </p>
        <Link
          href="/recipes"
          className="bg-orange-400 hover:bg-orange-500 text-white px-6 py-2 rounded-lg transition-colors"
        >
          Browse Recipes
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Order History</h2>
        <p className="text-gray-500">
          {orders.length} order{orders.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block">
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left p-4 font-semibold text-gray-700">
                  Order
                </th>
                <th className="text-left p-4 font-semibold text-gray-700">
                  Recipe
                </th>
                <th className="text-left p-4 font-semibold text-gray-700">
                  Amount
                </th>
                <th className="text-left p-4 font-semibold text-gray-700">
                  Status
                </th>
                <th className="text-left p-4 font-semibold text-gray-700">
                  Date
                </th>
                <th className="text-left p-4 font-semibold text-gray-700">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {orders.map((order) => (
                <tr
                  key={order.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="p-4">
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-900">
                        #{order.id.slice(-8)}
                      </span>
                      <span className="text-sm text-gray-500">
                        {order.deliveryDurationRange}
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      {order.recipe?.displayMedia?.url && (
                        <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                          {order.recipe.displayMedia.type === "video" ? (
                            <video
                              src={order.recipe.displayMedia.url}
                              className="w-full h-full object-cover"
                              muted
                            />
                          ) : (
                            <Image
                              src={order.recipe.displayMedia.url}
                              alt={order.recipe.name}
                              width={48}
                              height={48}
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-gray-900">
                          {order.recipe?.name || "Recipe unavailable"}
                        </p>
                        <p className="text-sm text-gray-500">
                          {order.recipe?.ingredients?.slice(0, 2).join(", ")}
                          {order.recipe?.ingredients &&
                            order.recipe.ingredients.length > 2 &&
                            "..."}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="font-semibold text-gray-900">
                      {formatPrice(order.amount)}
                    </span>
                  </td>
                  <td className="p-4">
                    <div
                      className={cn(
                        "inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-sm font-medium",
                        getStatusColor(order.deliveryStatus)
                      )}
                    >
                      {getStatusIcon(order.deliveryStatus)}
                      <span className="capitalize">{order.deliveryStatus}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="text-gray-600">
                      {formatDate(order.createdAt)}
                    </span>
                  </td>
                  <td className="p-4">
                    {order.recipe && (
                      <button
                        onClick={() => handleRecipeClick(order.recipe!)}
                        className="inline-flex items-center gap-1 text-orange-600 hover:text-orange-700 font-medium transition-colors"
                      >
                        View Recipe
                        <ChevronRight size={16} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden space-y-4">
        {orders.map((order) => (
          <div
            key={order.id}
            className="bg-white rounded-lg border border-gray-200 p-4 space-y-4"
          >
            {/* Order Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-900">
                  #{order.id.slice(-8)}
                </span>
                <div
                  className={cn(
                    "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
                    getStatusColor(order.deliveryStatus)
                  )}
                >
                  {getStatusIcon(order.deliveryStatus)}
                  <span className="capitalize">{order.deliveryStatus}</span>
                </div>
              </div>
              <span className="font-bold text-orange-600">
                {formatPrice(order.amount)}
              </span>
            </div>

            {/* Recipe Info */}
            {order.recipe && (
              <div
                className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
                onClick={() => handleRecipeClick(order.recipe!)}
              >
                {order.recipe.displayMedia?.url && (
                  <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                    {order.recipe.displayMedia.type === "video" ? (
                      <video
                        src={order.recipe.displayMedia.url}
                        className="w-full h-full object-cover"
                        muted
                      />
                    ) : (
                      <Image
                        src={order.recipe.displayMedia.url}
                        alt={order.recipe.name}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {order.recipe.name}
                  </h3>
                  <p className="text-sm text-gray-500 line-clamp-2">
                    {order.recipe.ingredients?.slice(0, 3).join(", ")}
                    {order.recipe.ingredients &&
                      order.recipe.ingredients.length > 3 &&
                      "..."}
                  </p>
                </div>
                <ChevronRight size={20} className="text-gray-400" />
              </div>
            )}

            {/* Order Details */}
            <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-100">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar size={16} />
                <span>{formatDate(order.createdAt)}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Truck size={16} />
                <span>{order.deliveryDurationRange}</span>
              </div>
            </div>

            {/* Delivery Info */}
            {order.delivery && (
              <div className="pt-3 border-t border-gray-100 space-y-2">
                <h4 className="font-medium text-gray-700 flex items-center gap-2">
                  <MapPin size={16} />
                  Delivery Information
                </h4>
                <div className="text-sm text-gray-600 space-y-1 ml-6">
                  <p className="flex items-center gap-2">
                    <User size={14} />
                    {order.delivery.deliveryName}
                  </p>
                  <p className="flex items-center gap-2">
                    <Phone size={14} />
                    {order.delivery.deliveryPhone}
                  </p>
                  <p className="flex items-center gap-2">
                    <Mail size={14} />
                    {order.delivery.deliveryEmail}
                  </p>
                  <p className="flex items-start gap-2">
                    <MapPin size={14} className="mt-0.5" />
                    <span>
                      {order.delivery.deliveryAddress},{" "}
                      {order.delivery.deliveryCity},{" "}
                      {order.delivery.deliveryState}
                    </span>
                  </p>
                  {order.delivery.deliveryNote && (
                    <p className="text-xs text-gray-500 italic">
                      Note: {order.delivery.deliveryNote}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Recipe Detail Modal */}
      {selectedRecipe && (
        <RecipeDetailModal recipe={selectedRecipe} onClose={closeRecipeModal} />
      )}
    </div>
  );
};

export default OrderComponent;

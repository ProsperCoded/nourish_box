"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  User,
  ShoppingCart,
  MapPin,
  Package,
  CheckCircle,
  Clock,
  Truck,
  XCircle,
  X,
} from "lucide-react";
import { Order, DeliveryStatus } from "@/app/utils/types/order.type";
import { User as UserType } from "@/app/utils/types/user.type";
import { Recipe } from "@/app/utils/types/recipe.type";
import { Delivery } from "@/app/utils/types/delivery.type";

export type OrderWithDetails = Order & {
  user?: UserType;
  recipe?: Recipe;
  delivery?: Delivery;
};

interface OrderModalProps {
  order: OrderWithDetails;
  isOpen: boolean;
  onClose: () => void;
  onStatusUpdate: (orderId: string, status: DeliveryStatus) => void;
}

const OrderModal = ({
  order,
  isOpen,
  onClose,
  onStatusUpdate,
}: OrderModalProps) => {
  const [selectedStatus, setSelectedStatus] = useState<DeliveryStatus>(
    order.deliveryStatus
  );
  const [isUpdating, setIsUpdating] = useState(false);

  const getStatusIcon = (status: DeliveryStatus) => {
    switch (status) {
      case DeliveryStatus.PENDING:
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case DeliveryStatus.PACKED:
        return <Package className="w-4 h-4 text-blue-600" />;
      case DeliveryStatus.IN_TRANSIT:
        return <Truck className="w-4 h-4 text-purple-600" />;
      case DeliveryStatus.DELIVERED:
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case DeliveryStatus.FAILED:
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: DeliveryStatus) => {
    switch (status) {
      case DeliveryStatus.PENDING:
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case DeliveryStatus.PACKED:
        return "bg-blue-100 text-blue-800 border-blue-200";
      case DeliveryStatus.IN_TRANSIT:
        return "bg-purple-100 text-purple-800 border-purple-200";
      case DeliveryStatus.DELIVERED:
        return "bg-green-100 text-green-800 border-green-200";
      case DeliveryStatus.FAILED:
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const handleStatusUpdate = async () => {
    if (selectedStatus === order.deliveryStatus) return;

    setIsUpdating(true);
    try {
      await onStatusUpdate(order.id, selectedStatus);
      onClose();
    } catch (error) {
      console.error("Error updating order status:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-800">
                Order Details
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={24} className="text-gray-600" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Order Info */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Order Details */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                    <ShoppingCart className="w-5 h-5 mr-2 text-brand-logo_green" />
                    Order Information
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">
                        Order ID:
                      </span>
                      <span className="text-gray-800 font-mono text-sm">
                        {order.id}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">Amount:</span>
                      <span className="text-gray-800 font-semibold">
                        ₦{order.amount.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">
                        Delivery Date:
                      </span>
                      <span className="text-gray-800">
                        {new Date(order.deliveryDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">
                        Duration Range:
                      </span>
                      <span className="text-gray-800">
                        {order.deliveryDurationRange}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">
                        Order Date:
                      </span>
                      <span className="text-gray-800">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Customer Info */}
                {order.user && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                      <User className="w-5 h-5 mr-2 text-brand-btn_orange" />
                      Customer Information
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-600">Name:</span>
                        <span className="text-gray-800">
                          {order.user.firstName} {order.user.lastName}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-600">
                          Email:
                        </span>
                        <span className="text-gray-800">
                          {order.user.email}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-600">
                          Phone:
                        </span>
                        <span className="text-gray-800">
                          {order.user.phone}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-600">City:</span>
                        <span className="text-gray-800">
                          {order.user.city}, {order.user.state}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Recipe Info */}
              {order.recipe && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                    <BookOpen className="w-5 h-5 mr-2 text-brand-logo_green" />
                    Recipe Information
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-start space-x-4">
                      {order.recipe.displayMedia && (
                        <img
                          src={order.recipe.displayMedia.url}
                          alt={order.recipe.name}
                          className="w-20 h-20 rounded-lg object-cover"
                        />
                      )}
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-800 text-lg">
                          {order.recipe.name}
                        </h4>
                        <p className="text-gray-600 text-sm mt-1">
                          {order.recipe.description}
                        </p>
                        <div className="flex items-center space-x-4 mt-2">
                          <span className="text-sm text-gray-500">
                            Price: ₦{order.recipe.price.toLocaleString()}
                          </span>
                          <span className="text-sm text-gray-500">
                            Duration: {order.recipe.duration}s
                          </span>
                          {order.recipe.servings && (
                            <span className="text-sm text-gray-500">
                              Serves: {order.recipe.servings}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Delivery Info */}
              {order.delivery && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                    <MapPin className="w-5 h-5 mr-2 text-blue-600" />
                    Delivery Information
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <span className="font-medium text-gray-600">
                          Delivery Name:
                        </span>
                        <p className="text-gray-800">
                          {order.delivery.deliveryName}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">
                          Phone:
                        </span>
                        <p className="text-gray-800">
                          {order.delivery.deliveryPhone}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">
                          Email:
                        </span>
                        <p className="text-gray-800">
                          {order.delivery.deliveryEmail}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">
                          Location:
                        </span>
                        <p className="text-gray-800">
                          {order.delivery.deliveryCity},{" "}
                          {order.delivery.deliveryState}
                        </p>
                      </div>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">
                        Address:
                      </span>
                      <p className="text-gray-800">
                        {order.delivery.deliveryAddress}
                      </p>
                    </div>
                    {order.delivery.deliveryNote && (
                      <div>
                        <span className="font-medium text-gray-600">Note:</span>
                        <p className="text-gray-800">
                          {order.delivery.deliveryNote}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Delivery Status Management */}
              <div className="space-y-4 border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                  <Package className="w-5 h-5 mr-2 text-purple-600" />
                  Delivery Status Management
                </h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-medium text-gray-600">
                      Current Status:
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(
                        order.deliveryStatus
                      )}`}
                    >
                      {getStatusIcon(order.deliveryStatus)}
                      <span className="ml-2 capitalize">
                        {order.deliveryStatus.replace("_", " ")}
                      </span>
                    </span>
                  </div>

                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-600">
                      Update Status:
                    </label>
                    <select
                      value={selectedStatus}
                      onChange={(e) =>
                        setSelectedStatus(e.target.value as DeliveryStatus)
                      }
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-logo_green focus:border-transparent"
                    >
                      {Object.values(DeliveryStatus).map((status) => (
                        <option key={status} value={status}>
                          {status.replace("_", " ").toUpperCase()}
                        </option>
                      ))}
                    </select>

                    {selectedStatus !== order.deliveryStatus && (
                      <button
                        onClick={handleStatusUpdate}
                        disabled={isUpdating}
                        className="w-full bg-brand-logo_green text-white py-3 px-4 rounded-lg hover:bg-brand-logo_green/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                      >
                        {isUpdating ? (
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        ) : (
                          <>
                            <CheckCircle className="w-5 h-5 mr-2" />
                            Update Status
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default OrderModal;

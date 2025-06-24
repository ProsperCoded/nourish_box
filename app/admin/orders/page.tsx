"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ShoppingCart,
  AlertTriangle,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  getAllOrdersWithDetails,
  getPaginatedOrdersWithDetails,
  getTotalOrdersCount,
  updateOrderDeliveryStatus,
} from "@/app/utils/firebase/admin.firebase";
import { DeliveryStatus } from "@/app/utils/types/order.type";
import OrdersTable, { OrderWithDetails } from "../components/OrdersTable";
import OrderModal from "../components/OrderModal";

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderWithDetails[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<OrderWithDetails | null>(
    null
  );
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [lastOrderId, setLastOrderId] = useState<string | undefined>();
  const [totalOrders, setTotalOrders] = useState(0);
  const [allOrdersForStats, setAllOrdersForStats] = useState<
    OrderWithDetails[]
  >([]);
  const pageSize = 5;

  const fetchOrders = async (resetToFirstPage = false) => {
    setLoading(true);
    setError(null);
    try {
      // Fetch total count and all orders for statistics
      const [totalCount, allOrdersData] = await Promise.all([
        getTotalOrdersCount(),
        getAllOrdersWithDetails(),
      ]);

      setTotalOrders(totalCount);
      setAllOrdersForStats(allOrdersData);

      // Fetch paginated orders for display
      const paginationData = await getPaginatedOrdersWithDetails(
        pageSize,
        resetToFirstPage ? undefined : lastOrderId
      );

      setOrders(paginationData.orders);
      setHasNextPage(paginationData.hasMore);
      if (resetToFirstPage) {
        setCurrentPage(1);
        setLastOrderId(paginationData.lastOrderId);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      setError("Failed to load orders. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchOrders(true);
    } catch (error) {
      console.error("Error refreshing orders:", error);
      setError("Failed to refresh orders. Please try again.");
    } finally {
      setRefreshing(false);
    }
  };

  const handleNextPage = async () => {
    if (!hasNextPage) return;

    setLoading(true);
    try {
      const paginationData = await getPaginatedOrdersWithDetails(
        pageSize,
        lastOrderId
      );

      setOrders(paginationData.orders);
      setHasNextPage(paginationData.hasMore);
      setLastOrderId(paginationData.lastOrderId);
      setCurrentPage((prev) => prev + 1);
    } catch (error) {
      console.error("Error fetching next page:", error);
      setError("Failed to load next page. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePrevPage = async () => {
    if (currentPage <= 1) return;

    // For simplicity, we'll reset to first page and then navigate
    // In a production app, you might want to implement bi-directional pagination
    setCurrentPage(1);
    setLastOrderId(undefined);
    await fetchOrders(true);
  };

  useEffect(() => {
    fetchOrders(true);
  }, []);

  const handleOrderClick = (order: OrderWithDetails) => {
    setSelectedOrder(order);
    setIsOrderModalOpen(true);
  };

  const handleOrderStatusUpdate = async (
    orderId: string,
    status: DeliveryStatus
  ) => {
    try {
      await updateOrderDeliveryStatus(orderId, status);

      // Refresh all orders for statistics
      const allOrdersData = await getAllOrdersWithDetails();
      setAllOrdersForStats(allOrdersData);

      // Refresh current page of orders
      const paginationData = await getPaginatedOrdersWithDetails(
        pageSize,
        currentPage === 1 ? undefined : lastOrderId
      );
      setOrders(paginationData.orders);
      setHasNextPage(paginationData.hasMore);

      // Update the selected order if it matches
      if (selectedOrder?.id === orderId) {
        const updatedOrder = paginationData.orders.find(
          (order) => order.id === orderId
        );
        if (updatedOrder) {
          setSelectedOrder(updatedOrder);
        }
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-96"></div>
        </div>

        {/* Filter Controls Skeleton */}
        <div className="bg-gray-50 rounded-lg p-4 animate-pulse">
          <div className="flex space-x-4">
            <div className="h-10 bg-gray-200 rounded flex-1"></div>
            <div className="h-10 bg-gray-200 rounded w-32"></div>
            <div className="h-10 bg-gray-200 rounded w-24"></div>
          </div>
        </div>

        {/* Orders Table Skeleton */}
        <OrdersTable
          orders={[]}
          loading={true}
          showSearch={true}
          showSort={true}
          showFilters={true}
          onOrderClick={() => {}}
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[60vh] w-full bg-gradient-to-br from-white via-gray-50 to-red-50">
        <AlertTriangle size={48} className="text-red-500 mb-4" />
        <p className="text-lg font-semibold text-red-600 mb-2">
          Error Loading Orders
        </p>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={() => fetchOrders(true)}
          className="px-4 py-2 bg-brand-logo_green text-white rounded-lg hover:bg-brand-logo_green/90 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between"
      >
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center">
            <ShoppingCart className="w-8 h-8 mr-3 text-brand-logo_green" />
            Orders Management
          </h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">
            Manage and track all customer orders, update delivery status, and
            view order details.
          </p>
        </div>

        <div className="mt-4 sm:mt-0">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center space-x-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw
              className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
            />
            <span>{refreshing ? "Refreshing..." : "Refresh"}</span>
          </button>
        </div>
      </motion.div>

      {/* Orders Statistics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-4"
      >
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">
                {
                  allOrdersForStats.filter(
                    (order) => order.deliveryStatus === DeliveryStatus.PENDING
                  ).length
                }
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Packed</p>
              <p className="text-2xl font-bold text-gray-900">
                {
                  allOrdersForStats.filter(
                    (order) => order.deliveryStatus === DeliveryStatus.PACKED
                  ).length
                }
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">In Transit</p>
              <p className="text-2xl font-bold text-gray-900">
                {
                  allOrdersForStats.filter(
                    (order) =>
                      order.deliveryStatus === DeliveryStatus.IN_TRANSIT
                  ).length
                }
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Delivered</p>
              <p className="text-2xl font-bold text-gray-900">
                {
                  allOrdersForStats.filter(
                    (order) => order.deliveryStatus === DeliveryStatus.DELIVERED
                  ).length
                }
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Orders Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-white rounded-xl shadow-lg p-6"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Orders ({totalOrders} total)
          </h2>
          <div className="text-sm text-gray-600">
            Page {currentPage} • Showing {orders.length} orders
          </div>
        </div>

        <OrdersTable
          orders={orders}
          loading={false}
          showSearch={true}
          showSort={true}
          showFilters={true}
          onOrderClick={handleOrderClick}
        />

        {/* Pagination Controls */}
        {totalOrders > pageSize && (
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
            <button
              onClick={handlePrevPage}
              disabled={currentPage <= 1}
              className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-700">Page {currentPage}</span>
              {totalOrders > 0 && (
                <span className="text-sm text-gray-500">
                  of {Math.ceil(totalOrders / pageSize)}
                </span>
              )}
            </div>

            <button
              onClick={handleNextPage}
              disabled={!hasNextPage}
              className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </motion.div>

      {/* Order Modal */}
      {selectedOrder && (
        <OrderModal
          order={selectedOrder}
          isOpen={isOrderModalOpen}
          onClose={() => {
            setIsOrderModalOpen(false);
            setSelectedOrder(null);
          }}
          onStatusUpdate={handleOrderStatusUpdate}
        />
      )}
    </div>
  );
}

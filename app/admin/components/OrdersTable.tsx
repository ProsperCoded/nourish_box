"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  BookOpen,
  User,
  ShoppingCart,
  DollarSign,
  Calendar,
  MapPin,
  Eye,
  Package,
  CheckCircle,
  Clock,
  Truck,
  XCircle,
  Search,
  Filter,
  SortAsc,
  SortDesc,
  X,
} from "lucide-react";
import { Order, DeliveryStatus } from "@/app/utils/types/order.type";
import { User as UserType } from "@/app/utils/types/user.type";
import { Recipe } from "@/app/utils/types/recipe.type";
import { Delivery } from "@/app/utils/types/delivery.type";

export type OrderWithDetails = Order & {
  user?: UserType;
  recipes?: Recipe[];
  delivery?: Delivery;
};

interface OrdersTableProps {
  orders: OrderWithDetails[];
  loading?: boolean;
  showSearch?: boolean;
  showSort?: boolean;
  showFilters?: boolean;
  maxItems?: number;
  onOrderClick: (order: OrderWithDetails) => void;
}

type SortField = "createdAt" | "amount" | "deliveryStatus" | "deliveryDate";
type SortDirection = "asc" | "desc";

const OrdersTable = ({
  orders,
  loading = false,
  showSearch = false,
  showSort = false,
  showFilters = false,
  maxItems,
  onOrderClick,
}: OrdersTableProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [statusFilter, setStatusFilter] = useState<DeliveryStatus | "all">(
    "all"
  );

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

  const filteredAndSortedOrders = useMemo(() => {
    let result = [...orders];

    // Apply search filter
    if (searchQuery) {
      result = result.filter((order) =>
        [
          order.id,
          order.user?.firstName,
          order.user?.lastName,
          order.user?.email,
          ...(order.recipes?.map(recipe => recipe.name) || []),
          order.delivery?.deliveryCity,
          order.delivery?.deliveryState,
        ]
          .filter(Boolean)
          .some((field) =>
            field?.toLowerCase().includes(searchQuery.toLowerCase())
          )
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      result = result.filter((order) => order.deliveryStatus === statusFilter);
    }

    // Apply sorting
    result.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortField) {
        case "createdAt":
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
          break;
        case "amount":
          aValue = a.amount;
          bValue = b.amount;
          break;
        case "deliveryStatus":
          aValue = a.deliveryStatus;
          bValue = b.deliveryStatus;
          break;
        case "deliveryDate":
          aValue = new Date(a.deliveryDate);
          bValue = new Date(b.deliveryDate);
          break;
        default:
          aValue = a[sortField];
          bValue = b[sortField];
      }

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    // Apply max items limit
    if (maxItems) {
      result = result.slice(0, maxItems);
    }

    return result;
  }, [orders, searchQuery, statusFilter, sortField, sortDirection, maxItems]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return null;
    return sortDirection === "asc" ? (
      <SortAsc className="w-4 h-4 ml-1" />
    ) : (
      <SortDesc className="w-4 h-4 ml-1" />
    );
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            className="border border-gray-200 rounded-lg p-4 animate-pulse"
          >
            <div className="flex justify-between items-start space-x-4">
              <div className="flex-1 space-y-3">
                <div className="flex space-x-4">
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                  <div className="h-3 bg-gray-200 rounded w-32"></div>
                  <div className="h-3 bg-gray-200 rounded w-28"></div>
                  <div className="h-3 bg-gray-200 rounded w-20"></div>
                  <div className="h-3 bg-gray-200 rounded w-24"></div>
                </div>
              </div>
              <div className="h-8 bg-gray-200 rounded w-24"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search and Filter Controls */}
      {(showSearch || showSort || showFilters) && (
        <div className="flex flex-col sm:flex-row gap-4 p-4 bg-gray-50 rounded-lg">
          {/* Search */}
          {showSearch && (
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search orders, customers, recipes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-logo_green focus:border-transparent"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          )}

          {/* Status Filter */}
          {showFilters && (
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value as DeliveryStatus | "all")
                }
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-logo_green focus:border-transparent"
              >
                <option value="all">All Status</option>
                {Object.values(DeliveryStatus).map((status) => (
                  <option key={status} value={status}>
                    {status.replace("_", " ").toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Sort Controls */}
          {showSort && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">Sort by:</span>
              <div className="flex space-x-1">
                <button
                  onClick={() => handleSort("createdAt")}
                  className={`px-3 py-2 text-sm rounded-lg border transition-colors flex items-center ${sortField === "createdAt"
                      ? "bg-brand-logo_green text-white border-brand-logo_green"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                    }`}
                >
                  Date {getSortIcon("createdAt")}
                </button>
                <button
                  onClick={() => handleSort("amount")}
                  className={`px-3 py-2 text-sm rounded-lg border transition-colors flex items-center ${sortField === "amount"
                      ? "bg-brand-logo_green text-white border-brand-logo_green"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                    }`}
                >
                  Amount {getSortIcon("amount")}
                </button>
                <button
                  onClick={() => handleSort("deliveryStatus")}
                  className={`px-3 py-2 text-sm rounded-lg border transition-colors flex items-center ${sortField === "deliveryStatus"
                      ? "bg-brand-logo_green text-white border-brand-logo_green"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                    }`}
                >
                  Status {getSortIcon("deliveryStatus")}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Results Info */}
      {(showSearch || showFilters) && (
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>
            Showing {filteredAndSortedOrders.length} of {orders.length} orders
          </span>
          {(searchQuery || statusFilter !== "all") && (
            <button
              onClick={() => {
                setSearchQuery("");
                setStatusFilter("all");
              }}
              className="text-brand-logo_green hover:text-brand-logo_green/80 font-medium"
            >
              Clear filters
            </button>
          )}
        </div>
      )}

      {/* Orders List */}
      {filteredAndSortedOrders.length > 0 ? (
        <div className="space-y-4">
          {filteredAndSortedOrders.map((order, index) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="border border-gray-200 rounded-lg p-4 hover:border-brand-logo_green/50 hover:shadow-md transition-all duration-200 cursor-pointer"
              onClick={() => onOrderClick(order)}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-3 lg:space-y-0">
                {/* Order Info */}
                <div className="flex-1 space-y-2">
                  <div className="flex items-center space-x-4">
                    <span className="font-mono text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
                      #{order.id.slice(-8)}
                    </span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium border flex  ${getStatusColor(
                        order.deliveryStatus
                      )}`}
                    >
                      {getStatusIcon(order.deliveryStatus)}
                      <span className="ml-1 capitalize">
                        {order.deliveryStatus.replace("_", " ")}
                      </span>
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-sm">
                    {order.user && (
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-brand-btn_orange" />
                        <span className="text-gray-600">
                          {order.user.firstName} {order.user.lastName}
                        </span>
                      </div>
                    )}
                    {order.recipes && order.recipes.length > 0 && (
                      <div className="flex items-center space-x-2">
                        <BookOpen className="w-4 h-4 text-brand-logo_green" />
                        <span className="text-gray-600 truncate">
                          {order.recipes.length === 1
                            ? order.recipes[0].name
                            : `${order.recipes.length} recipes`}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center space-x-2">
                      <DollarSign className="w-4 h-4 text-green-600" />
                      <span className="font-medium text-gray-800">
                        ₦{order.amount.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-blue-600" />
                      <span className="text-gray-600">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {order.delivery && (
                    <div className="flex items-center space-x-2 text-sm">
                      <MapPin className="w-4 h-4 text-blue-600" />
                      <span className="text-gray-600 truncate">
                        {order.delivery.deliveryCity},{" "}
                        {order.delivery.deliveryState}
                      </span>
                    </div>
                  )}
                </div>

                {/* Action Button */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onOrderClick(order);
                    }}
                    className="flex items-center space-x-2 bg-brand-logo_green text-white px-4 py-2 rounded-lg hover:bg-brand-logo_green/90 transition-colors text-sm"
                  >
                    <Eye className="w-4 h-4" />
                    <span>View Details</span>
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg font-medium">
            {searchQuery || statusFilter !== "all"
              ? "No orders found"
              : "No orders yet"}
          </p>
          <p className="text-gray-400 text-sm">
            {searchQuery || statusFilter !== "all"
              ? "Try adjusting your search or filter criteria"
              : "Orders will appear here when customers place them"}
          </p>
        </div>
      )}
    </div>
  );
};

export default OrdersTable;

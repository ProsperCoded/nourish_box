"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Users,
  Search,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  ShoppingCart,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Filter,
  Download,
  Eye,
  Shield,
  AlertTriangle,
} from "lucide-react";
import {
  getPaginatedUsersWithOrderCounts,
  searchUsers,
  getTotalUsersCount,
} from "@/app/utils/firebase/admin.firebase";
import { User } from "@/app/utils/types/user.type";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/app/components/ui/avatar";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { Separator } from "@/app/components/ui/separator";

export type UserWithOrderCount = User & { orderCount: number };

interface UserStatsProps {
  totalUsers: number;
  adminUsers: number;
  regularUsers: number;
  activeUsers: number;
}

const UserStats = ({
  totalUsers,
  adminUsers,
  regularUsers,
  activeUsers,
}: UserStatsProps) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">Total Users</p>
          <p className="text-2xl font-bold text-gray-900">
            {totalUsers.toLocaleString()}
          </p>
        </div>
        <div className="p-3 bg-blue-50 rounded-full">
          <Users className="w-6 h-6 text-blue-600" />
        </div>
      </div>
    </motion.div>

    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">Admin Users</p>
          <p className="text-2xl font-bold text-gray-900">{adminUsers}</p>
        </div>
        <div className="p-3 bg-red-50 rounded-full">
          <Shield className="w-6 h-6 text-red-600" />
        </div>
      </div>
    </motion.div>

    {/* <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">Regular Users</p>
          <p className="text-2xl font-bold text-gray-900">{regularUsers}</p>
        </div>
        <div className="p-3 bg-green-50 rounded-full">
          <UserCheck className="w-6 h-6 text-green-600" />
        </div>
      </div>
    </motion.div> */}

    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">Active Users</p>
          <p className="text-2xl font-bold text-gray-900">{activeUsers}</p>
        </div>
        <div className="p-3 bg-brand-logo_green/10 rounded-full">
          <ShoppingCart className="w-6 h-6 text-brand-logo_green" />
        </div>
      </div>
    </motion.div>
  </div>
);

interface UserCardProps {
  user: UserWithOrderCount;
  onViewUser: (user: UserWithOrderCount) => void;
}

const UserCard = ({ user, onViewUser }: UserCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200"
  >
    <div className="p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <Avatar className="w-12 h-12">
            <AvatarImage src={user.profilePicture} />
            <AvatarFallback className="bg-brand-logo_green/10 text-brand-logo_green">
              {`${user.firstName?.[0] || ""}${
                user.lastName?.[0] || ""
              }`.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold text-gray-900">
              {user.firstName} {user.lastName}
            </h3>
            <div className="flex items-center space-x-2 mt-1">
              <Badge
                variant={user.role === "admin" ? "destructive" : "secondary"}
              >
                {user.role}
              </Badge>
              <Badge variant="outline" className="flex items-center space-x-1">
                <ShoppingCart className="w-3 h-3" />
                <span>{user.orderCount} orders</span>
              </Badge>
            </div>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onViewUser(user)}
          className="text-brand-logo_green hover:text-brand-logo_green hover:bg-brand-logo_green/5"
        >
          <Eye className="w-4 h-4" />
        </Button>
      </div>

      <div className="space-y-2 text-sm text-gray-600">
        <div className="flex items-center space-x-2">
          <Mail className="w-4 h-4" />
          <span className="truncate">{user.email}</span>
        </div>
        <div className="flex items-center space-x-2">
          <Phone className="w-4 h-4" />
          <span>{user.phone}</span>
        </div>
        <div className="flex items-center space-x-2">
          <MapPin className="w-4 h-4" />
          <span className="truncate">
            {user.city}, {user.state}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <Calendar className="w-4 h-4" />
          <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  </motion.div>
);

interface UserModalProps {
  user: UserWithOrderCount;
  isOpen: boolean;
  onClose: () => void;
}

const UserModal = ({ user, isOpen, onClose }: UserModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              User Details
            </h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              ×
            </Button>
          </div>

          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <Avatar className="w-16 h-16">
                <AvatarImage src={user.profilePicture} />
                <AvatarFallback className="bg-brand-logo_green/10 text-brand-logo_green text-lg">
                  {`${user.firstName?.[0] || ""}${
                    user.lastName?.[0] || ""
                  }`.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {user.firstName} {user.lastName}
                </h3>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge
                    variant={
                      user.role === "admin" ? "destructive" : "secondary"
                    }
                  >
                    {user.role}
                  </Badge>
                  <Badge
                    variant="outline"
                    className="flex items-center space-x-1"
                  >
                    <ShoppingCart className="w-3 h-3" />
                    <span>{user.orderCount} total orders</span>
                  </Badge>
                </div>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">
                  Contact Information
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{user.email}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{user.phone}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-3">Location</h4>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      {user.address}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {user.city}, {user.state}
                  </div>
                  <div className="text-sm text-gray-600">LGA: {user.lga}</div>
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h4 className="font-medium text-gray-900 mb-3">
                Account Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Created</p>
                  <p className="text-sm text-gray-900">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Last Updated</p>
                  <p className="text-sm text-gray-900">
                    {new Date(user.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default function UsersPage() {
  const [users, setUsers] = useState<UserWithOrderCount[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserWithOrderCount | null>(
    null
  );
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Search state
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [lastUserId, setLastUserId] = useState<string | undefined>();
  const [totalUsers, setTotalUsers] = useState(0);
  const pageSize = 12;

  // Stats
  const [userStats, setUserStats] = useState<UserStatsProps>({
    totalUsers: 0,
    adminUsers: 0,
    regularUsers: 0,
    activeUsers: 0,
  });

  const fetchUsers = useCallback(
    async (resetToFirstPage = false) => {
      setLoading(true);
      setError(null);
      try {
        const [totalCount, paginationData] = await Promise.all([
          getTotalUsersCount(),
          getPaginatedUsersWithOrderCounts(
            pageSize,
            resetToFirstPage ? undefined : lastUserId
          ),
        ]);

        setTotalUsers(totalCount);
        setUsers(paginationData.users);
        setHasNextPage(paginationData.hasMore);

        if (resetToFirstPage) {
          setCurrentPage(1);
          setLastUserId(paginationData.lastUserId);
        }

        // Calculate stats
        const adminUsers = paginationData.users.filter(
          (user) => user.role === "admin"
        ).length;
        const regularUsers = paginationData.users.filter(
          (user) => user.role === "user"
        ).length;
        const activeUsers = paginationData.users.filter(
          (user) => user.orderCount > 0
        ).length;

        setUserStats({
          totalUsers: totalCount,
          adminUsers,
          regularUsers,
          activeUsers,
        });
      } catch (error) {
        console.error("Error fetching users:", error);
        setError("Failed to load users. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    [lastUserId, pageSize]
  );

  const handleSearch = useCallback(
    async (term: string) => {
      if (!term.trim()) {
        setIsSearching(false);
        fetchUsers(true);
        return;
      }

      setIsSearching(true);
      setLoading(true);
      setError(null);

      try {
        const searchResults = await searchUsers(term);
        setUsers(searchResults);
        setHasNextPage(false);
        setCurrentPage(1);

        // Update stats for search results
        const adminUsers = searchResults.filter(
          (user) => user.role === "admin"
        ).length;
        const regularUsers = searchResults.filter(
          (user) => user.role === "user"
        ).length;
        const activeUsers = searchResults.filter(
          (user) => user.orderCount > 0
        ).length;

        setUserStats({
          totalUsers: searchResults.length,
          adminUsers,
          regularUsers,
          activeUsers,
        });
      } catch (error) {
        console.error("Error searching users:", error);
        setError("Failed to search users. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    [fetchUsers]
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    setSearchTerm("");
    setIsSearching(false);
    try {
      await fetchUsers(true);
    } catch (error) {
      console.error("Error refreshing users:", error);
      setError("Failed to refresh users. Please try again.");
    } finally {
      setRefreshing(false);
    }
  };

  const handleNextPage = async () => {
    if (!hasNextPage || isSearching) return;

    setLoading(true);
    try {
      const paginationData = await getPaginatedUsersWithOrderCounts(
        pageSize,
        lastUserId
      );

      setUsers(paginationData.users);
      setHasNextPage(paginationData.hasMore);
      setLastUserId(paginationData.lastUserId);
      setCurrentPage((prev) => prev + 1);
    } catch (error) {
      console.error("Error fetching next page:", error);
      setError("Failed to load next page. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleViewUser = (user: UserWithOrderCount) => {
    setSelectedUser(user);
    setIsUserModalOpen(true);
  };

  useEffect(() => {
    fetchUsers(true);
  }, []);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      handleSearch(searchTerm);
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm, handleSearch]);

  if (loading && users.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[60vh] w-full bg-gradient-to-br from-white via-gray-50 to-brand-logo_green/10">
        <div className="loader"></div>
        <p className="text-lg font-semibold text-brand-logo_green mt-4">
          Loading Users...
        </p>
      </div>
    );
  }

  if (error && users.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[60vh] w-full bg-gradient-to-br from-white via-gray-50 to-red-50">
        <AlertTriangle size={48} className="text-red-500 mb-4" />
        <p className="text-lg font-semibold text-red-600 mb-2">
          Error Loading Users
        </p>
        <p className="text-gray-600">{error}</p>
        <Button
          onClick={handleRefresh}
          className="mt-4 bg-brand-logo_green text-white hover:bg-brand-logo_green/90"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 px-2 sm:px-4 md:px-8 max-w-full">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
            Users Management
          </h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">
            Manage and monitor all platform users
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            onClick={handleRefresh}
            disabled={refreshing}
            variant="outline"
            className="border-brand-logo_green text-brand-logo_green hover:bg-brand-logo_green hover:text-white"
          >
            <RefreshCw
              className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>
      </motion.div>

      {/* User Stats */}
      <UserStats {...userStats} />

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
      >
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search users by name, email, phone, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-gray-200 focus:border-brand-logo_green focus:ring-brand-logo_green"
            />
          </div>
        </div>
        {isSearching && searchTerm && (
          <p className="mt-2 text-sm text-gray-600">
            Showing search results for "{searchTerm}"
          </p>
        )}
      </motion.div>

      {/* Users Grid */}
      {users.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm ? "No users found" : "No users yet"}
          </h3>
          <p className="text-gray-600">
            {searchTerm
              ? "Try adjusting your search criteria"
              : "Users will appear here once they register"}
          </p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {users.map((user, index) => (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <UserCard user={user} onViewUser={handleViewUser} />
            </motion.div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {!isSearching && users.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-between bg-white rounded-xl shadow-sm border border-gray-100 p-4"
        >
          <div className="text-sm text-gray-600">
            Page {currentPage} • {users.length} users shown
            {totalUsers > 0 && ` of ${totalUsers.toLocaleString()} total`}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              onClick={() => fetchUsers(true)}
              disabled={currentPage === 1 || loading}
              variant="outline"
              size="sm"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </Button>
            <Button
              onClick={handleNextPage}
              disabled={!hasNextPage || loading}
              variant="outline"
              size="sm"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </motion.div>
      )}

      {/* User Modal */}
      {selectedUser && (
        <UserModal
          user={selectedUser}
          isOpen={isUserModalOpen}
          onClose={() => setIsUserModalOpen(false)}
        />
      )}
    </div>
  );
}

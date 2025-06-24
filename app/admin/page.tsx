"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  BookOpen,
  Users,
  ShoppingCart,
  AlertTriangle,
  TrendingUp,
  Heart,
  DollarSign,
} from "lucide-react";
import { Recipe } from "../utils/types/recipe.type";
import { User as UserType } from "../utils/types/user.type";
import { Transaction } from "../utils/types/transaction.type";
import {
  getDashboardStats,
  getRecentRecipes,
  getRecentUsers,
  getRecentTransactions,
  getTopRecipes,
  DashboardStats,
} from "../utils/firebase/admin.firebase";

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  colorClass: string;
  delay?: number;
  prefix?: string;
}

const StatCard = ({
  title,
  value,
  icon,
  colorClass,
  delay = 0,
  prefix = "",
}: StatCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    className={`bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-shadow duration-300 ${colorClass}`}
  >
    <div className="flex items-center justify-between">
      <div className={`p-3 rounded-full bg-opacity-20`}>{icon}</div>
    </div>
    <div className="mt-4">
      <p className="text-3xl font-bold text-gray-800">
        {prefix}
        {typeof value === "number" ? value.toLocaleString() : value}
      </p>
      <p className="text-sm text-gray-600 mt-1">{title}</p>
    </div>
  </motion.div>
);

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalRecipes: 0,
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    totalFavorites: 0,
  });
  const [recentRecipes, setRecentRecipes] = useState<Recipe[]>([]);
  const [recentUsers, setRecentUsers] = useState<UserType[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>(
    []
  );
  const [topRecipes, setTopRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch all data in parallel for better performance
        const [
          dashboardStats,
          recentRecipesData,
          recentUsersData,
          recentTransactionsData,
          topRecipesData,
        ] = await Promise.all([
          getDashboardStats(),
          getRecentRecipes(),
          getRecentUsers(),
          getRecentTransactions(),
          getTopRecipes(),
        ]);

        setStats(dashboardStats);
        setRecentRecipes(recentRecipesData);
        setRecentUsers(recentUsersData);
        setRecentTransactions(recentTransactionsData);
        setTopRecipes(topRecipesData);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setError("Failed to load dashboard data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[60vh] w-full bg-gradient-to-br from-white via-gray-50 to-brand-logo_green/10">
        <div className="loader"></div>
        <p className="text-lg font-semibold text-brand-logo_green mt-4">
          Loading Dashboard...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[60vh] w-full bg-gradient-to-br from-white via-gray-50 to-red-50">
        <AlertTriangle size={48} className="text-red-500 mb-4" />
        <p className="text-lg font-semibold text-red-600 mb-2">
          Error Loading Dashboard
        </p>
        <p className="text-gray-600">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-brand-logo_green text-white rounded-lg hover:bg-brand-logo_green/90"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 px-2 sm:px-4 md:px-8 max-w-full">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
          Welcome back, Admin!
        </h1>
        <p className="text-gray-600 mt-1 text-sm sm:text-base">
          Here's what's happening with Nourish Box today.
        </p>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6">
        <StatCard
          title="Total Recipes"
          value={stats.totalRecipes}
          icon={<BookOpen size={28} className="text-brand-logo_green" />}
          colorClass="bg-brand-logo_green/5"
          delay={0.1}
        />
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          icon={<Users size={28} className="text-brand-btn_orange" />}
          colorClass="bg-brand-btn_orange/5"
          delay={0.2}
        />
        <StatCard
          title="Total Orders"
          value={stats.totalOrders}
          icon={<ShoppingCart size={28} className="text-brand-sub_gray" />}
          colorClass="bg-brand-sub_gray/5"
          delay={0.3}
        />
        <StatCard
          title="Total Revenue"
          value={stats.totalRevenue}
          prefix="₦"
          icon={<DollarSign size={28} className="text-green-600" />}
          colorClass="bg-green-50"
          delay={0.4}
        />
        <StatCard
          title="Total Favorites"
          value={stats.totalFavorites}
          icon={<Heart size={28} className="text-red-500" />}
          colorClass="bg-red-50"
          delay={0.5}
        />
      </div>

      {/* Main Content Area - Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Left Column - Recent Recipes and Top Recipes */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          {/* Recent Recipes */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="bg-white rounded-xl shadow-lg p-4 sm:p-6 hover:shadow-2xl transition-shadow duration-300"
          >
            <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-3 sm:mb-4">
              Recently Added Recipes
            </h3>
            {recentRecipes.length > 0 ? (
              <ul className="space-y-2 sm:space-y-3 max-w-full overflow-x-auto">
                {recentRecipes.map((recipe, index) => (
                  <motion.li
                    key={recipe.id}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.7 + index * 0.1 }}
                  >
                    <div className="flex items-center mb-1 sm:mb-0">
                      <BookOpen
                        size={18}
                        className="mr-2 sm:mr-3 text-brand-logo_green"
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-800 break-words max-w-[160px] sm:max-w-none">
                          {recipe.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          Added on:{" "}
                          {new Date(recipe.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-brand-btn_orange mt-1 sm:mt-0">
                      ₦{recipe.price.toLocaleString()}
                    </span>
                  </motion.li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No recent recipes.</p>
            )}
          </motion.div>

          {/* Top Performing Recipes */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="bg-white rounded-xl shadow-lg p-4 sm:p-6 hover:shadow-2xl transition-shadow duration-300"
          >
            <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-3 sm:mb-4">
              Top Performing Recipes
            </h3>
            {topRecipes.length > 0 ? (
              <ul className="space-y-2 sm:space-y-3">
                {topRecipes.map((recipe, index) => (
                  <motion.li
                    key={recipe.id}
                    className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.8 + index * 0.1 }}
                  >
                    <div className="flex items-center">
                      <TrendingUp
                        size={18}
                        className="mr-2 sm:mr-3 text-green-600"
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-800 break-words max-w-[160px] sm:max-w-none">
                          {recipe.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {recipe.clicks} clicks
                        </p>
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-brand-btn_orange">
                      ₦{recipe.price.toLocaleString()}
                    </span>
                  </motion.li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No recipe data available.</p>
            )}
          </motion.div>
        </div>

        {/* Right Column - Recent Activity and Transactions */}
        <div className="space-y-4 sm:space-y-6">
          {/* Recent User Activity */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="bg-white rounded-xl shadow-lg p-4 sm:p-6 hover:shadow-2xl transition-shadow duration-300"
          >
            <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-3 sm:mb-4">
              Recent User Activity
            </h3>
            {recentUsers.length > 0 ? (
              <ul className="space-y-2 sm:space-y-3 max-w-full overflow-x-auto">
                {recentUsers.map((user, index) => (
                  <motion.li
                    key={user.id}
                    className="flex items-center p-2 sm:p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.9 + index * 0.1 }}
                  >
                    <Users
                      size={18}
                      className="mr-2 sm:mr-3 text-brand-btn_orange"
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-800 break-words max-w-[120px] sm:max-w-none">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-xs text-gray-500">
                        Joined: {new Date(user.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </motion.li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No recent user activity.</p>
            )}
          </motion.div>

          {/* Recent Transactions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.9 }}
            className="bg-white rounded-xl shadow-lg p-4 sm:p-6 hover:shadow-2xl transition-shadow duration-300"
          >
            <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-3 sm:mb-4">
              Recent Transactions
            </h3>
            {recentTransactions.length > 0 ? (
              <ul className="space-y-2 sm:space-y-3">
                {recentTransactions.map((transaction, index) => (
                  <motion.li
                    key={transaction.id || transaction.reference}
                    className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 1.0 + index * 0.1 }}
                  >
                    <div className="flex items-center">
                      <DollarSign
                        size={18}
                        className={`mr-2 sm:mr-3 ${
                          transaction.status === "success"
                            ? "text-green-600"
                            : transaction.status === "failed"
                            ? "text-red-600"
                            : "text-yellow-600"
                        }`}
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-800">
                          ₦{transaction.amount.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(transaction.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded-full font-medium ${
                        transaction.status === "success"
                          ? "bg-green-100 text-green-800"
                          : transaction.status === "failed"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {transaction.status}
                    </span>
                  </motion.li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No recent transactions.</p>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

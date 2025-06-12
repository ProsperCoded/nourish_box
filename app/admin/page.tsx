"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { db } from "../lib/firebase";
import { COLLECTION } from "../utils/schema/collection.enum";
import { Recipe } from "../utils/types/recipe.type";
import { User } from "../utils/types/user.type";
import { motion } from "framer-motion";
import {
  BookOpen,
  Users,
  ShoppingCart,
  BarChart3,
  Activity,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  colorClass: string;
  delay?: number;
}

const StatCard = ({
  title,
  value,
  icon,
  colorClass,
  delay = 0,
}: StatCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    className={`bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-shadow duration-300 ${colorClass}`}
  >
    <div className="flex items-center justify-between">
      <div className={`p-3 rounded-full bg-opacity-20`}>{icon}</div>
      {/* Placeholder for a small trend icon or percentage change */}
      {/* <span className="text-xs font-medium text-green-500">+5%</span> */}
    </div>
    <div className="mt-4">
      <p className="text-3xl font-bold text-gray-800">{value}</p>
      <p className="text-sm text-gray-600 mt-1">{title}</p>
    </div>
  </motion.div>
);

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalRecipes: 0,
    totalUsers: 0,
    totalOrders: 0, // Assuming 'transactions' are orders
  });
  const [recentRecipes, setRecentRecipes] = useState<Recipe[]>([]);
  const [recentUsers, setRecentUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const recipesSnapshot = await getDocs(
          collection(db, COLLECTION.recipes)
        );
        const usersSnapshot = await getDocs(collection(db, COLLECTION.users));
        const ordersSnapshot = await getDocs(
          collection(db, COLLECTION.transactions)
        );

        setStats({
          totalRecipes: recipesSnapshot.size,
          totalUsers: usersSnapshot.size,
          totalOrders: ordersSnapshot.size,
        });

        // Fetch recent recipes
        const recentRecipesQuery = query(
          collection(db, COLLECTION.recipes),
          orderBy("createdAt", "desc"),
          limit(5)
        );
        const recentRecipesSnap = await getDocs(recentRecipesQuery);
        setRecentRecipes(
          recentRecipesSnap.docs.map(
            (doc) => ({ id: doc.id, ...doc.data() } as Recipe)
          )
        );

        // Fetch recent users
        const recentUsersQuery = query(
          collection(db, COLLECTION.users),
          orderBy("createdAt", "desc"),
          limit(5)
        );
        const recentUsersSnap = await getDocs(recentUsersQuery);
        setRecentUsers(
          recentUsersSnap.docs.map(
            (doc) => ({ id: doc.id, ...doc.data() } as User)
          )
        );
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
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
      </div>

      {/* Main Content Area - Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Left Column - Sales Chart and Recent Recipes */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          {/* Placeholder for Sales Chart */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-white rounded-xl shadow-lg p-4 sm:p-6 h-64 sm:h-80 flex flex-col justify-center items-center text-center hover:shadow-2xl transition-shadow duration-300"
          >
            <BarChart3 size={48} className="text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-700">
              Sales Overview
            </h3>
            <p className="text-gray-500 mt-2">Chart coming soon!</p>
            <p className="text-xs text-gray-400 mt-1">
              Detailed sales analytics will be displayed here.
            </p>
          </motion.div>

          {/* Recent Recipes */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
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
                    transition={{ duration: 0.3, delay: 0.6 + index * 0.1 }}
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
                      NGN {recipe.price}
                    </span>
                  </motion.li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No recent recipes.</p>
            )}
          </motion.div>
        </div>

        {/* Right Column - Recent Activity / Notifications */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="bg-white rounded-xl shadow-lg p-4 sm:p-6 space-y-3 sm:space-y-4 h-full hover:shadow-2xl transition-shadow duration-300"
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
                  transition={{ duration: 0.3, delay: 0.7 + index * 0.1 }}
                >
                  <Users
                    size={18}
                    className="mr-2 sm:mr-3 text-brand-btn_orange"
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-800 break-words max-w-[120px] sm:max-w-none">
                      {user.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      Joined on: {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </motion.li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No recent user activity.</p>
          )}

          {/* Placeholder for notifications or alerts */}
          <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-gray-200">
            <h4 className="text-md font-semibold text-gray-600 mb-2 sm:mb-3">
              System Alerts
            </h4>
            <div className="flex items-center p-2 sm:p-3 bg-green-50 text-green-700 rounded-lg">
              <CheckCircle2 size={18} className="mr-2" />
              <p className="text-sm">System operating normally.</p>
            </div>
            {/* Example of an alert - uncomment or modify as needed */}
            {/* 
             <div className="flex items-center p-3 bg-yellow-50 text-yellow-700 rounded-lg mt-2">
                <AlertTriangle size={18} className="mr-2"/>
                <p className="text-sm">Low stock on popular ingredient: Tomatoes</p>
             </div>
              */}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

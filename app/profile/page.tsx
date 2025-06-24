'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useAuth } from '../contexts/AuthContext';

// Page Components
import User_profile from '../components/user_profile';
import Order from '../components/order';
import FavoritesPage from '../favorites/page';
import ContactUs from '../contact_us/page';
import ManageAddress from '../profile/manageAddress/page';

// Icons
import userIcon from '../assets/icons8-user-48.png';
import clockIcon from '../assets/icons8-clock-48.png';
import bookmarkIcon from '../assets/icons8-love-circled-50.png';
import phoneIcon from '../assets/icons8-phone-60.png';
import locationIcon from '../assets/icons8-location-50.png';
import deliveryIcon from '../assets/icons8-delivery-time-48.png';
import backIcon from '../assets/icons8-left-arrow-50.png';

type TabItem = {
  id: string;
  title: string;
  icon: any;
  content: React.ReactNode;
};

const tabs: TabItem[] = [
  { id: '1', title: 'Edit profile', icon: userIcon, content: <User_profile /> },
  { id: '2', title: 'Order History', icon: clockIcon, content: <Order /> },
  { id: '3', title: 'Saved Recipes', icon: bookmarkIcon, content: <FavoritesPage /> },
  { id: '4', title: 'Contact us', icon: phoneIcon, content: <ContactUs /> },
  { id: '5', title: 'Track delivery', icon: deliveryIcon, content: <div className="p-4">Track delivery page</div> },
  {
    id: '6',
    title: 'Manage address',
    icon: locationIcon,
    content: <ManageAddress onBack={() => setActiveTabId(null)} />,
  },
];

export default function Profile() {
  const { user } = useAuth();
  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const activeTab = tabs.find((tab) => tab.id === activeTabId);

  return (
    <div className="bg-white min-h-screen p-4 relative">
      {/* Header */}
      {!activeTabId && (
        <>
          <div className="bg-green-50 rounded-xl p-4 mb-6">
            <h2 className="text-lg font-semibold text-green-800">
              {user?.firstName || 'Wonuola'} {user?.lastName || 'Alonge'}
            </h2>
            <p className="text-sm text-green-700 flex items-center gap-1">
              <span className="text-yellow-500 text-lg">⭐</span> 11
            </p>
          </div>

          {/* Tab List */}
          <div className="space-y-3">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTabId(tab.id)}
                className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 rounded-lg shadow-sm text-left hover:bg-gray-100 transition"
              >
                <div className="flex items-center gap-3">
                  <Image src={tab.icon} alt={tab.title} width={24} height={24} />
                  <span className="text-gray-800 font-medium text-sm">{tab.title}</span>
                </div>
                <span className="text-gray-400">{'>'}</span>
              </button>
            ))}
          </div>
        </>
      )}

      {/* Slide-in Content Panel */}
      <AnimatePresence>
        {activeTab && (
          <motion.div
            key="tabContent"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="absolute top-0 left-0 w-full h-full bg-white z-50 p-4 overflow-y-auto"
          >
            {/* Back Header */}
            <div className="flex items-center gap-3 mb-4">
              <button onClick={() => setActiveTabId(null)} className="p-2">
                <Image src={backIcon} alt="Back" width={24} height={24} />
              </button>
              <h2 className="text-lg font-semibold text-gray-800">{activeTab.title}</h2>
            </div>

            {/* Tab Content */}
            <div>{activeTab.content}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

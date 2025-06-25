'use client';

import { useState } from 'react';

type Order = {
  id: string;
  date: string;
  total: number;
  status: 'Delivered' | 'Pending' | 'Cancelled';
  items: string[];
};

const sampleOrders: Order[] = [
  {
    id: 'ORD001',
    date: '2025-06-20',
    total: 45.99,
    status: 'Delivered',
    items: ['Fried Rice', 'Spicy Chicken', 'Fruit Punch'],
  },
  {
    id: 'ORD002',
    date: '2025-06-18',
    total: 28.75,
    status: 'Pending',
    items: ['Turkey Jollof rice', 'Lemonade'],
  },
  {
    id: 'ORD003',
    date: '2025-06-15',
    total: 33.5,
    status: 'Cancelled',
    items: ['Yam Porridge', 'Chapman'],
  },
];

const statusColor = {
  Delivered: 'text-green-600 bg-green-100',
  Pending: 'text-yellow-600 bg-yellow-100',
  Cancelled: 'text-red-600 bg-red-100',
};

const OrderHistory = () => {
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedOrderId(prev => (prev === id ? null : id));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 lg:p-16">
      <h1 className="text-2xl font-bold mb-6 text-center md:text-left">Order History</h1>

      <div className="space-y-4">
        {sampleOrders.map((order) => (
          <div
            key={order.id}
            className="bg-white shadow-sm rounded-lg p-4 md:p-6 flex flex-col gap-2"
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="text-lg font-semibold text-gray-800">{order.id}</p>
                <p className="text-sm text-gray-500">{order.date}</p>
              </div>
              <div className={`px-3 py-1 text-sm rounded-full font-medium ${statusColor[order.status]}`}>
                {order.status}
              </div>
            </div>

            <div className="flex justify-between items-center text-gray-700">
              <p className="text-base">Total: &#8358;{order.total.toFixed(2)} </p>
              <button
                className="text-blue-600 hover:underline text-sm md:hidden"
                onClick={() => toggleExpand(order.id)}
              >
                {expandedOrderId === order.id ? 'Hide Details' : 'View Details'}
              </button>
            </div>

            {/* Mobile collapsible view */}
            {expandedOrderId === order.id && (
              <div className="md:hidden mt-2 text-sm text-gray-600">
                <p className="font-semibold mb-1">Items:</p>
                <ul className="list-disc pl-5 space-y-1">
                  {order.items.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Desktop view always shows items */}
            <div className="hidden md:block mt-4">
              <p className="font-semibold text-gray-700 mb-2">Items:</p>
              <ul className="list-disc pl-6 text-gray-600">
                {order.items.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrderHistory;

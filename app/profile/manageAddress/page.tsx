'use client';

import { useState } from 'react';
import Image from 'next/image';

import deleteIcon from '../../assets/icons8-trash-can-26.png';

type Address = {
  name: string;
  street: string;
  city: string;
  zip: string;
};

const ManageAddress = () => {
  const [addresses, setAddresses] = useState<Address[]>([
    { name: 'John Doe', street: '123 Main St', city: 'Lagos', zip: '100001' },
  ]);

  const [isEditing, setIsEditing] = useState<number | null>(null);
  const [formData, setFormData] = useState<Address>({
    name: '',
    street: '',
    city: '',
    zip: '',
  });

  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEdit = (index: number) => {
    setIsEditing(index);
    setFormData(addresses[index]);
  };

  const handleDelete = (index: number) => {
    setShowDeleteConfirm(index);
  };

  const confirmDelete = () => {
    if (showDeleteConfirm !== null) {
      const updated = [...addresses];
      updated.splice(showDeleteConfirm, 1);
      setAddresses(updated);
      setShowDeleteConfirm(null);
    }
  };

  const handleSubmit = () => {
    if (isEditing !== null) {
      const updated = [...addresses];
      updated[isEditing] = formData;
      setAddresses(updated);
    } else {
      setAddresses([...addresses, formData]);
    }
    setFormData({ name: '', street: '', city: '', zip: '' });
    setIsEditing(null);
  };

  return (
    <div className="px-4 py-6 md:px-10 lg:px-20 min-h-screen">
   

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Address List */}
        <div className="space-y-4">
          {addresses.map((address, index) => (
            <div key={index} className="border p-4 rounded-md shadow-sm bg-white relative">
              <p className="font-semibold text-lg text-gray-800">{address.name}</p>
              <p className="text-gray-600">{address.street}</p>
              <p className="text-gray-600">{address.city}, {address.zip}</p>

              <div className="absolute top-3 right-3 flex gap-2">
                <button onClick={() => handleEdit(index)} className="hover:scale-105 text-green-900 transition-transform">
                  Edit
                </button>
                <button onClick={() => handleDelete(index)} className="hover:scale-105 transition-transform">
                  <Image src={deleteIcon} alt="Delete" width={20} height={20} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Add/Edit Form */}
        <div className="bg-white shadow-md rounded-md p-6">
          <h3 className="font-semibold text-lg mb-4">
            {isEditing !== null ? 'Edit Address' : 'Add Address'}
          </h3>

          <div className="space-y-3">
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Full Name"
              className="border p-2 w-full rounded"
            />
            <input
              name="street"
              value={formData.street}
              onChange={handleChange}
              placeholder="Street"
              className="border p-2 w-full rounded"
            />
            <input
              name="city"
              value={formData.city}
              onChange={handleChange}
              placeholder="City"
              className="border p-2 w-full rounded"
            />
            <input
              name="zip"
              value={formData.zip}
              onChange={handleChange}
              placeholder="ZIP Code"
              className="border p-2 w-full rounded"
            />
            <button
              onClick={handleSubmit}
              className="bg-green-600 text-white w-full py-2 rounded hover:bg-green-700 transition-colors"
            >
              {isEditing !== null ? 'Update Address' : 'Add Address'}
            </button>
          </div>
        </div>
      </div>

      {/* Delete Modal */}
      {showDeleteConfirm !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-md w-[90%] max-w-sm text-center">
            <p className="text-lg mb-4">Are you sure you want to delete this address?</p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-1 rounded border border-gray-400 text-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-1 rounded bg-red-600 text-white hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageAddress;

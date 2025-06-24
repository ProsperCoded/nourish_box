'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import backIcon from '../assets/icons8-left-arrow-50.png';

type AddressFormProps = {
    onBack: () => void;
    onSubmit?: (address: {
        label: string;
        street: string;
        city: string;
        state: string;
        zip: string;
    }) => void;
};

export default function AddAddressForm({ onBack, onSubmit }: AddressFormProps) {
    const [form, setForm] = useState({
        label: '',
        street: '',
        city: '',
        state: '',
        zip: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (onSubmit) onSubmit(form);
        onBack(); // Return to the previous view
    };

    return (
        <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="absolute top-0 left-0 w-full h-full bg-white z-50 p-4 overflow-y-auto"
        >
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
                <button onClick={onBack} className="p-2">
                    <Image src={backIcon} alt="Back" width={24} height={24} />
                </button>
                <h2 className="text-lg font-semibold text-gray-800">Add New Address</h2>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
                {['label', 'street', 'city', 'state', 'zip'].map((field) => (
                    <div key={field} className="flex flex-col">
                        <label htmlFor={field} className="text-sm font-medium text-gray-700 capitalize">
                            {field}
                        </label>
                        <input
                            type="text"
                            name={field}
                            id={field}
                            value={(form as any)[field]}
                            onChange={handleChange}
                            required
                            className="mt-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400"
                        />
                    </div>
                ))}

                <button
                    type="submit"
                    className="w-full bg-orange-500 text-white py-3 rounded-md font-semibold hover:bg-orange-600 transition"
                >
                    Save Address
                </button>
            </form>
        </motion.div>
    );
}

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
      <div><ReturnButton/><div className='p-4'>
        
    </div></div>
  )
}

export default page
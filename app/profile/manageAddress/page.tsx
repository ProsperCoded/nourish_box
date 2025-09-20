'use client';

import { Edit, MapPin, MoreVertical, Plus, Star, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../../components/ui/alert-dialog';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import { useAuth } from '../../contexts/AuthContext';
import {
  addUserAddress,
  migrateLegacyAddress,
  removeUserAddress,
  setPrimaryAddress,
  updateUserAddress
} from '../../utils/firebase/addresses.firebase';
import { getAvailableLGAs, getAvailableStates } from '../../utils/firebase/delivery-costs.firebase';
import { Address, CreateAddressInput } from '../../utils/types/address.type';


const ManageAddress = () => {
  const { user, refreshAuth } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [states, setStates] = useState<string[]>([]);
  const [lgas, setLgas] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingStates, setLoadingStates] = useState(false);

  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [formData, setFormData] = useState<CreateAddressInput>({
    name: '',
    street: '',
    city: '',
    state: '',
    lga: '',
    isPrimary: false,
  });

  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  // Load user addresses and migrate legacy if needed
  useEffect(() => {
    const loadUserData = async () => {
      if (user) {
        setAddresses(user.addresses || []);

        // Migrate legacy address if needed
        if (user.address && (!user.addresses || user.addresses.length === 0)) {
          try {
            await migrateLegacyAddress(user.id);
            await refreshAuth(); // Refresh to get updated user data
          } catch (error) {
            console.error('Migration error:', error);
          }
        }
      }
    };

    loadUserData();
  }, [user, refreshAuth]);

  // Load states on component mount
  useEffect(() => {
    const loadStates = async () => {
      try {
        setLoadingStates(true);
        const statesData = await getAvailableStates();
        setStates(statesData);
      } catch (error) {
        console.error('Error loading states:', error);
        toast.error('Failed to load available delivery states');
      } finally {
        setLoadingStates(false);
      }
    };

    loadStates();
  }, []);

  // Load LGAs when state changes
  useEffect(() => {
    const loadLGAs = async () => {
      if (formData.state) {
        try {
          const lgasData = await getAvailableLGAs(formData.state);
          setLgas(lgasData);
        } catch (error) {
          console.error('Error loading LGAs:', error);
          toast.error('Failed to load available delivery areas');
        }
      } else {
        setLgas([]);
      }
    };

    loadLGAs();
  }, [formData.state]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEdit = (address: Address) => {
    setIsEditing(address.id);
    setFormData({
      name: address.name,
      street: address.street,
      city: address.city,
      state: address.state,
      lga: address.lga,
      isPrimary: address.isPrimary,
    });
  };

  const handleDelete = (addressId: string) => {
    setShowDeleteConfirm(addressId);
  };

  const confirmDelete = async () => {
    if (!showDeleteConfirm || !user) return;

    try {
      setLoading(true);
      await removeUserAddress(user.id, showDeleteConfirm);
      await refreshAuth();
      setAddresses(prev => prev.filter(addr => addr.id !== showDeleteConfirm));
      setShowDeleteConfirm(null);
      toast.success('Address deleted successfully');
    } catch (error) {
      console.error('Error deleting address:', error);
      toast.error('Failed to delete address');
    } finally {
      setLoading(false);
    }
  };

  const handleSetPrimary = async (addressId: string) => {
    if (!user) return;

    try {
      setLoading(true);
      await setPrimaryAddress(user.id, addressId);
      await refreshAuth();
      setAddresses(prev => prev.map(addr => ({
        ...addr,
        isPrimary: addr.id === addressId
      })));
      toast.success('Primary address updated');
    } catch (error) {
      console.error('Error setting primary address:', error);
      toast.error('Failed to update primary address');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!user) return;

    // Basic validation
    if (!formData.name || !formData.street || !formData.city || !formData.state || !formData.lga) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);

      if (isEditing) {
        await updateUserAddress(user.id, { ...formData, id: isEditing });
        toast.success('Address updated successfully');
      } else {
        await addUserAddress(user.id, formData);
        toast.success('Address added successfully');
      }

      await refreshAuth();
      setAddresses(user.addresses || []);
      setFormData({ name: '', street: '', city: '', state: '', lga: '', isPrimary: false });
      setIsEditing(null);
    } catch (error) {
      console.error('Error saving address:', error);
      toast.error('Failed to save address');
    } finally {
      setLoading(false);
    }
  };

  const cancelEdit = () => {
    setIsEditing(null);
    setFormData({ name: '', street: '', city: '', state: '', lga: '', isPrimary: false });
  };

  if (!user) {
    return (
      <div className="md:px-4 md:py-6 h-full md:min-h-screen">
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">Please log in to manage addresses</p>
        </div>
      </div>
    );
  }

  return (
    <div className="md:px-4 md:py-6 h-full md:min-h-screen font-inter">
      <header className="hidden md:block bg-white shadow-sm mb-6">
        <div className="flex px-4 py-4 sm:px-6 lg:px-8  justify-between items-center">
          <h1 className=" text-3xl font-bold text-gray-900">Manage Address</h1>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Address List */}
        <div className="lg:col-span-2 space-y-4">
          {addresses.length === 0 ? (
            <Card className="p-8 text-center">
              <CardContent className="space-y-4">
                <MapPin className="h-12 w-12 mx-auto text-gray-400" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">No addresses yet</h3>
                  <p className="text-gray-500">Add your first address to get started</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            addresses.map((address) => (
              <Card key={address.id} className="relative hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex flex-col flex-1">
                      <div className="flex items-center gap-2 mb-2 ">
                        <h3 className="font-semibold text-lg  text-gray-900">{address.name}</h3>
                        {address.isPrimary && (
                          <Badge variant="default" className="bg-orange-100 text-orange-800">
                            <Star className="h-3 w-3 mr-1" />
                            Primary
                          </Badge>
                        )}
                      </div>
                      <div className='w-full'>
                        <p className="text-gray-600 mb-1">Street: {address.street}</p>
                        <p className="text-gray-600 mb-1">
                          City: {address.city}, {address.state}
                        </p>
                        <p className=" text-gray-600">LGA: {address.lga}</p>
                      </div>
                    </div>

                    {/* Desktop actions */}
                    <div className="hidden md:flex gap-2">
                      {!address.isPrimary && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSetPrimary(address.id)}
                          disabled={loading}
                          className="text-orange-600 border-orange-600 hover:bg-orange-50"
                        >
                          <Star className="h-4 w-4 mr-1" />
                          Set Primary
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(address)}
                        disabled={loading}
                        className="text-blue-600 border-blue-600 hover:bg-blue-50"
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(address.id)}
                        disabled={loading}
                        className="text-red-600 border-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </div>

                    {/* Mobile dropdown */}
                    <div className="md:hidden">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-5 w-5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {!address.isPrimary && (
                            <DropdownMenuItem
                              onClick={() => handleSetPrimary(address.id)}
                              disabled={loading}
                            >
                              <Star className="h-4 w-4 mr-2 text-orange-600" />
                              Set Primary
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => handleEdit(address)} disabled={loading}>
                            <Edit className="h-4 w-4 mr-2 text-blue-600" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(address.id)}
                            disabled={loading}
                          >
                            <Trash2 className="h-4 w-4 mr-2 text-red-600" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Add/Edit Form */}
        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Plus className="h-5 w-5 text-orange-600" />
                <h3 className="font-semibold text-lg">
                  {isEditing ? 'Edit Address' : 'Add New Address'}
                </h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name <span className='text-red-500'>*</span>
                  </label>
                  <input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter recipient name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Street Address <span className='text-red-500'>*</span>
                  </label>
                  <input
                    name="street"
                    value={formData.street}
                    onChange={handleChange}
                    placeholder="Enter street address"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City <span className='text-red-500'>*</span>
                  </label>
                  <input
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="Enter city"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State <span className='text-red-500'>*</span>
                  </label>
                  <select
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    disabled={loading || loadingStates}
                  >
                    <option value="">Select State</option>
                    {states.map((state) => (
                      <option key={state} value={state}>
                        {state}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    LGA <span className='text-red-500'>*</span>
                  </label>
                  <select
                    name="lga"
                    value={formData.lga}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    disabled={loading || !formData.state}
                  >
                    <option value="">Select LGA</option>
                    {lgas.map((lga) => (
                      <option key={lga} value={lga}>
                        {lga}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isPrimary"
                    name="isPrimary"
                    checked={formData.isPrimary}
                    onChange={(e) => setFormData({ ...formData, isPrimary: e.target.checked })}
                    className="h-4 w-4 text-red-400 focus:ring-red-200 border-gray-300 rounded"
                    disabled={loading}
                  />
                  <label htmlFor="isPrimary" className="ml-2 block text-sm text-gray-900">
                    Set as primary address
                  </label>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="flex-1 bg-orange-600 hover:bg-orange-700 text-white"
                  >
                    {loading ? 'Saving...' : (isEditing ? 'Update Address' : 'Add Address')}
                  </Button>

                  {isEditing && (
                    <Button
                      variant="outline"
                      onClick={cancelEdit}
                      disabled={loading}
                      className="px-4"
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteConfirm !== null} onOpenChange={() => setShowDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Address</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this address? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={loading}
              className="bg-red-600 hover:bg-red-700"
            >
              {loading ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ManageAddress;

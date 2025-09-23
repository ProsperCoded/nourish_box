"use client";

import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { addDeliveryLocation, getAllDeliveryLocations, getAvailableLGAs, getAvailableStates, removeDeliveryLocation, updateDeliveryCost, type DeliveryCostLocation } from "@/app/utils/firebase/delivery-costs.firebase";
import { BusinessRules } from "@/app/utils/types/site-content.type";
import { CircularProgress } from "@mui/material";
import { Calculator, DollarSign, Edit, MapPin, Percent, Plus, Save, ToggleLeft, ToggleRight, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const BusinessRulesPage = () => {
  const [businessRules, setBusinessRules] = useState<BusinessRules | null>(null);
  const [formData, setFormData] = useState<BusinessRules>({
    deliveryFee: 0,
    taxRate: 0,
    taxEnabled: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Delivery costs management state
  const [deliveryLocations, setDeliveryLocations] = useState<DeliveryCostLocation[]>([]);
  const [deliveryStates, setDeliveryStates] = useState<string[]>([]);
  const [deliveryLGAs, setDeliveryLGAs] = useState<string[]>([]);
  const [deliveryLoading, setDeliveryLoading] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Management form state
  const [managementData, setManagementData] = useState({
    state: '',
    lga: '',
    cost: 0,
  });
  const [isCreatingNewState, setIsCreatingNewState] = useState(false);
  const [isCreatingNewLGA, setIsCreatingNewLGA] = useState(false);
  const [managementLoading, setManagementLoading] = useState(false);

  // Fetch current business rules and delivery locations on component mount
  useEffect(() => {
    fetchBusinessRules();
    fetchDeliveryData();
  }, []);

  const fetchBusinessRules = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/business-rules");
      const data = await response.json();

      if (data.status) {
        setBusinessRules(data.data);
        setFormData(data.data);
      } else {
        toast.error("Failed to load business rules");
      }
    } catch (error) {
      console.error("Error fetching business rules:", error);
      toast.error("Failed to load business rules");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof BusinessRules, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      // Validate form data
      if (formData.deliveryFee < 0) {
        toast.error("Delivery fee cannot be negative");
        return;
      }

      if (formData.taxRate < 0 || formData.taxRate > 100) {
        toast.error("Tax rate must be between 0 and 100");
        return;
      }

      const response = await fetch("/api/business-rules", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.status) {
        setBusinessRules(data.data);
        toast.success("Business rules updated successfully", {
          duration: 4000,
          position: "top-center",
          style: {
            background: "#10B981",
            color: "#fff",
            padding: "16px",
            borderRadius: "8px",
          },
        });
      } else {
        toast.error(data.message || "Failed to update business rules");
      }
    } catch (error) {
      console.error("Error updating business rules:", error);
      toast.error("Failed to update business rules");
    } finally {
      setSaving(false);
    }
  };

  const hasChanges = () => {
    if (!businessRules) return false;
    return (
      businessRules.deliveryFee !== formData.deliveryFee ||
      businessRules.taxRate !== formData.taxRate ||
      businessRules.taxEnabled !== formData.taxEnabled
    );
  };

  // Delivery costs management functions
  const fetchDeliveryData = async () => {
    try {
      setDeliveryLoading(true);
      const [locations, states] = await Promise.all([
        getAllDeliveryLocations(),
        getAvailableStates()
      ]);
      setDeliveryLocations(locations);
      setDeliveryStates(states);
    } catch (error) {
      console.error('Error fetching delivery data:', error);
      toast.error('Failed to load delivery locations');
    } finally {
      setDeliveryLoading(false);
    }
  };

  // Management form handlers
  const handleManagementStateChange = async (state: string) => {
    setManagementData(prev => ({ ...prev, state, lga: '', cost: 0 }));
    setIsCreatingNewState(false);

    if (state && deliveryStates.includes(state)) {
      try {
        const lgas = await getAvailableLGAs(state);
        setDeliveryLGAs(lgas);
      } catch (error) {
        console.error('Error fetching LGAs:', error);
        toast.error('Failed to load LGAs');
      }
    } else {
      setDeliveryLGAs([]);
    }
  };

  const handleManagementLGAChange = (lga: string) => {
    setManagementData(prev => ({ ...prev, lga }));
    setIsCreatingNewLGA(false);

    // Auto-populate cost if location exists
    const existingLocation = deliveryLocations.find(
      location => location.state === managementData.state && location.lga === lga
    );

    if (existingLocation) {
      setManagementData(prev => ({ ...prev, cost: existingLocation.cost }));
    }
  };

  const handleAddOrUpdateLocation = async () => {
    if (!managementData.state || !managementData.lga || managementData.cost < 0) {
      toast.error('Please fill in all fields with valid values');
      return;
    }

    // Check if location already exists
    const existingLocation = deliveryLocations.find(
      location => location.state === managementData.state && location.lga === managementData.lga
    );

    try {
      setManagementLoading(true);

      if (existingLocation) {
        // Update existing location
        await updateDeliveryCost(managementData.state, managementData.lga, managementData.cost);
        toast.success('Delivery cost updated successfully');
      } else {
        // Add new location
        await addDeliveryLocation(managementData.state, managementData.lga, managementData.cost);
        toast.success('Delivery location added successfully');
      }

      await fetchDeliveryData();
      setManagementData({ state: '', lga: '', cost: 0 });
      setDeliveryLGAs([]);
    } catch (error) {
      console.error('Error managing location:', error);
      toast.error(existingLocation ? 'Failed to update delivery cost' : 'Failed to add delivery location');
    } finally {
      setManagementLoading(false);
    }
  };

  const handleDeleteLocation = async (location: DeliveryCostLocation) => {
    if (!confirm(`Are you sure you want to remove delivery cost for ${location.lga}, ${location.state}?`)) {
      return;
    }

    try {
      setDeliveryLoading(true);
      await removeDeliveryLocation(location.state, location.lga);
      await fetchDeliveryData();
      toast.success('Delivery location removed successfully');

      // Reset current page if needed
      const totalPages = Math.ceil((deliveryLocations.length - 1) / itemsPerPage);
      if (currentPage > totalPages) {
        setCurrentPage(Math.max(1, totalPages));
      }
    } catch (error) {
      console.error('Error removing location:', error);
      toast.error('Failed to remove delivery location');
    } finally {
      setDeliveryLoading(false);
    }
  };

  // Pagination helpers
  const getCurrentPageData = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return deliveryLocations.slice(startIndex, endIndex);
  };

  const getTotalPages = () => Math.ceil(deliveryLocations.length / itemsPerPage);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, getTotalPages())));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <CircularProgress size={40} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2 bg-orange-100 rounded-lg">
          <Calculator className="h-6 w-6 text-orange-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Business Rules</h1>
          <p className="text-gray-600 mt-1">
            Manage pricing, delivery fees, and tax settings for your platform
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Delivery Fee Settings */}
        <Card className="shadow-sm border-orange-200">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <DollarSign className="h-5 w-5" />
              Delivery Fee
            </CardTitle>
            <CardDescription>
              Set the standard delivery fee charged to customers for all orders
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Delivery Fee (NGN)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                  ₦
                </span>
                <input
                  type="number"
                  min="0"
                  step="50"
                  value={formData.deliveryFee}
                  onChange={(e) => handleInputChange("deliveryFee", parseInt(e.target.value) || 0)}
                  className="w-full pl-8 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-lg font-medium"
                  placeholder="0"
                />
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Current: ₦{formData.deliveryFee.toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Tax Settings */}
        <Card className="shadow-sm border-orange-200">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <Percent className="h-5 w-5" />
              Tax Settings (VAT)
            </CardTitle>
            <CardDescription>
              Configure tax rate and enable/disable tax calculation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Tax Enabled Toggle */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Enable Tax
                </label>
                <p className="text-xs text-gray-500">
                  Turn tax calculation on or off
                </p>
              </div>
              <button
                onClick={() => handleInputChange("taxEnabled", !formData.taxEnabled)}
                className={`p-1 rounded-full transition-colors ${formData.taxEnabled
                  ? "text-green-600 hover:text-green-700"
                  : "text-gray-400 hover:text-gray-500"
                  }`}
              >
                {formData.taxEnabled ? (
                  <ToggleRight className="h-6 w-6" />
                ) : (
                  <ToggleLeft className="h-6 w-6" />
                )}
              </button>
            </div>

            {/* Tax Rate Input */}
            <div className={`transition-opacity ${formData.taxEnabled ? "opacity-100" : "opacity-50"}`}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tax Rate (%)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={formData.taxRate}
                  onChange={(e) => handleInputChange("taxRate", parseFloat(e.target.value) || 0)}
                  disabled={!formData.taxEnabled}
                  className="w-full pr-8 pl-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-lg font-medium disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="7.5"
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                  %
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {formData.taxEnabled
                  ? `Current: ${formData.taxRate}% VAT`
                  : "Tax calculation is disabled"
                }
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Delivery Costs Management */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Management Form */}
        <Card className="shadow-sm border-blue-200">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <MapPin className="h-5 w-5" />
              Manage Delivery Costs
            </CardTitle>
            <CardDescription>
              Add new locations or update existing delivery costs. Auto-detects if location exists.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* State Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                State
              </label>
              <div className="flex gap-2">
                <select
                  value={managementData.state}
                  onChange={(e) => handleManagementStateChange(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select State</option>
                  {deliveryStates.map((state) => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
                </select>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsCreatingNewState(!isCreatingNewState)}
                  className="whitespace-nowrap"
                >
                  {isCreatingNewState ? 'Select Existing' : 'Create New'}
                </Button>
              </div>
              {isCreatingNewState && (
                <input
                  type="text"
                  placeholder="Enter new state name"
                  value={managementData.state}
                  onChange={(e) => setManagementData(prev => ({ ...prev, state: e.target.value, lga: '', cost: 0 }))}
                  className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              )}
            </div>

            {/* LGA Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                LGA
              </label>
              <div className="flex gap-2">
                <select
                  value={managementData.lga}
                  onChange={(e) => handleManagementLGAChange(e.target.value)}
                  disabled={!managementData.state || isCreatingNewState}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                >
                  <option value="">Select LGA</option>
                  {deliveryLGAs.map((lga) => (
                    <option key={lga} value={lga}>
                      {lga}
                    </option>
                  ))}
                </select>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsCreatingNewLGA(!isCreatingNewLGA)}
                  disabled={!managementData.state}
                  className="whitespace-nowrap"
                >
                  {isCreatingNewLGA ? 'Select Existing' : 'Create New'}
                </Button>
              </div>
              {isCreatingNewLGA && (
                <input
                  type="text"
                  placeholder="Enter new LGA name"
                  value={managementData.lga}
                  onChange={(e) => setManagementData(prev => ({ ...prev, lga: e.target.value }))}
                  className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              )}
            </div>

            {/* Cost Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Delivery Cost (NGN)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                  ₦
                </span>
                <input
                  type="number"
                  min="0"
                  step="50"
                  value={managementData.cost}
                  onChange={(e) => setManagementData(prev => ({ ...prev, cost: parseInt(e.target.value) || 0 }))}
                  className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                />
              </div>
              {managementData.state && managementData.lga && (
                <p className="text-sm text-gray-500 mt-1">
                  {deliveryLocations.find(l => l.state === managementData.state && l.lga === managementData.lga)
                    ? 'This location exists - will update the cost'
                    : 'This is a new location - will create new entry'
                  }
                </p>
              )}
            </div>

            {/* Action Button */}
            <Button
              onClick={handleAddOrUpdateLocation}
              disabled={!managementData.state || !managementData.lga || managementData.cost < 0 || managementLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              {managementLoading ? (
                <div className="flex items-center gap-2">
                  <CircularProgress size={16} color="inherit" />
                  Processing...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  {deliveryLocations.find(l => l.state === managementData.state && l.lga === managementData.lga) ? (
                    <>
                      <Edit className="h-4 w-4" />
                      Update Cost
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4" />
                      Add Location
                    </>
                  )}
                </div>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Locations Overview */}
        <Card className="shadow-sm border-green-200">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-green-800">
                  <MapPin className="h-5 w-5" />
                  Locations Overview
                </CardTitle>
                <CardDescription>
                  {deliveryLocations.length} location{deliveryLocations.length !== 1 ? 's' : ''} configured
                </CardDescription>
              </div>
              {getTotalPages() > 1 && (
                <div className="text-sm text-gray-500">
                  Page {currentPage} of {getTotalPages()}
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {deliveryLoading ? (
              <div className="flex items-center justify-center py-8">
                <CircularProgress size={40} />
              </div>
            ) : deliveryLocations.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <MapPin className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No delivery locations configured yet.</p>
                <p className="text-sm">Use the form on the left to add locations.</p>
              </div>
            ) : (
              <>
                {/* Locations List */}
                <div className="space-y-2 mb-4">
                  {getCurrentPageData().map((location) => (
                    <div
                      key={`${location.state}-${location.lga}`}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900">
                          {location.lga}, {location.state}
                        </div>
                        <div className="text-lg font-semibold text-green-600">
                          ₦{location.cost.toLocaleString()}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteLocation(location)}
                        className="text-red-600 border-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {getTotalPages() > 1 && (
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => goToPage(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <div className="flex items-center space-x-2">
                      {Array.from({ length: getTotalPages() }, (_, i) => i + 1)
                        .filter(page => {
                          const distance = Math.abs(page - currentPage);
                          return distance <= 2 || page === 1 || page === getTotalPages();
                        })
                        .map((page, index, array) => {
                          const prevPage = array[index - 1];
                          const showEllipsis = prevPage && page - prevPage > 1;

                          return (
                            <div key={page} className="flex items-center">
                              {showEllipsis && <span className="mx-1 text-gray-400">...</span>}
                              <Button
                                variant={page === currentPage ? "default" : "outline"}
                                size="sm"
                                onClick={() => goToPage(page)}
                                className={page === currentPage ? "bg-blue-600 text-white" : ""}
                              >
                                {page}
                              </Button>
                            </div>
                          );
                        })}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => goToPage(currentPage + 1)}
                      disabled={currentPage === getTotalPages()}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>


      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={saving || !hasChanges()}
          className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3 text-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? (
            <div className="flex items-center gap-2">
              <CircularProgress size={20} color="inherit" />
              Saving...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Save className="h-5 w-5" />
              Save Changes
            </div>
          )}
        </Button>
      </div>
    </div>
  );
};

export default BusinessRulesPage;

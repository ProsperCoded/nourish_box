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
  const [showAddLocationForm, setShowAddLocationForm] = useState(false);
  const [editingLocation, setEditingLocation] = useState<DeliveryCostLocation | null>(null);
  const [newLocationData, setNewLocationData] = useState({
    state: '',
    lga: '',
    cost: 0,
  });

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

  const handleStateChange = async (state: string) => {
    setNewLocationData(prev => ({ ...prev, state, lga: '' }));
    if (state) {
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

  const handleAddLocation = async () => {
    if (!newLocationData.state || !newLocationData.lga || newLocationData.cost < 0) {
      toast.error('Please fill in all fields with valid values');
      return;
    }

    try {
      setDeliveryLoading(true);
      await addDeliveryLocation(newLocationData.state, newLocationData.lga, newLocationData.cost);
      await fetchDeliveryData();
      setNewLocationData({ state: '', lga: '', cost: 0 });
      setShowAddLocationForm(false);
      toast.success('Delivery location added successfully');
    } catch (error) {
      console.error('Error adding location:', error);
      toast.error('Failed to add delivery location');
    } finally {
      setDeliveryLoading(false);
    }
  };

  const handleEditLocation = (location: DeliveryCostLocation) => {
    setEditingLocation(location);
    setNewLocationData({
      state: location.state,
      lga: location.lga,
      cost: location.cost,
    });
  };

  const handleUpdateLocation = async () => {
    if (!editingLocation || newLocationData.cost < 0) {
      toast.error('Please enter a valid cost');
      return;
    }

    try {
      setDeliveryLoading(true);
      await updateDeliveryCost(editingLocation.state, editingLocation.lga, newLocationData.cost);
      await fetchDeliveryData();
      setEditingLocation(null);
      setNewLocationData({ state: '', lga: '', cost: 0 });
      toast.success('Delivery cost updated successfully');
    } catch (error) {
      console.error('Error updating location:', error);
      toast.error('Failed to update delivery cost');
    } finally {
      setDeliveryLoading(false);
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
    } catch (error) {
      console.error('Error removing location:', error);
      toast.error('Failed to remove delivery location');
    } finally {
      setDeliveryLoading(false);
    }
  };

  const cancelLocationOperation = () => {
    setShowAddLocationForm(false);
    setEditingLocation(null);
    setNewLocationData({ state: '', lga: '', cost: 0 });
    setDeliveryLGAs([]);
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
      <Card className="shadow-sm border-blue-200">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-blue-800">
                <MapPin className="h-5 w-5" />
                Dynamic Delivery Costs
              </CardTitle>
              <CardDescription>
                Manage delivery costs for different locations. These will override the standard delivery fee above.
              </CardDescription>
            </div>
            <Button
              onClick={() => setShowAddLocationForm(true)}
              disabled={deliveryLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Location
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {deliveryLoading ? (
            <div className="flex items-center justify-center py-8">
              <CircularProgress size={40} />
            </div>
          ) : (
            <>
              {/* Add/Edit Location Form */}
              {(showAddLocationForm || editingLocation) && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg border-2 border-dashed border-blue-300">
                  <h4 className="font-medium text-gray-900 mb-4">
                    {editingLocation ? 'Edit Delivery Cost' : 'Add New Location'}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        State
                      </label>
                      <select
                        value={newLocationData.state}
                        onChange={(e) => handleStateChange(e.target.value)}
                        disabled={!!editingLocation}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                      >
                        <option value="">Select State</option>
                        {deliveryStates.map((state) => (
                          <option key={state} value={state}>
                            {state}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        LGA
                      </label>
                      <select
                        value={newLocationData.lga}
                        onChange={(e) => setNewLocationData(prev => ({ ...prev, lga: e.target.value }))}
                        disabled={!newLocationData.state || !!editingLocation}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                      >
                        <option value="">Select LGA</option>
                        {deliveryLGAs.map((lga) => (
                          <option key={lga} value={lga}>
                            {lga}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cost (NGN)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="50"
                        value={newLocationData.cost}
                        onChange={(e) => setNewLocationData(prev => ({ ...prev, cost: parseInt(e.target.value) || 0 }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0"
                      />
                    </div>
                    <div className="flex items-end gap-2">
                      <Button
                        onClick={editingLocation ? handleUpdateLocation : handleAddLocation}
                        disabled={!newLocationData.state || !newLocationData.lga}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        {editingLocation ? 'Update' : 'Add'}
                      </Button>
                      <Button
                        onClick={cancelLocationOperation}
                        variant="outline"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Delivery Locations List */}
              <div className="space-y-3">
                {deliveryLocations.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <MapPin className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No delivery locations configured yet.</p>
                    <p className="text-sm">Add locations to set specific delivery costs for different areas.</p>
                  </div>
                ) : (
                  deliveryLocations.map((location, index) => (
                    <div
                      key={`${location.state}-${location.lga}`}
                      className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-shadow"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <div className="text-sm font-medium text-gray-900">
                            {location.lga}, {location.state}
                          </div>
                          <div className="text-lg font-semibold text-blue-600">
                            ₦{location.cost.toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditLocation(location)}
                          className="text-blue-600 border-blue-600 hover:bg-blue-50"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteLocation(location)}
                          className="text-red-600 border-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Preview Section */}
      <Card className="shadow-sm border-green-200 bg-green-50">
        <CardHeader className="pb-4">
          <CardTitle className="text-green-800">Pricing Preview</CardTitle>
          <CardDescription>
            See how these settings affect a sample ₦5,000 order
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-white p-4 rounded-lg border border-green-200">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium">₦5,000</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Delivery Fee:</span>
                <span className="font-medium">₦{formData.deliveryFee.toLocaleString()}</span>
              </div>
              {formData.taxEnabled && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax ({formData.taxRate}%):</span>
                  <span className="font-medium">₦{((5000 * formData.taxRate) / 100).toLocaleString()}</span>
                </div>
              )}
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total:</span>
                  <span className="text-orange-600">
                    ₦{(5000 + formData.deliveryFee + (formData.taxEnabled ? (5000 * formData.taxRate) / 100 : 0)).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

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

import React, { useState, useEffect, useCallback } from 'react';
import { useCustomerAuth } from '../hooks/useCustomerAuth';
import { supabase } from '../integrations/supabaseClient';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Plus, Edit, Trash2, MapPin, Navigation } from 'lucide-react';
import { Badge } from '../components/ui/badge';
import { CustomerAddressRow } from '../types/shared';
import { getCurrentLocation, LocationCoordinates, LocationError } from '../lib/geolocation';
import { reverseGeocode } from '../lib/googleMaps';
import { toast } from '../hooks/use-toast';

interface CustomerAddressesProps {
  onLogout?: () => void;
}

export const CustomerAddresses: React.FC<CustomerAddressesProps> = ({ onLogout }) => {
  const { user } = useCustomerAuth();
  const [addresses, setAddresses] = useState<CustomerAddressRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<CustomerAddressRow | null>(null);
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    house_street: '',
    city: '',
    state: '',
    pincode: '',
    is_default: false
  });

  const fetchAddresses = useCallback(async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('customer_addresses')
        .select('*')
        .eq('customer_id', user.id)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching addresses:', error);
      } else {
        setAddresses(data || []);
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      if (editingAddress) {
        // Update existing address
        const { error } = await supabase
          .from('customer_addresses')
          .update({
            ...formData,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingAddress.id);

        if (error) throw error;
      } else {
        // Create new address
        const { error } = await supabase
          .from('customer_addresses')
          .insert({
            ...formData,
            user_id: user.id
          });

        if (error) throw error;
      }

      setFormData({
        full_name: '',
        phone: '',
        house_street: '',
        city: '',
        state: '',
        pincode: '',
        is_default: false
      });
      setEditingAddress(null);
      setShowForm(false);
      fetchAddresses();
    } catch (error) {
      console.error('Error saving address:', error);
    }
  };

  const handleEdit = (address: CustomerAddressRow) => {
    setEditingAddress(address);
    setFormData({
      full_name: address.full_name || '',
      phone: address.phone || '',
      house_street: address.house_street || '',
      city: address.city || '',
      state: address.state || '',
      pincode: address.pincode || '',
      is_default: address.is_default || false
    });
    setShowForm(true);
  };

  const handleDelete = async (addressId: string) => {
    try {
      const { error } = await supabase
        .from('customer_addresses')
        .delete()
        .eq('id', addressId);

      if (error) throw error;
      
      fetchAddresses();
    } catch (error) {
      console.error('Error deleting address:', error);
    }
  };

  const handleSetDefault = async (addressId: string) => {
    try {
      // First, unset all other addresses as default
      await supabase
        .from('customer_addresses')
        .update({ is_default: false })
        .eq('user_id', user!.id);

      // Then set this address as default
      const { error } = await supabase
        .from('customer_addresses')
        .update({ is_default: true })
        .eq('id', addressId);

      if (error) throw error;

      fetchAddresses();
    } catch (error) {
      console.error('Error setting default address:', error);
    }
  };

  const handleGetCurrentLocation = async () => {
    console.log('handleGetCurrentLocation called');
    try {
      console.log('Calling getCurrentLocation...');
      const locationResult = await getCurrentLocation();

      if ('code' in locationResult) {
        // It's an error
        toast({
          title: "Location Error",
          description: locationResult.userMessage,
          variant: "destructive",
        });
        return;
      }

      // Reverse geocode the coordinates
      const addressComponents = await reverseGeocode(locationResult.latitude, locationResult.longitude);

      if (addressComponents) {
        setFormData(prev => ({
          ...prev,
          house_street: addressComponents.street || '',
          city: addressComponents.city || '',
          state: addressComponents.state || '',
          pincode: addressComponents.postalCode || '',
        }));

        toast({
          title: "Location Found",
          description: "Your current location has been filled in the form.",
        });
      } else {
        toast({
          title: "Address Not Found",
          description: "Could not determine address from your location. Please enter manually.",
          variant: "destructive",
        });
      }
    } catch (error: unknown) {
      console.error('Error getting current location:', error);

      // Check if it's a Google Maps API key error
      if (error instanceof Error && error.message && error.message.includes('Google Maps API key not found')) {
        toast({
          title: "Configuration Error",
          description: "Google Maps API key is not configured. Please contact support.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Location Error",
          description: "Failed to get your current location. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Addresses</h1>
          <p className="text-gray-600">Manage your delivery addresses</p>
        </div>
        <Button onClick={() => {
          setEditingAddress(null);
          setFormData({
            full_name: '',
            phone: '',
            house_street: '',
            city: '',
            state: '',
            pincode: '',
            is_default: false
          });
          setShowForm(true);
        }} className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Add Address</span>
        </Button>
      </div>

      {/* Address Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingAddress ? 'Edit Address' : 'Add New Address'}</CardTitle>
            <CardDescription>
              {editingAddress ? 'Update your address details' : 'Add a new delivery address'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="house_street">House/Street</Label>
                  <Input
                    id="house_street"
                    name="house_street"
                    value={formData.house_street}
                    onChange={handleInputChange}
                    placeholder="123 Main Street"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="Mumbai"
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    placeholder="Maharashtra"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pincode">Pincode</Label>
                  <Input
                    id="pincode"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleInputChange}
                    placeholder="400001"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-center">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleGetCurrentLocation}
                  className="flex items-center space-x-2"
                >
                  <Navigation className="h-4 w-4" />
                  <span>Use Current Location</span>
                </Button>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_default"
                  name="is_default"
                  checked={formData.is_default}
                  onChange={handleInputChange}
                />
                <Label htmlFor="is_default">Set as default address</Label>
              </div>

              <div className="flex space-x-2">
                <Button type="submit">
                  {editingAddress ? 'Update Address' : 'Save Address'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    setEditingAddress(null);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Addresses List */}
      <div className="grid gap-6">
        {addresses.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No addresses saved yet. Add your first address to get started.</p>
            </CardContent>
          </Card>
        ) : (
          addresses.map((address) => (
            <Card key={address.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <MapPin className="h-5 w-5 text-gray-500" />
                      <h3 className="font-semibold">
                        {address.house_street}, {address.city}
                      </h3>
                      {address.is_default && (
                        <Badge variant="secondary">Default</Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">
                      {address.house_street}, {address.city}, {address.state} {address.pincode}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    {!address.is_default && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSetDefault(address.id)}
                      >
                        Set Default
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(address)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(address.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default CustomerAddresses;
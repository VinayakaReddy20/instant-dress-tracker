import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../integrations/supabaseClient';
import { useCustomerAuth } from '../../hooks/useCustomerAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { toast } from '../ui/use-toast';
import { MapPin, Plus, Edit, Trash2, Star } from 'lucide-react';

interface Address {
  id: string;
  user_id: string;
  full_name: string;
  phone: string;
  house_street: string;
  city: string;
  state: string;
  pincode: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export const AddressManagement: React.FC = () => {
  const { user } = useCustomerAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    house_street: '',
    city: '',
    state: '',
    pincode: '',
    is_default: false,
  });

  const fetchAddresses = useCallback(async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('customer_addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAddresses(data || []);
    } catch (error: unknown) {
      console.error('Error fetching addresses:', error);
      toast({
        title: "Error",
        description: "Failed to load addresses.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setFormData({
      full_name: '',
      phone: '',
      house_street: '',
      city: '',
      state: '',
      pincode: '',
      is_default: false,
    });
    setEditingAddress(null);
  };

  const openAddDialog = () => {
    resetForm();
    setDialogOpen(true);
  };

  const openEditDialog = (address: Address) => {
    setFormData({
      full_name: address.full_name,
      phone: address.phone,
      house_street: address.house_street,
      city: address.city,
      state: address.state,
      pincode: address.pincode,
      is_default: address.is_default,
    });
    setEditingAddress(address);
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      if (formData.is_default) {
        // Remove default from other addresses
        await supabase
          .from('customer_addresses')
          .update({ is_default: false })
          .eq('user_id', user.id);
      }

      const addressData = {
        ...formData,
        user_id: user.id,
        updated_at: new Date().toISOString(),
      };

      if (editingAddress) {
        // Update existing address
        const { error } = await supabase
          .from('customer_addresses')
          .update(addressData)
          .eq('id', editingAddress.id);

        if (error) throw error;
        toast({
          title: "Address updated",
          description: "Your address has been updated successfully.",
        });
      } else {
        // Create new address
        const { error } = await supabase
          .from('customer_addresses')
          .insert(addressData);

        if (error) throw error;
        toast({
          title: "Address added",
          description: "Your address has been added successfully.",
        });
      }

      setDialogOpen(false);
      resetForm();
      fetchAddresses();
    } catch (error: unknown) {
      console.error('Error saving address:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save address.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (addressId: string) => {
    if (!confirm('Are you sure you want to delete this address?')) return;

    try {
      const { error } = await supabase
        .from('customer_addresses')
        .delete()
        .eq('id', addressId);

      if (error) throw error;

      toast({
        title: "Address deleted",
        description: "Your address has been deleted successfully.",
      });
      fetchAddresses();
    } catch (error: unknown) {
      console.error('Error deleting address:', error);
      toast({
        title: "Error",
        description: "Failed to delete address.",
        variant: "destructive",
      });
    }
  };

  if (loading && addresses.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="h-5 w-5" />
                <span>Delivery Addresses</span>
              </CardTitle>
              <CardDescription>
                Manage your delivery addresses for faster checkout.
              </CardDescription>
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={openAddDialog}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Address
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <form onSubmit={handleSubmit}>
                  <DialogHeader>
                    <DialogTitle>
                      {editingAddress ? 'Edit Address' : 'Add New Address'}
                    </DialogTitle>
                    <DialogDescription>
                      Enter the delivery address details below.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="full_name">Full Name</Label>
                        <Input
                          id="full_name"
                          value={formData.full_name}
                          onChange={(e) => handleInputChange('full_name', e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="house_street">House / Street Address</Label>
                      <Input
                        id="house_street"
                        value={formData.house_street}
                        onChange={(e) => handleInputChange('house_street', e.target.value)}
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="city">City</Label>
                        <Input
                          id="city"
                          value={formData.city}
                          onChange={(e) => handleInputChange('city', e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="state">State</Label>
                        <Input
                          id="state"
                          value={formData.state}
                          onChange={(e) => handleInputChange('state', e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="pincode">Pincode</Label>
                        <Input
                          id="pincode"
                          value={formData.pincode}
                          onChange={(e) => handleInputChange('pincode', e.target.value)}
                          required
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="is_default"
                          checked={formData.is_default}
                          onChange={(e) => handleInputChange('is_default', e.target.checked)}
                        />
                        <Label htmlFor="is_default">Set as default address</Label>
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={loading}>
                      {loading ? 'Saving...' : editingAddress ? 'Update' : 'Add'} Address
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {addresses.length === 0 ? (
            <div className="text-center py-8">
              <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">No addresses added yet.</p>
              <Button onClick={openAddDialog}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Address
              </Button>
            </div>
          ) : (
            <div className="grid gap-4">
              {addresses.map((address) => (
                <Card key={address.id} className={`relative ${address.is_default ? 'border-primary' : ''}`}>
                  {address.is_default && (
                    <div className="absolute top-2 right-2">
                      <Star className="h-5 w-5 text-primary fill-current" />
                    </div>
                  )}
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <p className="font-medium">{address.full_name}</p>
                        <p className="text-sm text-gray-600">{address.phone}</p>
                        <p className="text-sm text-gray-600">
                          {address.house_street}, {address.city}, {address.state} - {address.pincode}
                        </p>
                        {address.is_default && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-primary/10 text-primary">
                            Default Address
                          </span>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(address)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(address.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

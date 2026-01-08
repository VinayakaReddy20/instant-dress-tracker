import React, { useState, useEffect, useCallback } from 'react';
import { useCustomerAuth } from '../hooks/useCustomerAuth';
import { supabase } from '../integrations/supabaseClient';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Switch } from '../components/ui/switch';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { 
  Heart, 
  Star, 
  Ruler, 
  Palette, 
  ShoppingBag, 
  Bell, 
  Settings, 
  Save 
} from 'lucide-react';

interface CustomerPreferencesProps {
  onLogout?: () => void;
}

interface CustomerPreferences {
  preferred_sizes: string[];
  favorite_colors: string[];
  style_preferences: string[];
  budget_range: string;
  notification_preferences: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
  size_notes: string;
  color_notes: string;
  style_notes: string;
}

export const CustomerPreferences: React.FC<CustomerPreferencesProps> = ({ onLogout }) => {
  const { user } = useCustomerAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [preferences, setPreferences] = useState<CustomerPreferences>({
    preferred_sizes: [],
    favorite_colors: [],
    style_preferences: [],
    budget_range: 'medium',
    notification_preferences: {
      email: true,
      sms: false,
      push: true
    },
    size_notes: '',
    color_notes: '',
    style_notes: ''
  });

  const fetchPreferences = useCallback(async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('customer_preferences')
        .select('*')
        .eq('customer_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching preferences:', error);
      } else if (data) {
        setPreferences({
          preferred_sizes: data.preferred_sizes || [],
          favorite_colors: data.favorite_colors || [],
          style_preferences: data.style_preferences || [],
          budget_range: data.budget_range || 'medium',
          notification_preferences: (data.notification_preferences as { email: boolean; sms: boolean; push: boolean }) || {
            email: true,
            sms: false,
            push: true
          },
          size_notes: data.size_notes || '',
          color_notes: data.color_notes || '',
          style_notes: data.style_notes || ''
        });
      }
    } catch (error) {
      console.error('Error fetching preferences:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchPreferences();
  }, [fetchPreferences]);

  const handlePreferenceChange = (field: keyof CustomerPreferences, value: string | string[] | { [key: string]: boolean } | string) => {
    setPreferences(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNotificationChange = (type: string, value: boolean) => {
    setPreferences(prev => ({
      ...prev,
      notification_preferences: {
        ...prev.notification_preferences,
        [type]: value
      }
    }));
  };

  const handleSave = async () => {
    if (!user) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from('customer_preferences')
        .upsert({
          customer_id: user.id,
          preferred_sizes: preferences.preferred_sizes,
          favorite_colors: preferences.favorite_colors,
          style_preferences: preferences.style_preferences,
          budget_range: preferences.budget_range,
          notification_preferences: preferences.notification_preferences,
          size_notes: preferences.size_notes,
          color_notes: preferences.color_notes,
          style_notes: preferences.style_notes,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'customer_id'
        });

      if (error) throw error;
      
      // Show success message
      console.log('Preferences saved successfully');
    } catch (error) {
      console.error('Error saving preferences:', error);
    } finally {
      setSaving(false);
    }
  };

  const sizeOptions = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  const colorOptions = ['Black', 'White', 'Blue', 'Red', 'Green', 'Yellow', 'Pink', 'Purple', 'Orange', 'Brown', 'Gray'];
  const styleOptions = ['Casual', 'Formal', 'Party', 'Bohemian', 'Vintage', 'Modern', 'Traditional', 'Sporty'];

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
          <h1 className="text-2xl font-bold text-gray-900">Preferences</h1>
          <p className="text-gray-600">Customize your shopping experience</p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="flex items-center space-x-2">
          <Save className="h-4 w-4" />
          <span>{saving ? 'Saving...' : 'Save Preferences'}</span>
        </Button>
      </div>

      {/* Size Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Ruler className="h-5 w-5" />
            <span>Size Preferences</span>
          </CardTitle>
          <CardDescription>
            Tell us your preferred sizes for better recommendations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
            {sizeOptions.map(size => (
              <Button
                key={size}
                variant={preferences.preferred_sizes.includes(size) ? "default" : "outline"}
                onClick={() => {
                  const newSizes = preferences.preferred_sizes.includes(size)
                    ? preferences.preferred_sizes.filter(s => s !== size)
                    : [...preferences.preferred_sizes, size];
                  handlePreferenceChange('preferred_sizes', newSizes);
                }}
                className="capitalize"
              >
                {size}
              </Button>
            ))}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="size_notes">Size Notes</Label>
            <Textarea
              id="size_notes"
              value={preferences.size_notes}
              onChange={(e) => handlePreferenceChange('size_notes', e.target.value)}
              placeholder="Any specific size requirements or notes..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Color Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Palette className="h-5 w-5" />
            <span>Color Preferences</span>
          </CardTitle>
          <CardDescription>
            Select your favorite colors to see more relevant items
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {colorOptions.map(color => (
              <Button
                key={color}
                variant={preferences.favorite_colors.includes(color) ? "default" : "outline"}
                onClick={() => {
                  const newColors = preferences.favorite_colors.includes(color)
                    ? preferences.favorite_colors.filter(c => c !== color)
                    : [...preferences.favorite_colors, color];
                  handlePreferenceChange('favorite_colors', newColors);
                }}
                className="capitalize"
              >
                {color}
              </Button>
            ))}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="color_notes">Color Notes</Label>
            <Textarea
              id="color_notes"
              value={preferences.color_notes}
              onChange={(e) => handlePreferenceChange('color_notes', e.target.value)}
              placeholder="Any color preferences or aversions..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Style Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <ShoppingBag className="h-5 w-5" />
            <span>Style Preferences</span>
          </CardTitle>
          <CardDescription>
            Choose your preferred styles for personalized recommendations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {styleOptions.map(style => (
              <Button
                key={style}
                variant={preferences.style_preferences.includes(style) ? "default" : "outline"}
                onClick={() => {
                  const newStyles = preferences.style_preferences.includes(style)
                    ? preferences.style_preferences.filter(s => s !== style)
                    : [...preferences.style_preferences, style];
                  handlePreferenceChange('style_preferences', newStyles);
                }}
                className="capitalize"
              >
                {style}
              </Button>
            ))}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="style_notes">Style Notes</Label>
            <Textarea
              id="style_notes"
              value={preferences.style_notes}
              onChange={(e) => handlePreferenceChange('style_notes', e.target.value)}
              placeholder="Any specific style preferences or occasions..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Budget Range */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Star className="h-5 w-5" />
            <span>Budget Preferences</span>
          </CardTitle>
          <CardDescription>
            Set your budget range for better price filtering
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="budget_range">Budget Range</Label>
              <Select
                value={preferences.budget_range}
                onValueChange={(value) => handlePreferenceChange('budget_range', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select budget range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Budget Friendly</SelectItem>
                  <SelectItem value="medium">Mid Range</SelectItem>
                  <SelectItem value="high">Premium</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bell className="h-5 w-5" />
            <span>Notification Preferences</span>
          </CardTitle>
          <CardDescription>
            Control how you receive notifications about new arrivals and offers
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium">Email Notifications</Label>
              <p className="text-sm text-gray-500">
                Get emails about new arrivals, sales, and recommendations
              </p>
            </div>
            <Switch
              checked={preferences.notification_preferences.email}
              onCheckedChange={(checked) => handleNotificationChange('email', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium">SMS Notifications</Label>
              <p className="text-sm text-gray-500">
                Receive text messages for order updates and special offers
              </p>
            </div>
            <Switch
              checked={preferences.notification_preferences.sms}
              onCheckedChange={(checked) => handleNotificationChange('sms', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium">Push Notifications</Label>
              <p className="text-sm text-gray-500">
                Get browser notifications for new arrivals and promotions
              </p>
            </div>
            <Switch
              checked={preferences.notification_preferences.push}
              onCheckedChange={(checked) => handleNotificationChange('push', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Save Actions */}
      <div className="flex justify-end space-x-3">
        <Button variant="outline" onClick={fetchPreferences}>
          Reset to Defaults
        </Button>
        <Button onClick={handleSave} disabled={saving} className="flex items-center space-x-2">
          <Save className="h-4 w-4" />
          <span>{saving ? 'Saving...' : 'Save Preferences'}</span>
        </Button>
      </div>
    </div>
  );
};

export default CustomerPreferences;
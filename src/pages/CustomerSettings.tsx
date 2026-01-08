import React, { useState } from 'react';
import { useCustomerAuth } from '../hooks/useCustomerAuth';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Switch } from '../components/ui/switch';
import { Badge } from '../components/ui/badge';
import { Mail, Lock, Bell, Shield, Trash2, Eye, EyeOff } from 'lucide-react';

interface CustomerSettingsProps {
  onLogout: () => void;
}

export const CustomerSettings: React.FC<CustomerSettingsProps> = ({ onLogout }) => {
  const { user } = useCustomerAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [marketingEmails, setMarketingEmails] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleEmailUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    // Email update functionality would go here
    console.log('Email update requested');
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    // Password update functionality would go here
    console.log('Password update requested');
  };

  const handleNotificationToggle = async (type: string, enabled: boolean) => {
    // Notification settings update would go here
    console.log(`Notification ${type} set to ${enabled}`);
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      // Account deletion would go here
      console.log('Account deletion requested');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Account Settings</h1>
        <p className="text-gray-600">Manage your account preferences and security settings</p>
      </div>

      {/* Account Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Account Information</span>
          </CardTitle>
          <CardDescription>
            Update your account details and manage your profile
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="flex space-x-2">
                <Input
                  id="email"
                  value={user?.email || ''}
                  disabled
                  className="bg-gray-100"
                />
                <Button variant="outline" disabled>
                  Update Email
                </Button>
              </div>
              <p className="text-sm text-gray-500">
                Email updates are currently disabled in this version
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <form onSubmit={handlePasswordUpdate} className="flex space-x-2">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  disabled
                  className="bg-gray-100"
                />
                <Button variant="outline" disabled>
                  Update Password
                </Button>
              </form>
              <p className="text-sm text-gray-500">
                Password updates are currently disabled in this version
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bell className="h-5 w-5" />
            <span>Notification Preferences</span>
          </CardTitle>
          <CardDescription>
            Control how you receive notifications from our platform
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium">Email Notifications</Label>
              <p className="text-sm text-gray-500">
                Receive notifications about your orders and account activity
              </p>
            </div>
            <Switch
              checked={emailNotifications}
              onCheckedChange={(checked) => {
                setEmailNotifications(checked);
                handleNotificationToggle('email', checked);
              }}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium">SMS Notifications</Label>
              <p className="text-sm text-gray-500">
                Receive text messages for order updates and promotions
              </p>
            </div>
            <Switch
              checked={smsNotifications}
              onCheckedChange={(checked) => {
                setSmsNotifications(checked);
                handleNotificationToggle('sms', checked);
              }}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium">Marketing Emails</Label>
              <p className="text-sm text-gray-500">
                Receive promotional emails and special offers
              </p>
            </div>
            <Switch
              checked={marketingEmails}
              onCheckedChange={(checked) => {
                setMarketingEmails(checked);
                handleNotificationToggle('marketing', checked);
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Account Status */}
      <Card>
        <CardHeader>
          <CardTitle>Account Status</CardTitle>
          <CardDescription>
            View your account verification status and security information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-3">
            <Badge variant="secondary" className="flex items-center space-x-1">
              <Shield className="h-3 w-3" />
              <span>Verified</span>
            </Badge>
            <span className="text-sm text-gray-600">
              Your email address has been verified
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Member since</span>
              <p className="font-medium">
                {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown'}
              </p>
            </div>
            <div>
              <span className="text-gray-500">Last login</span>
              <p className="font-medium">Recent</p>
            </div>
            <div>
              <span className="text-gray-500">Account type</span>
              <p className="font-medium">Customer</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-red-600">
            <Trash2 className="h-5 w-5" />
            <span>Account Actions</span>
          </CardTitle>
          <CardDescription>
            Manage your account or delete it permanently
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              onClick={onLogout}
              className="flex items-center space-x-2"
            >
              <Lock className="h-4 w-4" />
              <span>Logout</span>
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
              className="flex items-center space-x-2"
            >
              <Trash2 className="h-4 w-4" />
              <span>Delete Account</span>
            </Button>
          </div>
          <p className="text-sm text-gray-500">
            Deleting your account will permanently remove all your data including orders, addresses, and preferences.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomerSettings;
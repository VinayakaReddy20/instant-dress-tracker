import React, { useState } from 'react';
import { supabase } from '../../integrations/supabaseClient';
import { useCustomerAuth } from '../../hooks/useCustomerAuth';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '../../components/ui/alert';
import { LogOut, Shield, Mail, Key, Trash2 } from 'lucide-react';
import { toast } from '../../components/ui/use-toast';

interface SettingsSectionProps {
  onLogout: () => void;
}

export const SettingsSection: React.FC<SettingsSectionProps> = ({ onLogout }) => {
  const { user } = useCustomerAuth();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleDeleteAccount = async () => {
    if (!user) return;

    try {
      setIsDeleting(true);

      // Delete customer data
      const { error: customerError } = await supabase
        .from('customers')
        .delete()
        .eq('user_id', user.id);

      if (customerError) {
        throw customerError;
      }

      // Delete cart items
      const { error: cartError } = await supabase
        .from('customer_addresses')
        .delete()
        .eq('user_id', user.id);

      if (cartError) {
        throw cartError;
      }

      // Delete addresses
      const { error: addressError } = await supabase
        .from('customer_addresses')
        .delete()
        .eq('user_id', user.id);

      if (addressError) {
        throw addressError;
      }

      // Delete user account
      const { error: authError } = await supabase.auth.admin.deleteUser(user.id);

      if (authError) {
        throw authError;
      }

      toast({
        title: "Account Deleted",
        description: "Your account has been successfully deleted.",
      });

      // Sign out after deletion
      await onLogout();
    } catch (error) {
      console.error('Error deleting account:', error);
      toast({
        title: "Deletion Error",
        description: "Failed to delete account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true);
      await onLogout();
      toast({
        title: "Signed Out",
        description: "You have been signed out successfully.",
      });
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        title: "Sign Out Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Account Settings</CardTitle>
          <CardDescription>
            Manage your account preferences and security settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Email Address</h3>
              <p className="text-sm text-gray-600">{user?.email}</p>
            </div>
            <Button variant="outline" size="sm">
              <Mail className="h-4 w-4 mr-2" />
              Update Email
            </Button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Password</h3>
              <p className="text-sm text-gray-600">Last updated recently</p>
            </div>
            <Button variant="outline" size="sm">
              <Key className="h-4 w-4 mr-2" />
              Change Password
            </Button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Security</h3>
              <p className="text-sm text-gray-600">Two-factor authentication enabled</p>
            </div>
            <Button variant="outline" size="sm">
              <Shield className="h-4 w-4 mr-2" />
              Security Settings
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Danger Zone</CardTitle>
          <CardDescription>
            These actions are irreversible. Please proceed with caution.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <AlertTitle>Sign Out</AlertTitle>
            <AlertDescription>
              Sign out from all devices and clear your session data.
            </AlertDescription>
          </Alert>
          <div className="flex justify-end">
            <Button
              variant="destructive"
              onClick={handleSignOut}
              disabled={isSigningOut}
              className="flex items-center space-x-2"
            >
              <LogOut className="h-4 w-4" />
              <span>{isSigningOut ? 'Signing Out...' : 'Sign Out'}</span>
            </Button>
          </div>

          <Alert variant="destructive">
            <AlertTitle>Delete Account</AlertTitle>
            <AlertDescription>
              This will permanently delete your account, all your data, and cannot be recovered.
            </AlertDescription>
          </Alert>
          <div className="flex justify-end">
            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
              disabled={isDeleting}
              className="flex items-center space-x-2"
            >
              <Trash2 className="h-4 w-4" />
              <span>{isDeleting ? 'Deleting...' : 'Delete Account'}</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
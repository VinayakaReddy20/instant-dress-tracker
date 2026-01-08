import React, { useState } from 'react';
import { supabase } from '../../integrations/supabaseClient';
import { Tables } from '../../types';
import { useCustomerAuth } from '../../hooks/useCustomerAuth';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Camera, Edit2, Save, X } from 'lucide-react';
import { toast } from '../../components/ui/use-toast';

interface ProfileDetailsProps {
  customerData: Tables<'customers'> | null;
  onUpdate: () => void;
}

export const ProfileDetails: React.FC<ProfileDetailsProps> = ({ customerData, onUpdate }) => {
  const { user } = useCustomerAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: customerData?.full_name || '',
    phone: customerData?.phone || '',
    email: user?.email || '',
    gender: customerData?.gender || '',
    profile_image_url: customerData?.profile_image_url || ''
  });
  const [isUpdating, setIsUpdating] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAvatarFile(e.target.files[0]);
    }
  };

  const uploadAvatar = async (): Promise<string | null> => {
    if (!avatarFile) return null;

    try {
      const fileExt = avatarFile.name.split('.').pop();
      const fileName = `${user?.id || ''}-${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, avatarFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        throw uploadError;
      }

      const { data: publicUrlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      return publicUrlData.publicUrl;
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast({
        title: "Upload Error",
        description: "Failed to upload profile picture. Please try again.",
        variant: "destructive",
      });
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);

    try {
      let avatarUrl = formData.profile_image_url;

      // Upload new avatar if selected
      if (avatarFile) {
        const uploadedUrl = await uploadAvatar();
        if (uploadedUrl) {
          avatarUrl = uploadedUrl;
        }
      }

      const { error } = await supabase
        .from('customers')
        .upsert({
          full_name: formData.full_name,
          phone: formData.phone,
          gender: formData.gender,
          profile_image_url: avatarUrl,
          user_id: user?.id || '',
          email: user?.email || ''
        }, {
          onConflict: 'user_id'
        });

      if (error) {
        throw error;
      }

      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });

      setIsEditing(false);
      onUpdate();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Update Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      full_name: customerData?.full_name || '',
      phone: customerData?.phone || '',
      email: user?.email || '',
      gender: customerData?.gender || '',
      profile_image_url: customerData?.profile_image_url || ''
    });
    setAvatarFile(null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Information</CardTitle>
        <CardDescription>
          Update your personal information and profile picture
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex items-center space-x-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={formData.profile_image_url} />
              <AvatarFallback>
                {formData.full_name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {isEditing && (
              <div className="flex items-center space-x-2">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="avatar-upload"
                />
                <Label htmlFor="avatar-upload" className="cursor-pointer">
                  <Camera className="h-5 w-5 text-gray-500 hover:text-gray-700" />
                </Label>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name</Label>
              <Input
                id="full_name"
                name="full_name"
                value={formData.full_name}
                onChange={handleInputChange}
                disabled={!isEditing}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                disabled
                className="bg-gray-100 cursor-not-allowed"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleInputChange}
                disabled={!isEditing}
                placeholder="Enter your phone number"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <Input
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                disabled={!isEditing}
                placeholder="Enter your gender"
              />
            </div>
          </div>

          <div className="flex justify-between">
            {!isEditing ? (
              <Button
                type="button"
                onClick={() => setIsEditing(true)}
                className="flex items-center space-x-2"
              >
                <Edit2 className="h-4 w-4" />
                <span>Edit Profile</span>
              </Button>
            ) : (
              <div className="flex space-x-2">
                <Button
                  type="submit"
                  disabled={isUpdating}
                  className="flex items-center space-x-2"
                >
                  <Save className="h-4 w-4" />
                  <span>{isUpdating ? 'Updating...' : 'Save Changes'}</span>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isUpdating}
                  className="flex items-center space-x-2"
                >
                  <X className="h-4 w-4" />
                  <span>Cancel</span>
                </Button>
              </div>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
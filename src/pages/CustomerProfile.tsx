import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabaseClient";
import { useCustomerAuth } from "@/hooks/useCustomerAuth";
import Navbar from "@/components/Navbar";
import { getCurrentLocation, reverseGeocodeWithFallback, getCurrentLocationWithAccuracy, isLocationAccurate, getAccuracyDescription } from "@/lib/geolocation";
import { customerProfileSchema, changePasswordSchema, type CustomerProfileFormData, type ChangePasswordFormData } from "@/lib/validations";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  LogOut,
  Trash2,
  Edit,
  Save,
  X,
  MapPinIcon,
} from "lucide-react";

interface CustomerProfile {
  id: string;
  user_id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  created_at: string;
  updated_at: string;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
}

export default function CustomerProfile() {
  const { user, signOut } = useCustomerAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    address: "",
  });
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    current: "",
    new: "",
    confirm: "",
  });
  const [enablingLocation, setEnablingLocation] = useState(false);
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Fetch customer profile
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from("customers")
          .select("id, user_id, email, full_name, phone, created_at, updated_at, address, latitude, longitude")
          .eq("user_id", user.id)
          .single();

        if (error) throw error;

        setProfile(data);
        setFormData({
          full_name: data.full_name || "",
          phone: data.phone || "",
          address: data.address || "",
        });
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast({
          title: "Error",
          description: "Failed to load profile data.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user, toast]);


  // Handle enable location
  const handleEnableLocation = async () => {
    if (enablingLocation) return; // Prevent multiple clicks

    setEnablingLocation(true);

    try {
      const locationResult = await getCurrentLocationWithAccuracy();
      if (!locationResult) {
        toast({
          title: "Error",
          description: "Unable to get your location. Please check your browser permissions and ensure WiFi is enabled for better positioning.",
          variant: "destructive",
        });
        return;
      }

      const { coordinates, accuracy, source } = locationResult;

      // Reverse geocode to get detailed address information
      const addressInfo = await reverseGeocodeWithFallback(
        coordinates.latitude,
        coordinates.longitude
      );

      if (!addressInfo.address && !addressInfo.city) {
        toast({
          title: "Error",
          description: "Unable to determine address from location coordinates.",
          variant: "destructive",
        });
        return;
      }

      // Create a comprehensive address string
      const addressParts = [
        addressInfo.address,
        addressInfo.city && addressInfo.city !== addressInfo.address?.split(',')[0] ? addressInfo.city : null,
        addressInfo.state,
        addressInfo.postalCode,
        addressInfo.country
      ].filter(Boolean);

      const fullAddress = addressParts.join(', ');

      // Update form data with address and coordinates
      setFormData({
        ...formData,
        address: fullAddress,
      });

      // Update profile with coordinates (will be saved when form is submitted)
      setProfile(prev => prev ? {
        ...prev,
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
      } : null);

      const accuracyDesc = getAccuracyDescription(accuracy);
      const isAccurate = isLocationAccurate(accuracy);

      toast({
        title: "Success",
        description: `Location detected and address filled automatically. ${accuracyDesc} (±${Math.round(accuracy)}m, ${source})`,
        variant: isAccurate ? "default" : "destructive",
      });

      if (!isAccurate) {
        toast({
          title: "Accuracy Notice",
          description: "Location accuracy is lower than ideal. You can manually adjust the address if needed.",
          variant: "destructive",
        });
      }

    } catch (error) {
      console.error("Error getting location:", error);
      toast({
        title: "Error",
        description: "Failed to get location. Please try again or enter address manually.",
        variant: "destructive",
      });
    } finally {
      setEnablingLocation(false);
    }
  };

  // Handle profile update
  const handleUpdateProfile = async () => {
    if (!profile || updatingProfile) return;

    // Validate form data
    const validation = customerProfileSchema.safeParse(formData);
    if (!validation.success) {
      const errorMessages = validation.error.errors.map(err => err.message).join('\n');
      toast({
        title: "Validation Error",
        description: errorMessages,
        variant: "destructive",
      });
      return;
    }

    setUpdatingProfile(true);

    try {
      const { error } = await supabase
        .from("customers")
        .update({
          full_name: validation.data.full_name,
          phone: validation.data.phone || null,
          address: validation.data.address,
          latitude: profile.latitude,
          longitude: profile.longitude,
          updated_at: new Date().toISOString(),
        })
        .eq("id", profile.id);

      if (error) throw error;

      setProfile({
        ...profile,
        full_name: validation.data.full_name,
        phone: validation.data.phone || null,
        address: validation.data.address,
        updated_at: new Date().toISOString(),
      });

      setEditing(false);
      toast({
        title: "Success",
        description: "Profile updated successfully.",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: "Failed to update profile.",
        variant: "destructive",
      });
    } finally {
      setUpdatingProfile(false);
    }
  };

  // Handle password change
  const handleChangePassword = async () => {
    // Validate password data
    const validation = changePasswordSchema.safeParse(passwordData);
    if (!validation.success) {
      const errorMessages = validation.error.errors.map(err => err.message).join('\n');
      toast({
        title: "Validation Error",
        description: errorMessages,
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: validation.data.new,
      });

      if (error) throw error;

      setChangingPassword(false);
      setPasswordData({ current: "", new: "", confirm: "" });
      toast({
        title: "Success",
        description: "Password changed successfully.",
      });
    } catch (error) {
      console.error("Error changing password:", error);
      toast({
        title: "Error",
        description: "Failed to change password.",
        variant: "destructive",
      });
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await signOut();
      navigate("/");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  // Handle delete account
  const handleDeleteAccount = async () => {
    setShowDeleteDialog(false);

    try {
      // First delete shop_owner record if exists (to cascade delete shops and dresses)
      if (user) {
        const { error: shopOwnerError } = await supabase
          .from("shop_owners")
          .delete()
          .eq("user_id", user.id);

        if (shopOwnerError) {
          console.error("Error deleting shop owner:", shopOwnerError);
          // Continue with customer deletion even if shop owner deletion fails
        }
      }

      // Delete customer record
      if (profile) {
        const { error: customerError } = await supabase
          .from("customers")
          .delete()
          .eq("id", profile.id);

        if (customerError) throw customerError;
      }

      await signOut();
      navigate("/");
    } catch (error) {
      console.error("Error deleting account:", error);
      toast({
        title: "Error",
        description: "Failed to delete account.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="p-6 text-center">
            <p className="text-gray-600">Profile not found.</p>
            <Button onClick={() => navigate("/")} className="mt-4">
              Go Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <User className="w-8 h-8 text-blue-600" />
            My Profile
          </h1>
          <p className="text-gray-600 mt-1">Manage your account information</p>
        </div>

        <Tabs defaultValue="personal" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="personal">Personal Info</TabsTrigger>
            <TabsTrigger value="account">Account Details</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>

          {/* Personal Information Tab */}
          <TabsContent value="personal" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Basic Personal Information
                  </span>
                  {!editing && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditing(true)}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">

                <Separator />

                {/* Form Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Full Name</Label>
                    {editing ? (
                      <Input
                        id="full_name"
                        value={formData.full_name}
                        onChange={(e) =>
                          setFormData({ ...formData, full_name: e.target.value })
                        }
                      />
                    ) : (
                      <p className="text-sm text-gray-600">
                        {profile.full_name || "Not provided"}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <p className="text-sm text-gray-600">{profile.email}</p>
                    </div>
                    <p className="text-xs text-gray-500">Email cannot be changed</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    {editing ? (
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                      />
                    ) : (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <p className="text-sm text-gray-600">
                          {profile.phone || "Not provided"}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Username</Label>
                    <p className="text-sm text-gray-600">
                      {user?.email?.split("@")[0] || "N/A"}
                    </p>
                    <p className="text-xs text-gray-500">Username cannot be changed</p>
                  </div>
                </div>

                {/* Address Section */}
                <Separator />
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium flex items-center gap-2">
                      <MapPin className="w-5 h-5" />
                      Address & Location
                    </h3>
                    {editing && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleEnableLocation}
                        disabled={enablingLocation}
                        className="flex items-center gap-2"
                      >
                        <MapPinIcon className="w-4 h-4" />
                        {enablingLocation ? "Getting Location..." : "Enable Location"}
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="address">Address</Label>
                      {editing ? (
                        <Input
                          id="address"
                          value={formData.address}
                          onChange={(e) =>
                            setFormData({ ...formData, address: e.target.value })
                          }
                          placeholder="Enter your full address"
                        />
                      ) : (
                        <p className="text-sm text-gray-600">
                          {profile.address || "Not provided"}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Edit Actions */}
                {editing && (
                  <div className="flex gap-2 pt-4">
                    <Button onClick={handleUpdateProfile} disabled={updatingProfile}>
                      <Save className="w-4 h-4 mr-2" />
                      {updatingProfile ? "Saving..." : "Save Changes"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setEditing(false);
                        setFormData({
                          full_name: profile.full_name || "",
                          phone: profile.phone || "",
                          address: profile.address || "",
                        });
                      }}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Account Details Tab */}
          <TabsContent value="account" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Account Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Account Type</Label>
                    <Badge variant="secondary">Customer</Badge>
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Member Since
                    </Label>
                    <p className="text-sm text-gray-600">
                      {new Date(profile.created_at).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Last Updated</Label>
                    <p className="text-sm text-gray-600">
                      {new Date(profile.updated_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Security & Account Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Change Password */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Change Password</h3>
                  {!changingPassword ? (
                    <Button
                      variant="outline"
                      onClick={() => setChangingPassword(true)}
                    >
                      Change Password
                    </Button>
                  ) : (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="current_password">Current Password</Label>
                        <Input
                          id="current_password"
                          type="password"
                          value={passwordData.current}
                          onChange={(e) =>
                            setPasswordData({
                              ...passwordData,
                              current: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="new_password">New Password</Label>
                        <Input
                          id="new_password"
                          type="password"
                          value={passwordData.new}
                          onChange={(e) =>
                            setPasswordData({
                              ...passwordData,
                              new: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirm_password">Confirm New Password</Label>
                        <Input
                          id="confirm_password"
                          type="password"
                          value={passwordData.confirm}
                          onChange={(e) =>
                            setPasswordData({
                              ...passwordData,
                              confirm: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={handleChangePassword}>
                          Update Password
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setChangingPassword(false);
                            setPasswordData({ current: "", new: "", confirm: "" });
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                <Separator />

                {/* Account Actions */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Account Actions</h3>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={handleLogout}>
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </Button>
                    <Button variant="destructive" onClick={() => setShowDeleteDialog(true)}>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Account
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Delete Account Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Account</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete your account? This action cannot be undone.
              All your data, including profile information and any associated shops or dresses,
              will be permanently removed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteAccount}>
              Delete Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// src/pages/Dashboard.tsx
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  Store,
  CheckCircle2,
  XCircle,
  PlusCircle,
  LogOut,
  Trash2,
  BarChart3,
  Settings,
  Package,
  Star,
} from "lucide-react";
import LogoutConfirmationModal from "@/components/LogoutConfirmationModal";
import Navbar from "@/components/Navbar";
import { supabase } from "@/integrations/supabaseClient";
import DressList from "@/components/DressList";
import { default as DressForm } from "@/components/DressForm";
import ShopEditForm from "@/components/ShopEditForm";

// ----- TYPES -----
interface Shop {
  id: string;
  name: string;
  location: string;
  address?: string;
  phone?: string;
  rating?: number;
  review_count?: number;
  hours?: string;
  specialties?: string[];
  description?: string;
  image_url?: string;
  full_name?: string;
  business_name?: string;
  latitude: number | null;
  longitude: number | null;
  owner_id?: string;
}

export interface DressFormData {
  id?: string;
  shop_id: string; // REQUIRED
  name: string;
  price: number;
  size: string;
  color: string;
  category: string;
  description?: string;
  material?: string;
  brand?: string;
  stock?: number;
  image_url?: string;
}

// ----- DASHBOARD COMPONENT -----
export default function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [shop, setShop] = useState<Shop | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ownerId, setOwnerId] = useState<string | null>(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const [dresses, setDresses] = useState<DressFormData[]>([]);
  const [loadingDresses, setLoadingDresses] = useState(false);
  const [editingDress, setEditingDress] = useState<DressFormData | null>(null);
  const [showDressForm, setShowDressForm] = useState(false);

  const [editingShop, setEditingShop] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  // ----- GET LOGGED-IN USER -----
  useEffect(() => {
    const getUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        console.error("Auth error:", error);
        setError("Please log in to view your dashboard.");
        setLoading(false);
        return;
      }
      setOwnerId(data.user?.id ?? null);
    };
    getUser();
  }, []);

  // ----- FETCH DASHBOARD -----
  const fetchDashboard = useCallback(async () => {
    if (!ownerId) return;

    try {
      const { data: shopOwnerData, error: shopOwnerError } = await supabase
        .from("shop_owners")
        .select("id")
        .eq("user_id", ownerId)
        .single();
      if (shopOwnerError) throw shopOwnerError;

      if (!shopOwnerData || !shopOwnerData.id) {
        setError("Shop owner profile not found.");
        setLoading(false);
        return;
      }

      const { data: shopData, error: shopError } = await supabase
        .from("shops")
        .select("*")
        .eq("owner_id", shopOwnerData.id)
        .single();
      if (shopError) throw shopError;

      if (!shopData || !shopData.id) {
        setError("Shop not found.");
        setLoading(false);
        return;
      }

      setShop(shopData as Shop);

      setLoadingDresses(true);
      const { data: dressesData, error: dressesError } = await supabase
        .from("dresses")
        .select("*")
        .eq("shop_id", shopData.id)
        .order("created_at", { ascending: false });
      if (dressesError) throw dressesError;

      setDresses((dressesData || []) as DressFormData[]);
      setLoadingDresses(false);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError("Failed to load dashboard data.");
      setLoading(false);
    }
  }, [ownerId]);

  useEffect(() => {
    if (ownerId) fetchDashboard();
  }, [ownerId, fetchDashboard]);

  // ----- DRESS HANDLERS -----
  const handleAddDress = () => {
    setEditingDress(null);
    setShowDressForm(true);
  };
  const handleEditDress = (dress: DressFormData) => {
    if (!shop) return;
    setEditingDress({ ...dress, shop_id: shop.id });
    setShowDressForm(true);
  };
  const handleDeleteDress = async (dressId: string) => {
    if (!shop) return;
    if (!confirm("Are you sure you want to delete this dress?")) return;
    try {
      const { error } = await supabase
        .from("dresses")
        .delete()
        .eq("id", dressId);
      if (error) throw error;
      setDresses((prev) => prev.filter((d) => d.id !== dressId));
    } catch (err) {
      console.error(err);
      alert("Failed to delete dress.");
    }
  };
  const handleDressFormSave = () => {
    setShowDressForm(false);
    fetchDashboard();
  };
  const handleDressFormCancel = () => setShowDressForm(false);

  // ----- SHOP HANDLERS -----
  const handleEditShop = () => setEditingShop(true);
  const handleShopFormSave = () => {
    setEditingShop(false);
    fetchDashboard();
  };
  const handleShopFormCancel = () => setEditingShop(false);

  // ----- SHOP CREATION -----
  const handleCreateShop = async () => {
    if (!ownerId) {
      alert("You must be logged in to create a shop.");
      return;
    }
    try {
      const { data: shopOwnerData, error: shopOwnerError } = await supabase
        .from("shop_owners")
        .select("id")
        .eq("user_id", ownerId)
        .single();
      if (shopOwnerError) {
        console.error("Error fetching shop owner:", shopOwnerError);
        alert("Could not find shop owner record for this account.");
        return;
      }

      if (!shopOwnerData) {
        alert("Shop owner profile not found.");
        return;
      }

      const shopInsertData = {
        owner_id: shopOwnerData.id,
        name: "My New Shop",
        business_name: "",
        location: "Enter location",
        address: "Enter address",
        phone: "",
      };

      const { data: newShop, error: shopError } = await supabase
        .from("shops")
        .insert([shopInsertData])
        .select()
        .single();
      if (shopError) throw shopError;

      if (!newShop) {
        alert("Failed to create shop.");
        return;
      }

      setShop(newShop as Shop);
      setError(null);
    } catch (err) {
      console.error("Error creating shop:", err);
      alert("Failed to create shop. Please try again.");
    }
  };

  // ----- LOGOUT -----
  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const handleConfirmLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate("/");
    } catch (err) {
      console.error("Logout error:", err);
      alert("Failed to logout.");
    }
  };

  // ----- DELETE SHOP -----
  const handleDeleteShop = async () => {
    if (!shop) return;
    if (!confirm("Are you sure you want to delete this shop? This will delete all dresses, shop data, and your account as well.")) return;
    try {
      // Delete dresses first
      const { error: dressesError } = await supabase
        .from("dresses")
        .delete()
        .eq("shop_id", shop.id);
      if (dressesError) throw dressesError;

      // Delete shop
      const { error: shopError } = await supabase
        .from("shops")
        .delete()
        .eq("id", shop.id);
      if (shopError) throw shopError;

      // Delete shop_owner record to prevent recreation
      if (shop.owner_id) {
        const { error: ownerError } = await supabase
          .from("shop_owners")
          .delete()
          .eq("id", shop.owner_id);
        if (ownerError) throw ownerError;
      }

      // Delete customer record if it exists
      if (ownerId) {
        const { error: customerError } = await supabase
          .from("customers")
          .delete()
          .eq("user_id", ownerId);
        if (customerError) {
          console.error("Error deleting customer record:", customerError);
          // Continue with sign out even if customer deletion fails
        }
      }

      // Sign out the user since their account is deleted
      await supabase.auth.signOut();
      navigate("/");
    } catch (err) {
      console.error(err);
      alert("Failed to delete shop.");
    }
  };

  // ----- RENDER -----
  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin w-10 h-10 text-blue-600" />
        <p className="mt-3 text-gray-600 text-sm">
          Loading your dashboard...
        </p>
      </div>
    );
  }

  if (error || !shop) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-gray-50">
        <Card className="w-[380px] shadow-lg border border-gray-200">
          <CardHeader>
            <CardTitle className="text-center text-lg font-semibold">
              {error || "No shop found"}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 mb-4">
              You don't have a shop linked to this account.
            </p>
            <Button
              className="w-full bg-blue-600 hover:bg-blue-700"
              onClick={handleCreateShop}
            >
              + Create My Shop
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ---- Stats ----
  const totalDresses = dresses.length;
  const inStock = dresses.filter((d) => (d.stock ?? 0) > 0).length;
  const outOfStock = totalDresses - inStock;
  const totalValue = dresses.reduce((sum, d) => sum + (d.price * (d.stock || 0)), 0);
  const recentDresses = dresses.slice(0, 3); // Last 3 added

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Store className="w-8 h-8 text-blue-600" />
              {shop.name} Dashboard
            </h1>
            <p className="text-gray-600 mt-1">Manage your e-commerce store</p>
          </div>
          <Button
            variant="outline"
            onClick={handleLogout}
            className="flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="products" className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              Products
            </TabsTrigger>
            <TabsTrigger value="shop" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Shop Settings
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="shadow-sm border">
                <CardContent className="flex items-center p-6">
                  <Package className="w-10 h-10 text-blue-600 mr-4" />
                  <div>
                    <p className="text-sm text-gray-500">Total Products</p>
                    <p className="text-2xl font-bold">{totalDresses}</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="shadow-sm border">
                <CardContent className="flex items-center p-6">
                  <CheckCircle2 className="w-10 h-10 text-green-600 mr-4" />
                  <div>
                    <p className="text-sm text-gray-500">In Stock</p>
                    <p className="text-2xl font-bold">{inStock}</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="shadow-sm border">
                <CardContent className="flex items-center p-6">
                  <XCircle className="w-10 h-10 text-red-600 mr-4" />
                  <div>
                    <p className="text-sm text-gray-500">Out of Stock</p>
                    <p className="text-2xl font-bold">{outOfStock}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions & Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Quick Actions */}
              <Card className="shadow-sm border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    onClick={() => {
                      handleAddDress();
                      setActiveTab("products");
                    }}
                    className="w-full justify-start"
                    variant="outline"
                  >
                    <PlusCircle className="w-4 h-4 mr-2" />
                    Add New Product
                  </Button>
                  <Button
                    onClick={() => {
                      handleEditShop();
                      setActiveTab("shop");
                    }}
                    className="w-full justify-start"
                    variant="outline"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Edit Shop Details
                  </Button>
                  <Button
                    onClick={() => navigate("/dresses")}
                    className="w-full justify-start"
                    variant="outline"
                  >
                    <Store className="w-4 h-4 mr-2" />
                    View Store Front
                  </Button>
                </CardContent>
              </Card>

              {/* Recent Products */}
              <Card className="shadow-sm border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    Recent Products
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {recentDresses.length > 0 ? (
                    <div className="space-y-3">
                      {recentDresses.map((dress) => (
                        <div key={dress.id} className="flex items-center gap-3 p-2 rounded-lg border">
                          <img
                            src={dress.image_url || "https://via.placeholder.com/50x50?text=Dress"}
                            alt={dress.name}
                            className="w-10 h-10 object-cover rounded"
                          />
                          <div className="flex-1">
                            <p className="font-medium text-sm">{dress.name}</p>
                            <p className="text-xs text-gray-500">₹{dress.price.toLocaleString("en-IN")}</p>
                          </div>
                          <Badge variant={dress.stock && dress.stock > 0 ? "default" : "secondary"}>
                            {dress.stock && dress.stock > 0 ? `${dress.stock} in stock` : "Out of stock"}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">No products added yet.</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Shop Info Summary */}
            <Card className="shadow-sm border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Store className="w-5 h-5" />
                  Shop Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="font-medium">Location</p>
                    <p className="text-gray-600">{shop.location}</p>
                  </div>
                  <div>
                    <p className="font-medium">Rating</p>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span>{shop.rating?.toFixed(1) || "N/A"}</span>
                      <span className="text-gray-500">({shop.review_count || 0} reviews)</span>
                    </div>
                  </div>
                  <div>
                    <p className="font-medium">Specialties</p>
                    <p className="text-gray-600">{shop.specialties?.join(", ") || "N/A"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products" className="space-y-6">
            <Card className="shadow-md border">
              <CardHeader className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Product Management
                </CardTitle>
                {!showDressForm && (
                  <Button
                    onClick={handleAddDress}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                  >
                    <PlusCircle className="w-5 h-5" /> Add Product
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                {showDressForm ? (
                  <DressForm
                    initialData={editingDress ?? undefined}
                    shopId={shop.id}
                    onSave={handleDressFormSave}
                    onCancel={handleDressFormCancel}
                  />
                ) : (
                  <DressList
                    dresses={dresses}
                    onEdit={handleEditDress}
                    onDelete={handleDeleteDress}
                    loading={loadingDresses}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Shop Settings Tab */}
          <TabsContent value="shop" className="space-y-6">
            <Card className="shadow-md border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Shop Settings
                </CardTitle>
              </CardHeader>
              <CardContent>
                {editingShop ? (
                  <ShopEditForm
                    initialData={{
                      id: shop.id,
                      name: shop.name,
                      location: shop.location,
                      address: shop.address ?? "",
                      description: shop.description ?? "",
                      image_url: shop.image_url ?? "",
                      full_name: shop.full_name ?? "",
                      phone: shop.phone ?? "",
                      business_name: shop.business_name ?? "",
                      hours: shop.hours ?? "",
                      specialties: shop.specialties ?? [],
                    }}
                    onSave={handleShopFormSave}
                    onCancel={handleShopFormCancel}
                  />
                ) : (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                      <div className="space-y-2">
                        <p><strong>Shop Name:</strong> {shop.name}</p>
                        <p><strong>Business Name:</strong> {shop.business_name || "N/A"}</p>
                        <p><strong>Owner:</strong> {shop.full_name || "N/A"}</p>
                        <p><strong>Phone:</strong> {shop.phone || "N/A"}</p>
                      </div>
                      <div className="space-y-2">
                        <p><strong>Location:</strong> {shop.location}</p>
                        <p><strong>Address:</strong> {shop.address}</p>
                        <p><strong>Hours:</strong> {shop.hours || "N/A"}</p>
                        <p><strong>Specialties:</strong> {shop.specialties?.join(", ") || "N/A"}</p>
                      </div>
                    </div>
                    {shop.description && (
                      <div>
                        <p className="font-medium mb-2">Description:</p>
                        <p className="text-gray-600">{shop.description}</p>
                      </div>
                    )}
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={handleEditShop}
                        className="flex items-center gap-2"
                      >
                        <Settings className="w-4 h-4" />
                        Edit Shop Details
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={handleDeleteShop}
                        className="flex items-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete Shop
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          {/* Removed Analytics Tab as per user request */}
          {/* Orders Tab */}
          {/* Removed Orders Tab as per user request */}
        </Tabs>
      </div>

      {/* Logout Confirmation Modal */}
      <LogoutConfirmationModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleConfirmLogout}
      />
    </div>
  );
}

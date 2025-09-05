import { useState } from "react";
import { Plus, Edit, Trash2, Package, AlertTriangle, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// Mock data - replace with real data from Supabase
const mockDresses = [
  {
    id: 1,
    name: "Elegant Evening Gown",
    size: "M",
    color: "Navy Blue",
    price: 299,
    stock: 3,
    category: "Evening",
    image: "/api/placeholder/200/300"
  },
  {
    id: 2,
    name: "Floral Summer Dress",
    size: "S",
    color: "Pink",
    price: 89,
    stock: 0,
    category: "Casual",
    image: "/api/placeholder/200/300"
  },
  {
    id: 3,
    name: "Classic Black Cocktail",
    size: "L",
    color: "Black",
    price: 199,
    stock: 1,
    category: "Cocktail",
    image: "/api/placeholder/200/300"
  }
];

const Dashboard = () => {
  const [dresses, setDresses] = useState(mockDresses);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingDress, setEditingDress] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    size: "",
    color: "",
    price: "",
    stock: "",
    category: "",
    description: ""
  });

  const lowStockDresses = dresses.filter(dress => dress.stock <= 1);
  const totalDresses = dresses.length;
  const totalValue = dresses.reduce((sum, dress) => sum + (dress.price * dress.stock), 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement with Supabase
    console.log("Form submitted:", formData);
    setIsAddModalOpen(false);
    setEditingDress(null);
    setFormData({
      name: "",
      size: "",
      color: "",
      price: "",
      stock: "",
      category: "",
      description: ""
    });
  };

  const handleEdit = (dress: any) => {
    setEditingDress(dress);
    setFormData({
      name: dress.name,
      size: dress.size,
      color: dress.color,
      price: dress.price.toString(),
      stock: dress.stock.toString(),
      category: dress.category,
      description: ""
    });
  };

  const handleDelete = (id: number) => {
    // TODO: Implement with Supabase
    setDresses(dresses.filter(dress => dress.id !== id));
  };

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="bg-white border-b border-border">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-playfair font-bold text-primary">Shop Dashboard</h1>
              <p className="text-muted-foreground">Manage your dress inventory</p>
            </div>
            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
              <DialogTrigger asChild>
                <Button className="btn-hero">
                  <Plus className="w-4 h-4 mr-2" />
                  Add New Dress
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingDress ? "Edit Dress" : "Add New Dress"}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Dress Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="input-premium"
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="size">Size</Label>
                      <Select value={formData.size} onValueChange={(value) => setFormData({ ...formData, size: value })}>
                        <SelectTrigger className="input-premium">
                          <SelectValue placeholder="Select size" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="XS">XS</SelectItem>
                          <SelectItem value="S">S</SelectItem>
                          <SelectItem value="M">M</SelectItem>
                          <SelectItem value="L">L</SelectItem>
                          <SelectItem value="XL">XL</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="color">Color</Label>
                      <Input
                        id="color"
                        value={formData.color}
                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                        className="input-premium"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="price">Price ($)</Label>
                      <Input
                        id="price"
                        type="number"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        className="input-premium"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="stock">Stock Count</Label>
                      <Input
                        id="stock"
                        type="number"
                        value={formData.stock}
                        onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                        className="input-premium"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                      <SelectTrigger className="input-premium">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Evening">Evening</SelectItem>
                        <SelectItem value="Cocktail">Cocktail</SelectItem>
                        <SelectItem value="Casual">Casual</SelectItem>
                        <SelectItem value="Formal">Formal</SelectItem>
                        <SelectItem value="Bridal">Bridal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="input-premium"
                      rows={3}
                    />
                  </div>
                  
                  <Button type="submit" className="w-full btn-hero">
                    {editingDress ? "Update Dress" : "Add Dress"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="card-premium">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Dresses</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalDresses}</div>
              <p className="text-xs text-muted-foreground">
                Active inventory items
              </p>
            </CardContent>
          </Card>
          
          <Card className="card-premium">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Low Stock Alert</CardTitle>
              <AlertTriangle className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-500">{lowStockDresses.length}</div>
              <p className="text-xs text-muted-foreground">
                Items need restocking
              </p>
            </CardContent>
          </Card>
          
          <Card className="card-premium">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Value</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalValue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Total inventory value
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Dress Inventory */}
        <Card className="card-premium">
          <CardHeader>
            <CardTitle className="text-xl font-playfair">Your Dress Collection</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {dresses.map((dress) => (
                <div key={dress.id} className="card-dress">
                  <div className="relative">
                    <img
                      src={dress.image}
                      alt={dress.name}
                      className="w-full h-48 object-cover"
                    />
                    <Badge
                      variant={dress.stock > 1 ? "default" : dress.stock > 0 ? "secondary" : "destructive"}
                      className="absolute top-2 left-2"
                    >
                      {dress.stock > 0 ? `${dress.stock} in stock` : "Out of stock"}
                    </Badge>
                  </div>
                  
                  <div className="p-4 space-y-3">
                    <h3 className="font-semibold text-lg line-clamp-2">{dress.name}</h3>
                    
                    <div className="flex justify-between items-center">
                      <div className="flex gap-2">
                        <Badge variant="outline">{dress.size}</Badge>
                        <Badge variant="outline">{dress.color}</Badge>
                      </div>
                      <span className="text-lg font-semibold text-primary">
                        ${dress.price}
                      </span>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(dress)}
                        className="flex-1"
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(dress.id)}
                        className="flex-1"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
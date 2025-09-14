import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, Package } from "lucide-react";
import { DressFormData } from "@/pages/Dashboard";

interface DressListProps {
  dresses: DressFormData[];
  onEdit: (dress: DressFormData) => void;
  onDelete: (dressId: string) => void;
  loading: boolean;
}

const DressList: React.FC<DressListProps> = ({
  dresses,
  onEdit,
  onDelete,
  loading,
}) => {
  if (loading)
    return (
      <div className="text-center py-6 text-gray-500">Loading dresses...</div>
    );

  if (dresses.length === 0)
    return (
      <div className="text-center py-6 text-gray-500">No dresses found.</div>
    );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {dresses.map((dress) => (
        <Card
          key={dress.id ?? Math.random().toString()}
          className="shadow-md border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
        >
          {/* Image */}
          <div className="relative">
            <img
              src={
                dress.image_url ||
                "https://via.placeholder.com/400x500?text=Dress+Image"
              }
              alt={dress.name}
              className="w-full h-56 object-cover"
            />

            {/* Stock badge */}
            <Badge
              className="absolute top-3 left-3"
              variant={
                dress.stock && dress.stock > 3
                  ? "default"
                  : dress.stock && dress.stock > 0
                  ? "secondary"
                  : "destructive"
              }
            >
              {dress.stock && dress.stock > 0
                ? `${dress.stock} in stock`
                : "Out of stock"}
            </Badge>
          </div>

          {/* Info */}
          <CardContent className="p-4 space-y-3">
            <h3 className="font-semibold text-lg line-clamp-1">{dress.name}</h3>
            <p className="text-sm text-gray-500 line-clamp-2">
              {dress.description || "No description available"}
            </p>

            <div className="flex items-center justify-between">
              <div className="flex gap-2 text-sm text-gray-600">
                <Badge variant="outline">{dress.size}</Badge>
                <Badge variant="outline">{dress.color}</Badge>
              </div>
              <span className="text-lg font-semibold text-blue-600">
                ₹{dress.price.toLocaleString("en-IN")}
              </span>
            </div>

            <div className="flex items-center justify-between text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <Package className="w-4 h-4" /> {dress.category}
              </span>
              <div className="flex gap-2">
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => onEdit(dress)}
                >
                  <Pencil className="w-4 h-4" />
                </Button>
                {dress.id && (
                  <Button
                    size="icon"
                    variant="destructive"
                    onClick={() => onDelete(dress.id!)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default DressList;

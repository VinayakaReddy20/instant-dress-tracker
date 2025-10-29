import React, { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { supabase } from "@/integrations/supabaseClient";
import { DressFormData } from "@/pages/Dashboard";
import { Image as ImageIcon, PlusCircle, Save, Camera } from "lucide-react";
import { dressFormSchema } from "@/lib/validations";

interface DressFormProps {
  initialData?: DressFormData;
  shopId: string;
  onSave: () => void;
  onCancel: () => void;
}

const DressForm: React.FC<DressFormProps> = ({
  initialData,
  shopId,
  onSave,
  onCancel,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<DressFormData>({
    resolver: zodResolver(dressFormSchema),
    defaultValues: {
      name: "",
      price: 0,
      size: "",
      color: "",
      category: "",
      description: "",
      material: "",
      brand: "",
      stock: initialData?.stock ?? 0,
      image_url: "",
      ...initialData,
      shop_id: shopId,
    },
  });

  const [uploading, setUploading] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const onSubmit = async (data: DressFormData) => {
    const submitData = { ...data, shop_id: shopId };
    try {
      if (data.id) {
        const { error } = await supabase
          .from("dresses")
          .update(submitData)
          .eq("id", data.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("dresses").insert(submitData);
        if (error) throw error;
      }
      onSave();
    } catch (err) {
      console.error("Error saving dress:", err);
      alert("Failed to save dress. Please try again.");
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }
    const file = e.target.files[0];
    setUploading(true);

    // Generate a unique file path for storage
    const fileExt = file.name.split(".").pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    const filePath = `${shopId}/${fileName}`;

    try {
      const { data, error: uploadError } = await supabase.storage
        .from("dress_images")
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("dress_images")
        .getPublicUrl(filePath);

      if (!urlData?.publicUrl) {
        throw new Error("Failed to get public URL");
      }

      setValue("image_url", urlData.publicUrl);
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Failed to upload image. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' } // Use back camera if available
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Unable to access camera. Please check permissions.');
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setCameraActive(false);
    }
  };

  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);

    canvas.toBlob(async (blob) => {
      if (!blob) return;

      setUploading(true);
      stopCamera();

      // Generate a unique file path for storage
      const fileName = `${Math.random().toString(36).substring(2, 15)}.jpg`;
      const filePath = `${shopId}/${fileName}`;

      try {
        const { data, error: uploadError } = await supabase.storage
          .from("dress_images")
          .upload(filePath, blob);

        if (uploadError) {
          throw uploadError;
        }

        // Get public URL
        const { data: urlData } = supabase.storage
          .from("dress_images")
          .getPublicUrl(filePath);

        if (!urlData?.publicUrl) {
          throw new Error("Failed to get public URL");
        }

        setValue("image_url", urlData.publicUrl);
      } catch (error) {
        console.error("Error uploading captured image:", error);
        alert("Failed to upload captured image. Please try again.");
      } finally {
        setUploading(false);
      }
    }, 'image/jpeg', 0.8);
  };

  return (
    <Card className="border shadow-sm">
      <CardContent className="p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left column */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Dress Name</Label>
              <Input
                id="name"
                {...register("name")}
                placeholder="e.g. Red Bridal Lehenga"
                aria-invalid={errors.name ? "true" : "false"}
              />
              {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name.message}</p>}
            </div>

            <div>
              <Label htmlFor="price">Price (₹)</Label>
              <Input
                id="price"
                type="number"
                {...register("price", { valueAsNumber: true })}
                placeholder="1999"
                min={0}
                step={0.01}
                aria-invalid={errors.price ? "true" : "false"}
              />
              {errors.price && <p className="text-red-600 text-sm mt-1">{errors.price.message}</p>}
            </div>

            <div>
              <Label htmlFor="stock">Stock</Label>
              <Input
                id="stock"
                type="number"
                {...register("stock", { valueAsNumber: true })}
                placeholder="10"
                min={0}
                aria-invalid={errors.stock ? "true" : "false"}
              />
              {errors.stock && <p className="text-red-600 text-sm mt-1">{errors.stock.message}</p>}
            </div>

            <div>
              <Label htmlFor="brand">Brand</Label>
              <Input
                id="brand"
                {...register("brand")}
                placeholder="e.g. Dress Circle"
                aria-invalid={errors.brand ? "true" : "false"}
              />
              {errors.brand && <p className="text-red-600 text-sm mt-1">{errors.brand.message}</p>}
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="size">Size</Label>
              <Input
                id="size"
                {...register("size")}
                placeholder="S, M, L, XL"
                aria-invalid={errors.size ? "true" : "false"}
              />
              {errors.size && <p className="text-red-600 text-sm mt-1">{errors.size.message}</p>}
            </div>

            <div>
              <Label htmlFor="color">Color</Label>
              <Input
                id="color"
                {...register("color")}
                placeholder="e.g. Red"
                aria-invalid={errors.color ? "true" : "false"}
              />
              {errors.color && <p className="text-red-600 text-sm mt-1">{errors.color.message}</p>}
            </div>

            <div>
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                {...register("category")}
                placeholder="Bridal, Party Wear, Casual"
                aria-invalid={errors.category ? "true" : "false"}
              />
              {errors.category && <p className="text-red-600 text-sm mt-1">{errors.category.message}</p>}
            </div>

            <div>
              <Label htmlFor="material">Material</Label>
              <Input
                id="material"
                {...register("material")}
                placeholder="Cotton, Silk, Georgette"
                aria-invalid={errors.material ? "true" : "false"}
              />
              {errors.material && <p className="text-red-600 text-sm mt-1">{errors.material.message}</p>}
            </div>
          </div>

          {/* Full width: description */}
          <div className="md:col-span-2">
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              {...register("description")}
              placeholder="Describe the dress..."
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              rows={3}
              aria-invalid={errors.description ? "true" : "false"}
            />
            {errors.description && <p className="text-red-600 text-sm mt-1">{errors.description.message}</p>}
          </div>

          {/* Full width: image upload + URL + preview */}
          <div className="md:col-span-2 space-y-2">
            <Label>Upload Image</Label>
            <div className="flex gap-2">
              <input
                id="image_upload"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                disabled={uploading}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              <Button
                type="button"
                variant="outline"
                onClick={cameraActive ? stopCamera : startCamera}
                className="flex items-center gap-2"
                disabled={uploading}
              >
                <Camera className="w-4 h-4" />
                {cameraActive ? 'Stop Camera' : 'Use Camera'}
              </Button>
            </div>

            {cameraActive && (
              <div className="space-y-2">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-40 object-cover rounded-md border bg-black"
                />
                <Button
                  type="button"
                  onClick={capturePhoto}
                  className="w-full bg-green-600 hover:bg-green-700"
                  disabled={uploading}
                >
                  Capture Photo
                </Button>
              </div>
            )}

            <Label htmlFor="image_url">Or enter Image URL</Label>
            <Input
              id="image_url"
              {...register("image_url")}
              placeholder="https://example.com/dress.jpg"
              aria-invalid={errors.image_url ? "true" : "false"}
            />
            {errors.image_url && <p className="text-red-600 text-sm mt-1">{errors.image_url.message}</p>}

            {/* Hidden canvas for photo capture */}
            <canvas ref={canvasRef} className="hidden" />

            {/** Show preview if image_url exists */}
            {/** Use watch to get current image_url value */}
            {(() => {
              const imageUrl = watch("image_url");
              return imageUrl ? (
                <img
                  src={imageUrl}
                  alt="Dress preview"
                  className="mt-2 h-40 object-cover rounded-md border"
                />
              ) : null;
            })()}
          </div>

          {/* Buttons */}
          <div className="md:col-span-2 flex justify-end gap-4 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
              disabled={uploading || isSubmitting}
            >
              {initialData?.id ? (
                <>
                  <Save className="w-4 h-4" /> Update Dress
                </>
              ) : (
                <>
                  <PlusCircle className="w-4 h-4" /> Add Dress
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default DressForm;


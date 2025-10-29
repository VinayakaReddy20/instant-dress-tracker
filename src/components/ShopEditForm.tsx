import React, { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { supabase } from "@/integrations/supabaseClient";
import { shopFormSchema, type ShopFormData as ValidatedShopFormData } from "@/lib/validations";

import type { Database } from "@/types/shared";
import { Loader2, MapPin, Camera, Map } from "lucide-react";

interface ShopEditFormProps {
  initialData: ValidatedShopFormData & { id: string };
  onSave: () => void;
  onCancel: () => void;
}

const ShopEditForm: React.FC<ShopEditFormProps> = ({ initialData, onSave, onCancel }) => {
  const form = useForm<ValidatedShopFormData>({
    resolver: zodResolver(shopFormSchema),
    defaultValues: {
      name: initialData.name,
      business_name: initialData.business_name,
      full_name: initialData.full_name,
      location: initialData.location,
      address: initialData.address,
      phone: initialData.phone,
      hours: initialData.hours,
      specialties: initialData.specialties || [],
      description: initialData.description,
      image_url: initialData.image_url,
    },
  });

  const [uploading, setUploading] = useState(false);

  const [cameraActive, setCameraActive] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }
    const file = e.target.files[0];
    setUploading(true);

    // Generate a unique file path for storage
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    const filePath = `shops/${fileName}`;

    try {
      const { data, error: uploadError } = await supabase.storage
        .from('shop_images')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('shop_images')
        .getPublicUrl(filePath);

      if (!urlData?.publicUrl) {
        throw new Error("Failed to get public URL");
      }

      form.setValue("image_url", urlData.publicUrl);
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Failed to upload image. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleAddressChange = async (address: string) => {
    // Address validation can be done here if needed
    // Since geocoding is removed, no further action required
  };

  const handleUseCurrentLocation = async () => {
    // Geolocation feature removed
    alert('Location feature is not available.');
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
      const filePath = `shops/${fileName}`;

      try {
        const { data, error: uploadError } = await supabase.storage
          .from('shop_images')
          .upload(filePath, blob);

        if (uploadError) {
          throw uploadError;
        }

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('shop_images')
          .getPublicUrl(filePath);

        if (!urlData?.publicUrl) {
          throw new Error("Failed to get public URL");
        }

        form.setValue("image_url", urlData.publicUrl);
      } catch (error) {
        console.error("Error uploading captured image:", error);
        alert("Failed to upload captured image. Please try again.");
      } finally {
        setUploading(false);
      }
    }, 'image/jpeg', 0.8);
  };

  const onSubmit = async (data: ValidatedShopFormData) => {
    console.log(`Form submission started for shop ID: ${initialData.id}, method: POST, path: /shop-edit`);
    try {
      const updateData: Database['public']['Tables']['shops']['Update'] = {
        name: data.name,
        location: data.location,
        address: data.address,
        phone: data.phone || null,
        ...(data.hours && { hours: data.hours }),
        specialties: data.specialties || null,
        description: data.description || null,
        image_url: data.image_url || null,
      };

      const { error } = await supabase
        .from('shops')
        .update(updateData)
        .eq("id", initialData.id);

      if (error) throw error;

      console.log(`Form submission successful for shop ID: ${initialData.id}`);
      onSave();
    } catch (error) {
      console.error("Error updating shop:", error);
      console.log(`Form submission failed for shop ID: ${initialData.id}, error: ${error instanceof Error ? error.message : String(error)}`);
      alert("Failed to update shop. Please try again.");
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border shadow-sm">
          <CardContent className="p-6">
            {/* Left column */}
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Shop Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Dress Circle Mall" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="business_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Business Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Registered business name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="full_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Owner Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Shop owner's full name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="+91 98765 43210" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="hours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hours</FormLabel>
                    <FormControl>
                      <Input placeholder="10 AM - 9 PM" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-sm">
          <CardContent className="p-6">
            {/* Right column */}
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input placeholder="City, State" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      Address
                      {field.value && <MapPin className="w-4 h-4 text-green-500" />}
                    </FormLabel>
                    <FormControl>
                      <div className="space-y-2">
                        <Input
                          placeholder="Street, Area, PIN code"
                          {...field}
                          onBlur={(e) => {
                            field.onBlur();
                            handleAddressChange(e.target.value);
                          }}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleUseCurrentLocation}
                          className="flex items-center gap-2 w-full"
                          disabled={true}
                        >
                          <Map className="w-4 h-4" />
                          Location Feature Unavailable
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="specialties"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Specialties (comma separated)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. Bridal, Casual, Party Wear"
                        value={field.value ? field.value.join(", ") : ""}
                        onChange={(e) =>
                          field.onChange(e.target.value.split(",").map((s) => s.trim()))
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Shop image upload + URL + preview */}
              <div className="space-y-2">
                <Label htmlFor="shop_image_upload">Upload Shop Image</Label>
                <input
                  id="shop_image_upload"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  disabled={uploading}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />

                {/* Camera capture */}
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={cameraActive ? stopCamera : startCamera}
                    className="flex items-center gap-2"
                  >
                    <Camera className="w-4 h-4" />
                    {cameraActive ? 'Stop Camera' : 'Take Photo'}
                  </Button>
                  {cameraActive && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={capturePhoto}
                      disabled={uploading}
                      className="flex items-center gap-2"
                    >
                      {uploading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Capturing...
                        </>
                      ) : (
                        'Capture'
                      )}
                    </Button>
                  )}
                </div>

                {/* Camera preview */}
                {cameraActive && (
                  <div className="mt-2">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-32 object-cover rounded-md border"
                    />
                    <canvas ref={canvasRef} className="hidden" />
                  </div>
                )}

                <FormField
                  control={form.control}
                  name="image_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Or enter Shop Image URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://example.com/shop.jpg" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {(() => {
                  const imageUrl = form.watch("image_url");
                  return imageUrl ? (
                    <img
                      src={imageUrl}
                      alt="Shop preview"
                      className="mt-2 h-20 object-cover rounded-md border"
                    />
                  ) : null;
                })()}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Full width: description */}
        <div className="md:col-span-2">
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <textarea
                    placeholder="Describe your shop and offerings..."
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    rows={4}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Buttons */}
        <div className="md:col-span-2 flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={uploading}>
            Update Shop
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ShopEditForm;

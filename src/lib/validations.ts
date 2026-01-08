import { z } from "zod";

// Email validation schema
export const emailSchema = z
  .string()
  .min(1, "Email is required")
  .email("Please enter a valid email address");

// Password validation schema
export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(/[^A-Za-z0-9]/, "Password must contain at least one symbol");

// Auth schemas
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});

export const signupSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  fullName: z.string().min(1, "Full name is required").max(100, "Full name must be less than 100 characters").optional(),
  phone: z.string().regex(/^[+]?[1-9][\d]{0,15}$/, "Please enter a valid phone number").optional().or(z.literal("")),
});

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

// Dress form validation schema
export const dressFormSchema = z.object({
  name: z
    .string()
    .min(1, "Dress name is required")
    .max(100, "Dress name must be less than 100 characters"),
  price: z
    .number()
    .min(0, "Price must be positive")
    .max(1000000, "Price must be less than 1,000,000"),
  size: z
    .string()
    .min(1, "Size is required")
    .max(10, "Size must be less than 10 characters"),
  color: z
    .string()
    .min(1, "Color is required")
    .max(50, "Color must be less than 50 characters"),
  category: z
    .string()
    .min(1, "Category is required")
    .max(50, "Category must be less than 50 characters"),
  description: z
    .string()
    .max(500, "Description must be less than 500 characters")
    .optional(),
  material: z
    .string()
    .max(50, "Material must be less than 50 characters")
    .optional(),
  brand: z
    .string()
    .max(50, "Brand must be less than 50 characters")
    .optional(),
  stock: z
    .number()
    .min(0, "Stock must be non-negative")
    .max(10000, "Stock must be less than 10,000")
    .optional(),
  image_url: z
    .string()
    .url("Please enter a valid URL")
    .optional()
    .or(z.literal("")),
});

// Shop form validation schema
export const shopFormSchema = z.object({
  name: z
    .string()
    .min(1, "Shop name is required")
    .max(100, "Shop name must be less than 100 characters"),
  business_name: z
    .string()
    .max(100, "Business name must be less than 100 characters")
    .optional(),
  full_name: z
    .string()
    .max(100, "Full name must be less than 100 characters")
    .optional(),
  location: z
    .string()
    .min(1, "Location is required")
    .max(100, "Location must be less than 100 characters"),
  address: z
    .string()
    .min(1, "Address is required")
    .max(200, "Address must be less than 200 characters"),
  phone: z
    .string()
    .regex(/^[+]?[1-9][\d]{0,15}$/, "Please enter a valid phone number")
    .optional()
    .or(z.literal("")),
  hours: z
    .string()
    .max(100, "Hours must be less than 100 characters")
    .optional(),
  specialties: z
    .array(z.string().regex(/^[A-Za-z ]+$/, "Each specialty can only contain letters and spaces"))
    .optional()
    .default([]),
  description: z
    .string()
    .max(500, "Description must be less than 500 characters")
    .optional(),
  image_url: z
    .string()
    .url("Please enter a valid URL")
    .optional()
    .or(z.literal("")),
  latitude: z
    .number()
    .optional(),
  longitude: z
    .number()
    .optional(),
});

// Search validation schema
export const searchSchema = z.object({
  query: z
    .string()
    .max(100, "Search query must be less than 100 characters"),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type SignupFormData = z.infer<typeof signupSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type DressFormData = z.infer<typeof dressFormSchema>;
export type ShopFormData = z.infer<typeof shopFormSchema>;
export type SearchFormData = z.infer<typeof searchSchema>;

import { z } from "zod";

// Email validation schema
export const emailSchema = z
  .string()
  .transform(val => val.replace(/<[^>]*>/g, '').trim())
  .refine(val => val.length >= 1, "Email is required")
  .refine(val => /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(val), "Please enter a valid email address")
  .refine(val => /[a-zA-Z]/.test(val.split('@')[0]), "Email local part must contain at least one letter");

// Password validation schema
export const passwordSchema = z
  .string()
  .transform(val => val.replace(/<[^>]*>/g, '').trim())
  .refine(val => val.length >= 8, "Password must be at least 8 characters")
  .refine(val => val.length <= 64, "Password must be at most 64 characters")
  .refine(val => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,64}$/.test(val), "Password must contain at least one lowercase letter, one uppercase letter, one digit, and one special character");

// Auth schemas
export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const signupSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  fullName: z
    .string()
    .transform(val => val.replace(/<[^>]*>/g, '').trim())
    .refine(val => val.length >= 2, "Full name must be at least 2 characters")
    .refine(val => val.length <= 60, "Full name must be at most 60 characters")
    .refine(val => /^[A-Za-z ]{2,60}$/.test(val), "Full name can only contain letters and spaces"),
  phone: z.string().regex(/^[6-9][0-9]{9}$/, "Phone must be exactly 10 digits starting with 6-9").optional().or(z.literal("")).transform(val => val ? val.replace(/<[^>]*>/g, '').trim() : val),
});

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

// Dress form validation schema
export const dressFormSchema = z.object({
  name: z
    .string()
    .min(2, "Dress name must be at least 2 characters")
    .max(100, "Dress name must be less than 100 characters")
    .regex(/^[A-Za-z0-9 ,-]{2,100}$/, "Dress name can only contain letters, numbers, spaces, commas, and hyphens"),
  price: z
    .number()
    .min(10, "Price must be at least 10")
    .max(1000000, "Price must be less than 1,000,000"),
  stock: z
    .number()
    .int("Stock must be a whole number")
    .min(0, "Stock must be non-negative")
    .max(10000, "Stock must be less than 10,000"),
  brand: z
    .string()
    .min(2, "Brand must be at least 2 characters")
    .max(50, "Brand must be less than 50 characters")
    .regex(/^[A-Za-z ]{2,50}$/, "Brand can only contain letters and spaces"),
  size: z
    .string()
    .regex(/^(XS|S|M|L|XL|XXL|3XL)(\s*,\s*(XS|S|M|L|XL|XXL|3XL))*$/, "Size must be comma-separated values from: XS, S, M, L, XL, XXL, 3XL"),
  color: z
    .string()
    .min(2, "Color must be at least 2 characters")
    .max(30, "Color must be less than 30 characters")
    .regex(/^[A-Za-z ]{2,30}$/, "Color can only contain letters and spaces"),
  category: z
    .string()
    .regex(/^[A-Za-z ]+(,\s*[A-Za-z ]+)*$/, "Category must be comma-separated text values with letters and spaces only"),
  material: z
    .string()
    .min(2, "Material must be at least 2 characters")
    .max(50, "Material must be less than 50 characters")
    .regex(/^[A-Za-z ,]{2,50}$/, "Material can only contain letters, spaces, and commas"),
  description: z
    .string()
    .min(20, "Description must be at least 20 characters")
    .max(500, "Description must be less than 500 characters")
    .transform(val => val.replace(/<[^>]*>/g, '')), // Sanitize HTML to prevent XSS
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
    .min(2, "Shop name must be at least 2 characters")
    .max(100, "Shop name must be less than 100 characters")
    .regex(/^[A-Za-z0-9 ,-]{2,100}$/, "Shop name can only contain letters, numbers, spaces, commas, and hyphens")
    .transform(val => val.replace(/<[^>]*>/g, '')),
  business_name: z
    .string()
    .min(2, "Business name must be at least 2 characters")
    .max(120, "Business name must be less than 120 characters")
    .regex(/^[A-Za-z0-9 ,-]{2,120}$/, "Business name can only contain letters, numbers, spaces, commas, and hyphens")
    .transform(val => val.replace(/<[^>]*>/g, '')),
  full_name: z
    .string()
    .min(2, "Owner full name must be at least 2 characters")
    .max(60, "Owner full name must be less than 60 characters")
    .regex(/^[A-Za-z ]{2,60}$/, "Owner full name can only contain letters and spaces")
    .transform(val => val.replace(/<[^>]*>/g, '')),
  location: z
    .string()
    .min(1, "Location is required")
    .max(100, "Location must be less than 100 characters")
    .transform(val => val.replace(/<[^>]*>/g, '')),
  address: z
    .string()
    .min(1, "Address is required")
    .max(200, "Address must be less than 200 characters")
    .transform(val => val.replace(/<[^>]*>/g, '')),
  phone: z
    .string()
    .regex(/^[6-9][0-9]{9}$/, "Phone must be exactly 10 digits starting with 6-9")
    .transform(val => val.replace(/<[^>]*>/g, '')),
  hours: z
    .string()
    .regex(/^[0-9]{1,2}\s?(AM|PM)\s?-\s?[0-9]{1,2}\s?(AM|PM)$/, "Hours must be in format like '9 AM - 8 PM'")
    .transform(val => val.replace(/<[^>]*>/g, '')),
  specialties: z
    .string()
    .regex(/^[A-Za-z ]+(,\s*[A-Za-z ]+)*$/, "Specialties must be comma-separated alphabetic values only")
    .transform(val => val.replace(/<[^>]*>/g, '')),
  description: z
    .string()
    .max(500, "Description must be less than 500 characters")
    .optional()
    .transform(val => val ? val.replace(/<[^>]*>/g, '') : val),
  image_url: z
    .string()
    .url("Please enter a valid URL")
    .optional()
    .or(z.literal(""))
    .transform(val => val ? val.replace(/<[^>]*>/g, '') : val),
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
    .transform(val => val.replace(/<[^>]*>/g, '').trim())
    .refine(val => val.length >= 2, "Search query must be at least 2 characters")
    .refine(val => val.length <= 50, "Search query must be at most 50 characters")
    .refine(val => /^[A-Za-z0-9 ,-]{2,50}$/.test(val), "Search query can only contain letters, numbers, spaces, commas, and hyphens"),
});

// Newsletter subscription validation schema
export const subscribeSchema = z.object({
  email: emailSchema,
});

// Feedback form validation schema
export const feedbackSchema = z.object({
  rating: z
    .number()
    .int("Rating must be a whole number")
    .min(1, "Rating must be at least 1")
    .max(5, "Rating must be at most 5"),
  category: z.enum(["General Feedback", "Bug Report", "Suggestion", "Experience"], {
    errorMap: () => ({ message: "Please select a valid feedback category" }),
  }),
  name: z
    .string()
    .transform(val => val.replace(/<[^>]*>/g, '').trim())
    .optional()
    .refine(val => !val || (val.length >= 2 && val.length <= 60 && /^[A-Za-z ]{2,60}$/.test(val)), "Name must be 2-60 characters, alphabets and spaces only"),
  email: z
    .string()
    .transform(val => val.replace(/<[^>]*>/g, '').trim())
    .optional()
    .refine(val => !val || /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(val), "Please enter a valid email address"),
  feedback: z
    .string()
    .transform(val => val.replace(/<[^>]*>/g, '').trim())
    .refine(val => val.length >= 10, "Feedback must be at least 10 characters")
    .refine(val => val.length <= 500, "Feedback must be at most 500 characters"),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type SignupFormData = z.infer<typeof signupSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type DressFormData = z.infer<typeof dressFormSchema>;
export type ShopFormData = z.infer<typeof shopFormSchema>;
export type SearchFormData = z.infer<typeof searchSchema>;
export type SubscribeFormData = z.infer<typeof subscribeSchema>;
export type FeedbackFormData = z.infer<typeof feedbackSchema>;

// Customer profile validation schema
export const customerProfileSchema = z.object({
  full_name: z
    .string()
    .transform(val => val.replace(/<[^>]*>/g, '').trim())
    .refine(val => val.length >= 2, "Full name must be at least 2 characters")
    .refine(val => val.length <= 60, "Full name must be at most 60 characters")
    .refine(val => /^[A-Za-z ]{2,60}$/.test(val), "Full name can only contain letters and spaces"),
  phone: z
    .string()
    .regex(/^[6-9][0-9]{9}$/, "Phone must be exactly 10 digits starting with 6-9")
    .transform(val => val.replace(/<[^>]*>/g, '').trim())
    .optional()
    .or(z.literal("")),
  address: z
    .string()
    .min(1, "Address is required")
    .max(200, "Address must be less than 200 characters")
    .transform(val => val.replace(/<[^>]*>/g, '').trim()),
});

// Password change validation schema
export const changePasswordSchema = z.object({
  current: z
    .string()
    .min(1, "Current password is required"),
  new: passwordSchema,
  confirm: z
    .string()
    .min(1, "Password confirmation is required"),
}).refine(data => data.new === data.confirm, {
  message: "New passwords do not match",
  path: ["confirm"],
});

export type CustomerProfileFormData = z.infer<typeof customerProfileSchema>;
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

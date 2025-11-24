import type { Database } from "@/integrations/supabase/types";

// Shared types used across pages to ensure schema consistency

export type DressRow = Database["public"]["Tables"]["dresses"]["Row"];
export type ShopRow = Database["public"]["Tables"]["shops"]["Row"];

export interface Dress extends DressRow {
  shops: Pick<ShopRow, "name" | "location"> | null;
}

export interface ShopWithCount extends Omit<ShopRow, 'latitude' | 'longitude'> {
  dress_count: number;
  latitude?: number | null;
  longitude?: number | null;
}

// Re-export Database type for convenience
export type { Database };

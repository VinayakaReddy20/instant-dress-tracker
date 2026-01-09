import type { Tables } from "@/types";

// Shared types used across pages to ensure schema consistency

export type DressRow = Tables<"dresses">;
export type ShopRow = Tables<"shops">;
export type CustomerRow = Tables<"customers">;
export type CustomerAddressRow = Tables<"customer_addresses">;

export interface Dress extends DressRow {
  shops: Pick<ShopRow, "name" | "location"> | null;
}

export interface ShopWithCount extends ShopRow {
  dress_count: number;
}

export interface CustomerWithAddresses extends CustomerRow {
  addresses: CustomerAddressRow[];
}

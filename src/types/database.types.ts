// src/integrations/supabase/types.ts

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  __InternalSupabase: {
    PostgresVersion: "13.0.4";
  };
  public: {
    Tables: {
      shop_owners: {
        Row: {
          id: string;
          user_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };

      shops: {
        Row: {
          id: string;
          owner_id: string;
          name: string;
          full_name: string | null;
          phone: string | null;
          business_name: string | null;
          location: string;
          address: string;
          rating: number | null;
          review_count: number | null;
          hours: string | null;
          specialties: string[] | null;
          description: string | null;
          image_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          name: string;
          full_name?: string | null;
          phone?: string | null;
          business_name?: string | null;
          location?: string;
          address?: string;
          rating?: number | null;
          review_count?: number | null;
          hours?: string | null;
          specialties?: string[] | null;
          description?: string | null;
          image_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          owner_id?: string;
          name?: string;
          full_name?: string | null;
          phone?: string | null;
          business_name?: string | null;
          location?: string;
          address?: string;
          rating?: number | null;
          review_count?: number | null;
          hours?: string | null;
          specialties?: string[] | null;
          description?: string | null;
          image_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "shops_owner_id_fkey";
            columns: ["owner_id"];
            isOneToOne: true;
            referencedRelation: "shop_owners";
            referencedColumns: ["id"];
          }
        ];
      };

      dresses: {
        Row: {
          id: string;
          shop_id: string;
          name: string;
          price: number;
          stock: number | null;
          size: string;
          color: string;
          category: string;
          image_url: string | null;
          description: string | null;
          material: string | null;
          brand: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          shop_id: string;
          name: string;
          price?: number;
          stock?: number | null;
          size: string;
          color?: string;
          category?: string;
          image_url?: string | null;
          description?: string | null;
          material?: string | null;
          brand?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          shop_id?: string;
          name?: string;
          price?: number;
          stock?: number | null;
          size?: string;
          color?: string;
          category?: string;
          image_url?: string | null;
          description?: string | null;
          material?: string | null;
          brand?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "dresses_shop_id_fkey";
            columns: ["shop_id"];
            isOneToOne: false;
            referencedRelation: "shops";
            referencedColumns: ["id"];
          }
        ];
      };

      customers: {
  Row: {
    id: string;
    user_id: string;
    email: string;
    full_name: string | null;
    phone: string | null;
    created_at: string;
    updated_at: string;
  };
  Insert: {
    id?: string;
    user_id: string;
    email: string;
    full_name?: string | null;
    phone?: string | null;
    created_at?: string;
    updated_at?: string;
  };
  Update: {
    id?: string;
    user_id?: string;
    email?: string;
    full_name?: string | null;
    phone?: string | null;
    created_at?: string;
    updated_at?: string;
  };
      };
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};


type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;
type DefaultSchema = DatabaseWithoutInternals["public"];


// ---------------- Tables ----------------
export type Tables<T extends keyof DefaultSchema["Tables"]> =
  DefaultSchema["Tables"][T]["Row"];

export type TablesInsert<T extends keyof DefaultSchema["Tables"]> =
  DefaultSchema["Tables"][T]["Insert"];

export type TablesUpdate<T extends keyof DefaultSchema["Tables"]> =
  DefaultSchema["Tables"][T]["Update"];


// ---------------- Constants ----------------
export const Constants = {
  public: {
    Enums: {},
  },
} as const;

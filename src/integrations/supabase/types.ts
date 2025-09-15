export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[];

export interface Database {
  public: {
    Tables: {
      shop_owners: {
        Row: {
          id: string;
          user_id: string;
          full_name: string | null;
          phone: string | null;
          profile_image_url: string | null;
          business_name: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          full_name?: string | null;
          phone?: string | null;
          profile_image_url?: string | null;
          business_name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          full_name?: string | null;
          phone?: string | null;
          profile_image_url?: string | null;
          business_name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };

      shops: {
        Row: {
          id: string;
          name: string;
          location: string;
          address: string;
          phone: string | null;
          rating: number | null;
          review_count: number | null;
          hours: string | null;
          specialties: string[] | null;
          description: string | null;
          image_url: string | null;
          created_at: string;
          updated_at: string;
          owner_id: string;
        };
        Insert: {
          id?: string;
          name?: string;
          location?: string;
          address?: string;
          phone?: string | null;
          rating?: number | null;
          review_count?: number | null;
          hours?: string | null;
          specialties?: string[] | null;
          description?: string | null;
          image_url?: string | null;
          owner_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          location?: string;
          address?: string;
          phone?: string | null;
          rating?: number | null;
          review_count?: number | null;
          hours?: string | null;
          specialties?: string[] | null;
          description?: string | null;
          image_url?: string | null;
          owner_id?: string;
          created_at?: string;
          updated_at?: string;
        };
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
          stock?: number;
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
          stock?: number;
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
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

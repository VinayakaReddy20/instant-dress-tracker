export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      customers: {
        Row: {
          address: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          latitude: number | null
          longitude: number | null
          phone: string | null
          profile_picture_url: string | null
          updated_at: string
          user_id: string
          location_method: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          phone?: string | null
          profile_picture_url?: string | null
          updated_at?: string
          user_id: string
          location_method?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          phone?: string | null
          profile_picture_url?: string | null
          updated_at?: string
          user_id?: string
          location_method?: string | null
        }
        Relationships: []
      }
      dresses: {
        Row: {
          brand: string | null
          category: string | null
          color: string | null
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          material: string | null
          name: string
          price: number | null
          shop_id: string
          size: string
          stock: number | null
          updated_at: string
        }
        Insert: {
          brand?: string | null
          category?: string | null
          color?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          material?: string | null
          name: string
          price?: number | null
          shop_id: string
          size: string
          stock?: number | null
          updated_at?: string
        }
        Update: {
          brand?: string | null
          category?: string | null
          color?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          material?: string | null
          name?: string
          price?: number | null
          shop_id?: string
          size?: string
          stock?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "dresses_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      shop_owners: {
        Row: {
          created_at: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      shops: {
        Row: {
          address: string | null
          business_name: string | null
          created_at: string
          description: string | null
          full_name: string | null
          hours: string | null
          id: string
          image_url: string | null
          latitude: number | null
          location: string | null
          longitude: number | null
          name: string
          owner_id: string
          phone: string | null
          rating: number | null
          review_count: number | null
          specialties: string[] | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          business_name?: string | null
          created_at?: string
          description?: string | null
          full_name?: string | null
          hours?: string | null
          id?: string
          image_url?: string | null
          latitude?: number | null
          location?: string | null
          longitude?: number | null
          name: string
          owner_id: string
          phone?: string | null
          rating?: number | null
          review_count?: number | null
          specialties?: string[] | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          business_name?: string | null
          created_at?: string
          description?: string | null
          full_name?: string | null
          hours?: string | null
          id?: string
          image_url?: string | null
          latitude?: number | null
          location?: string | null
          longitude?: number | null
          name?: string
          owner_id?: string
          phone?: string | null
          rating?: number | null
          review_count?: number | null
          specialties?: string[] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "shops_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: true
            referencedRelation: "shop_owners"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_addresses: {
        Row: {
          id: string
          user_id: string
          full_name: string
          phone: string
          house_street: string
          city: string
          state: string
          pincode: string
          is_default: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          full_name: string
          phone: string
          house_street: string
          city: string
          state: string
          pincode: string
          is_default?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          full_name?: string
          phone?: string
          house_street?: string
          city?: string
          state?: string
          pincode?: string
          is_default?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_addresses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      cart: {
        Row: {
          id: string
          user_id: string
          dress_id: string
          quantity: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          dress_id: string
          quantity?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          dress_id?: string
          quantity?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cart_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_dress_id_fkey"
            columns: ["dress_id"]
            isOneToOne: false
            referencedRelation: "dresses"
            referencedColumns: ["id"]
          }
        ]
      }
      customer_preferences: {
        Row: {
          id: string
          customer_id: string
          preferred_sizes: string[] | null
          favorite_colors: string[] | null
          style_preferences: string[] | null
          budget_range: string | null
          notification_preferences: Json | null
          size_notes: string | null
          color_notes: string | null
          style_notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          customer_id: string
          preferred_sizes?: string[] | null
          favorite_colors?: string[] | null
          style_preferences?: string[] | null
          budget_range?: string | null
          notification_preferences?: Json | null
          size_notes?: string | null
          color_notes?: string | null
          style_notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          customer_id?: string
          preferred_sizes?: string[] | null
          favorite_colors?: string[] | null
          style_preferences?: string[] | null
          budget_range?: string | null
          notification_preferences?: Json | null
          size_notes?: string | null
          color_notes?: string | null
          style_notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_preferences_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const

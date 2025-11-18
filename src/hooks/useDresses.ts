// src/hooks/useDresses.ts
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabaseClient";
import { Tables } from "@/integrations/supabase/types";

export type Dress = Tables<'dresses'> & {
  shop?: {
    name: string | null;
    location: string | null;
  };
};

export interface DressFilters {
  searchQuery?: string;
  category?: string;
  color?: string;
  size?: string;
  shopId?: string;
}

export const useDresses = (filters?: DressFilters) => {
  const [dresses, setDresses] = useState<Dress[]>([]);
  const [filteredDresses, setFilteredDresses] = useState<Dress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDresses = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);

      const { data, error: supabaseError } = await supabase
        .from("dresses")
        .select(`
          *,
          shop:shops(name, location)
        `)
        .order("created_at", { ascending: false });

      if (supabaseError) throw new Error(supabaseError.message);

      setDresses(data ?? []);
    } catch (err) {
      console.error("Error fetching dresses:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch dresses");
    } finally {
      setLoading(false);
    }
  }, []);

  // Apply filters to dresses
  useEffect(() => {
    let filtered = [...dresses];

    // Apply search filter
    if (filters?.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(dress =>
        dress.name.toLowerCase().includes(query) ||
        dress.brand?.toLowerCase().includes(query) ||
        dress.category?.toLowerCase().includes(query) ||
        dress.color?.toLowerCase().includes(query) ||
        dress.material?.toLowerCase().includes(query) ||
        dress.description?.toLowerCase().includes(query) ||
        dress.shop?.name?.toLowerCase().includes(query) ||
        dress.shop?.location?.toLowerCase().includes(query)
      );
    }

    // Apply category filter
    if (filters?.category) {
      filtered = filtered.filter(dress =>
        dress.category?.toLowerCase() === filters.category!.toLowerCase()
      );
    }

    // Apply color filter
    if (filters?.color) {
      filtered = filtered.filter(dress =>
        dress.color?.toLowerCase() === filters.color!.toLowerCase()
      );
    }

    // Apply size filter
    if (filters?.size) {
      filtered = filtered.filter(dress =>
        dress.size.toLowerCase() === filters.size!.toLowerCase()
      );
    }

    // Apply shop filter
    if (filters?.shopId) {
      filtered = filtered.filter(dress =>
        dress.shop_id === filters.shopId
      );
    }

    setFilteredDresses(filtered);
  }, [dresses, filters]);

  useEffect(() => {
    fetchDresses();

    const channel = supabase
      .channel("realtime-dresses")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "dresses" },
        (payload) => {
          const newDress = payload.new as Dress;
          const oldDress = payload.old as Dress;

          switch (payload.eventType) {
            case "INSERT":
              if (newDress) {
                setDresses((prev) =>
                  prev.some((d) => d.id === newDress.id)
                    ? prev
                    : [newDress, ...prev]
                );
              }
              break;
            case "UPDATE":
              if (newDress) {
                setDresses((prev) =>
                  prev.map((d) => (d.id === newDress.id ? newDress : d))
                );
              }
              break;
            case "DELETE":
              if (oldDress) {
                setDresses((prev) => prev.filter((d) => d.id !== oldDress.id));
              }
              break;
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchDresses]);

  return {
    dresses: filteredDresses,
    allDresses: dresses,
    loading,
    error,
    refresh: fetchDresses,
  };
};
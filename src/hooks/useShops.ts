// src/hooks/useShops.ts
import { useState, useEffect, useCallback } from "react";
import { supabase } from "../integrations/supabaseClient";
import { Tables } from "../types";
import { calculateDistance } from "../lib/geolocation";

export type Shop = Tables<'shops'>;

export interface LocationFilter {
  latitude: number;
  longitude: number;
  maxDistance: number; // in kilometers
}

export interface ShopFilters {
  searchQuery?: string;
  specialty?: string;
  location?: LocationFilter;
}

export const useShops = (filters?: ShopFilters) => {
  const [shops, setShops] = useState<Shop[]>([]);
  const [filteredShops, setFilteredShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchShops = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);

      const { data, error: supabaseError } = await supabase
        .from("shops")
        .select("*")
        .order("created_at", { ascending: false });

      if (supabaseError) throw new Error(supabaseError.message);

      setShops(data ?? []);
    } catch (err) {
      console.error("Error fetching shops:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch shops");
    } finally {
      setLoading(false);
    }
  }, []);

  // Apply filters to shops
  useEffect(() => {
    let filtered = [...shops];

    // Apply search filter
    if (filters?.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(shop =>
        shop.name.toLowerCase().includes(query) ||
        (shop.location && shop.location.toLowerCase().includes(query)) ||
        (shop.address && shop.address.toLowerCase().includes(query)) ||
        shop.description?.toLowerCase().includes(query) ||
        shop.specialties?.some((specialty: string) => specialty.toLowerCase().includes(query))
      );
    }

    // Apply specialty filter
    if (filters?.specialty) {
      filtered = filtered.filter(shop =>
        shop.specialties?.includes(filters.specialty!)
      );
    }

    // Apply location filter
    if (filters?.location) {
      const { latitude, longitude, maxDistance } = filters.location;
      filtered = filtered
        .filter(shop => {
          if (!shop.latitude || !shop.longitude) return false;
          const distance = calculateDistance(
            latitude,
            longitude,
            shop.latitude,
            shop.longitude
          );
          return distance <= maxDistance;
        })
        .sort((a, b) => {
          if (!a.latitude || !a.longitude || !b.latitude || !b.longitude) return 0;
          const distA = calculateDistance(latitude, longitude, a.latitude, a.longitude);
          const distB = calculateDistance(latitude, longitude, b.latitude, b.longitude);
          return distA - distB; // Sort by distance (closest first)
        });
    }

    setFilteredShops(filtered);
  }, [shops, filters]);

  useEffect(() => {
    fetchShops();

    const channel = supabase
      .channel("realtime-shops")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "shops" },
        (payload) => {
          const newShop = payload.new as Shop;
          const oldShop = payload.old as Shop;

          switch (payload.eventType) {
            case "INSERT":
              if (newShop) {
                setShops((prev) =>
                  prev.some((s) => s.id === newShop.id)
                    ? prev
                    : [newShop, ...prev]
                );
              }
              break;
            case "UPDATE":
              if (newShop) {
                setShops((prev) =>
                  prev.map((s) => (s.id === newShop.id ? newShop : s))
                );
              }
              break;
            case "DELETE":
              if (oldShop) {
                setShops((prev) => prev.filter((s) => s.id !== oldShop.id));
              }
              break;
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchShops]);

  return {
    shops: filteredShops,
    allShops: shops,
    loading,
    error,
    refresh: fetchShops,
  };
};

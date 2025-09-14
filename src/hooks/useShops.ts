// src/hooks/useShops.ts
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabaseClient";
import { Tables } from "@/types/database.types";

export type Shop = Tables<'shops'>;

export const useShops = () => {
  const [shops, setShops] = useState<Shop[]>([]);
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
    shops,
    loading,
    error,
    refresh: fetchShops,
  };
};

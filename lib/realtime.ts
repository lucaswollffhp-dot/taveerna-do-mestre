"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

/**
 * Lê e assina (Realtime) as linhas de uma tabela filtradas por campanha.
 * O RLS garante que cada usuário só recebe o que pode enxergar — por isso
 * o mesmo hook serve para Mestre e Jogador.
 */
export function useLiveRows<T>(
  table: string,
  campaignId: string,
  opts?: { orderBy?: string; ascending?: boolean },
) {
  const [rows, setRows] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);

  const orderBy = opts?.orderBy;
  const ascending = opts?.ascending ?? true;

  const refresh = useCallback(async () => {
    const supabase = createClient();
    let query = supabase
      .from(table as never)
      .select("*")
      .eq("campaign_id", campaignId);
    if (orderBy) query = query.order(orderBy, { ascending });
    const { data } = await query;
    setRows((data ?? []) as T[]);
    setLoading(false);
  }, [table, campaignId, orderBy, ascending]);

  useEffect(() => {
    refresh();
    const supabase = createClient();
    const channel = supabase
      .channel(`rows:${table}:${campaignId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table,
          filter: `campaign_id=eq.${campaignId}`,
        },
        () => refresh(),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [table, campaignId, refresh]);

  return { rows, loading, refresh };
}

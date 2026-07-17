"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Scene, Token } from "@/lib/types/database.types";

interface TableState {
  scene: Scene | null;
  tokens: Token[];
  loading: boolean;
  refresh: () => Promise<void>;
}

/**
 * Assina uma cena e seus tokens via Supabase Realtime.
 * - `fixedSceneId` definido (Mestre): acompanha aquela cena específica.
 * - `fixedSceneId` ausente (Jogador): acompanha a cena marcada como ativa.
 */
export function useTable(campaignId: string, fixedSceneId?: string): TableState {
  const [scene, setScene] = useState<Scene | null>(null);
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const supabase = createClient();

    let sceneRow: Scene | null = null;
    if (fixedSceneId) {
      const { data } = await supabase
        .from("scenes")
        .select("*")
        .eq("id", fixedSceneId)
        .maybeSingle();
      sceneRow = (data as Scene) ?? null;
    } else {
      const { data } = await supabase
        .from("scenes")
        .select("*")
        .eq("campaign_id", campaignId)
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      sceneRow = (data as Scene) ?? null;
    }

    setScene(sceneRow);
    if (sceneRow) {
      const { data: tk } = await supabase
        .from("tokens")
        .select("*")
        .eq("scene_id", sceneRow.id);
      setTokens((tk ?? []) as Token[]);
    } else {
      setTokens([]);
    }
    setLoading(false);
  }, [campaignId, fixedSceneId]);

  useEffect(() => {
    refresh();

    const supabase = createClient();
    const channel = supabase
      .channel(`table:${campaignId}:${fixedSceneId ?? "active"}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "tokens",
          filter: `campaign_id=eq.${campaignId}`,
        },
        () => refresh(),
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "scenes",
          filter: `campaign_id=eq.${campaignId}`,
        },
        () => refresh(),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [campaignId, fixedSceneId, refresh]);

  return { scene, tokens, loading, refresh };
}

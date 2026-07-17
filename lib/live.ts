"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Combatant, Encounter } from "@/lib/types/database.types";

/** Ordena combatentes por iniciativa (desc), desempatando por nome. */
export function sortCombatants(list: Combatant[]): Combatant[] {
  return [...list].sort(
    (a, b) => b.initiative - a.initiative || a.name.localeCompare(b.name),
  );
}

interface LiveState {
  encounter: Encounter | null;
  combatants: Combatant[];
  loading: boolean;
  /** Força uma releitura imediata do estado do combate. */
  refresh: () => Promise<void>;
}

/**
 * Assina o combate ativo de uma campanha via Supabase Realtime e mantém
 * `encounter` + `combatants` sincronizados. Qualquer mudança (do Mestre ou
 * de outra aba) dispara uma releitura do estado.
 */
export function useLiveEncounter(campaignId: string): LiveState {
  const [encounter, setEncounter] = useState<Encounter | null>(null);
  const [combatants, setCombatants] = useState<Combatant[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const supabase = createClient();
    const { data: enc } = await supabase
      .from("encounters")
      .select("*")
      .eq("campaign_id", campaignId)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!enc) {
      setEncounter(null);
      setCombatants([]);
      setLoading(false);
      return;
    }

    setEncounter(enc as Encounter);
    const { data: cbs } = await supabase
      .from("combatants")
      .select("*")
      .eq("encounter_id", (enc as Encounter).id);
    setCombatants(sortCombatants((cbs ?? []) as Combatant[]));
    setLoading(false);
  }, [campaignId]);

  useEffect(() => {
    refresh();

    const supabase = createClient();
    const channel = supabase
      .channel(`live:${campaignId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "combatants",
          filter: `campaign_id=eq.${campaignId}`,
        },
        () => refresh(),
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "encounters",
          filter: `campaign_id=eq.${campaignId}`,
        },
        () => refresh(),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [campaignId, refresh]);

  return { encounter, combatants, loading, refresh };
}

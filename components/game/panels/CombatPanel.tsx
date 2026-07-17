"use client";

import { LivePanel } from "@/app/(master)/campaign/[id]/live/LivePanel";
import { LiveView } from "@/app/(player)/play/[id]/live/LiveView";
import { useLiveRows } from "@/lib/realtime";
import type { Character } from "@/lib/types/database.types";

interface CombatPanelProps {
  campaignId: string;
  isMaster: boolean;
}

export function CombatPanel({ campaignId, isMaster }: CombatPanelProps) {
  const { rows } = useLiveRows<Character>("characters", campaignId, {
    orderBy: "name",
  });

  if (!isMaster) {
    return <LiveView campaignId={campaignId} />;
  }

  const pcs = rows.map((c) => ({
    id: c.id,
    name: c.name,
    hp_current: c.hp_current,
    hp_max: c.hp_max,
    ac: c.ac,
  }));

  return <LivePanel campaignId={campaignId} pcs={pcs} />;
}

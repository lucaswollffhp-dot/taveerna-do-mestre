"use client";

import { Badge } from "@/components/ui/Badge";
import { TokenAvatar } from "@/components/ui/TokenAvatar";
import { useLiveRows } from "@/lib/realtime";
import { npcType } from "@/lib/labels";
import type { Npc } from "@/lib/types/database.types";

export function NpcsPanel({ campaignId }: { campaignId: string }) {
  const { rows, loading } = useLiveRows<Npc>("npcs", campaignId, {
    orderBy: "name",
  });

  if (loading) return <p className="text-sm text-text-muted">Carregando…</p>;
  if (rows.length === 0)
    return (
      <p className="text-sm text-text-muted">
        Nenhum personagem conhecido ainda.
      </p>
    );

  return (
    <div className="space-y-2">
      {rows.map((n) => (
        <div
          key={n.id}
          className="flex items-start gap-3 rounded-md border border-border bg-surface-raised p-3"
        >
          <TokenAvatar name={n.name} imageUrl={n.token_image_url} size={40} />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-title text-text">{n.name}</span>
              <Badge tone={npcType.tones[n.type]}>
                {npcType.labels[n.type]}
              </Badge>
            </div>
            {n.aliases && n.aliases.length > 0 && (
              <p className="text-xs italic text-text-muted">
                {n.aliases.join(", ")}
              </p>
            )}
            {n.physical_description && (
              <p className="mt-1 text-sm text-text-secondary">
                {n.physical_description}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

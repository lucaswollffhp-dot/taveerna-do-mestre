"use client";

import { TokenAvatar } from "@/components/ui/TokenAvatar";
import { useLiveRows } from "@/lib/realtime";
import type { Character } from "@/lib/types/database.types";

function HpBar({ current, max }: { current: number; max: number }) {
  const pct = max > 0 ? Math.max(0, Math.min(100, (current / max) * 100)) : 0;
  const tone =
    pct > 50 ? "bg-success" : pct > 25 ? "bg-warning" : "bg-primary";
  return (
    <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-bg">
      <div className={`h-full ${tone}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

export function PartyPanel({ campaignId }: { campaignId: string }) {
  const { rows, loading } = useLiveRows<Character>("characters", campaignId, {
    orderBy: "name",
  });

  if (loading) return <p className="text-sm text-text-muted">Carregando…</p>;
  if (rows.length === 0)
    return (
      <p className="text-sm text-text-muted">Nenhum personagem no grupo.</p>
    );

  return (
    <div className="space-y-2">
      {rows.map((c) => (
        <div
          key={c.id}
          className="flex items-center gap-3 rounded-md border border-border bg-surface-raised p-3"
        >
          <TokenAvatar name={c.name} imageUrl={c.token_image_url} size={40} />
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <span className="font-title text-text">{c.name}</span>
              <span className="text-xs text-text-muted">CA {c.ac}</span>
            </div>
            <p className="text-xs text-text-secondary">
              {[c.race, c.class].filter(Boolean).join(" ") || "Aventureiro"} ·
              Nível {c.level}
            </p>
            <HpBar current={c.hp_current} max={c.hp_max} />
            <p className="mt-0.5 text-right text-xs text-text-muted">
              {c.hp_current}/{c.hp_max} PV
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

"use client";

import { Badge } from "@/components/ui/Badge";
import { useLiveRows } from "@/lib/realtime";
import type { Location } from "@/lib/types/database.types";

export function LocationsPanel({ campaignId }: { campaignId: string }) {
  const { rows, loading } = useLiveRows<Location>("locations", campaignId, {
    orderBy: "name",
  });

  if (loading) return <p className="text-sm text-text-muted">Carregando…</p>;
  if (rows.length === 0)
    return (
      <p className="text-sm text-text-muted">Nenhum local descoberto ainda.</p>
    );

  return (
    <div className="space-y-2">
      {rows.map((l) => (
        <div
          key={l.id}
          className="rounded-md border border-border bg-surface-raised p-3"
        >
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-title text-text">{l.name}</span>
            {l.type && <Badge tone="neutral">{l.type}</Badge>}
          </div>
          {l.region && (
            <p className="text-xs text-text-muted">{l.region}</p>
          )}
          {l.public_description && (
            <p className="mt-1 text-sm text-text-secondary">
              {l.public_description}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

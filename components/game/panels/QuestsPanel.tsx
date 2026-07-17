"use client";

import { Badge } from "@/components/ui/Badge";
import { Icon } from "@/components/ui/Icon";
import { useLiveRows } from "@/lib/realtime";
import { questStatus } from "@/lib/labels";
import type { Quest, QuestObjective } from "@/lib/types/database.types";

function objectives(raw: unknown): QuestObjective[] {
  return Array.isArray(raw) ? (raw as QuestObjective[]) : [];
}

export function QuestsPanel({ campaignId }: { campaignId: string }) {
  const { rows, loading } = useLiveRows<Quest>("quests", campaignId, {
    orderBy: "created_at",
    ascending: false,
  });

  if (loading) return <p className="text-sm text-text-muted">Carregando…</p>;
  if (rows.length === 0)
    return <p className="text-sm text-text-muted">Nenhuma missão por aqui.</p>;

  return (
    <div className="space-y-3">
      {rows.map((q) => {
        const objs = objectives(q.objectives);
        return (
          <div
            key={q.id}
            className="rounded-md border border-border bg-surface-raised p-3"
          >
            <div className="mb-1 flex items-center justify-between gap-2">
              <h3 className="font-title text-text">{q.title}</h3>
              <Badge tone={questStatus.tones[q.status]}>
                {questStatus.labels[q.status]}
              </Badge>
            </div>
            {q.description && (
              <p className="text-sm text-text-secondary">{q.description}</p>
            )}
            {objs.length > 0 && (
              <ul className="mt-2 space-y-1">
                {objs.map((o, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <Icon
                      name={o.completed ? "checkDone" : "checkTodo"}
                      size={15}
                      className={o.completed ? "text-accent" : "text-text-muted"}
                    />
                    <span
                      className={
                        o.completed
                          ? "text-text-muted line-through"
                          : "text-text-secondary"
                      }
                    >
                      {o.text}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      })}
    </div>
  );
}

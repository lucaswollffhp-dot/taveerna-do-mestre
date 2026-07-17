"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import type { QuestObjective } from "@/lib/types/database.types";

/**
 * Editor de checklist de objetivos. Mantém a lista em estado e serializa
 * para um input oculto (JSON) consumido pelo Server Action.
 */
export function ObjectivesEditor({
  initial = [],
}: {
  initial?: QuestObjective[];
}) {
  const [items, setItems] = useState<QuestObjective[]>(initial);

  const update = (i: number, patch: Partial<QuestObjective>) =>
    setItems((prev) =>
      prev.map((o, idx) => (idx === i ? { ...o, ...patch } : o)),
    );
  const remove = (i: number) =>
    setItems((prev) => prev.filter((_, idx) => idx !== i));
  const add = () =>
    setItems((prev) => [...prev, { text: "", completed: false }]);

  return (
    <div className="space-y-2">
      <input type="hidden" name="objectives" value={JSON.stringify(items)} />
      {items.length === 0 && (
        <p className="text-sm text-text-muted">Nenhum objetivo ainda.</p>
      )}
      <ul className="space-y-2">
        {items.map((o, i) => (
          <li key={i} className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={o.completed}
              onChange={(e) => update(i, { completed: e.target.checked })}
              className="h-4 w-4 shrink-0 accent-accent"
              aria-label="Concluído"
            />
            <input
              type="text"
              value={o.text}
              onChange={(e) => update(i, { text: e.target.value })}
              placeholder="Descreva o objetivo…"
              className="input flex-1"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => remove(i)}
              aria-label="Remover objetivo"
            >
              <Icon name="remove" size={15} />
            </Button>
          </li>
        ))}
      </ul>
      <Button type="button" variant="ghost" size="sm" onClick={add}>
        + Adicionar objetivo
      </Button>
    </div>
  );
}

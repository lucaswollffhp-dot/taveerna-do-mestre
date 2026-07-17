"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

const DICE = [4, 6, 8, 10, 12, 20, 100];

interface Roll {
  id: number;
  label: string;
  rolls: number[];
  mod: number;
  total: number;
}

export function DicePanel() {
  const [qty, setQty] = useState(1);
  const [mod, setMod] = useState(0);
  const [history, setHistory] = useState<Roll[]>([]);

  function roll(sides: number) {
    const rolls = Array.from(
      { length: Math.max(1, Math.min(20, qty)) },
      () => 1 + Math.floor(Math.random() * sides),
    );
    const total = rolls.reduce((a, b) => a + b, 0) + mod;
    const label = `${rolls.length}d${sides}${mod ? (mod > 0 ? `+${mod}` : mod) : ""}`;
    setHistory((h) =>
      [{ id: Date.now(), label, rolls, mod, total }, ...h].slice(0, 12),
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <label className="text-sm text-text-secondary">
          Qtd
          <input
            type="number"
            min={1}
            max={20}
            value={qty}
            onChange={(e) => setQty(parseInt(e.target.value, 10) || 1)}
            className="input ml-2 h-8 w-16 py-1 text-center"
          />
        </label>
        <label className="text-sm text-text-secondary">
          Mod
          <input
            type="number"
            value={mod}
            onChange={(e) => setMod(parseInt(e.target.value, 10) || 0)}
            className="input ml-2 h-8 w-16 py-1 text-center"
          />
        </label>
      </div>

      <div className="flex flex-wrap gap-2">
        {DICE.map((d) => (
          <Button key={d} variant="ghost" size="sm" onClick={() => roll(d)}>
            d{d}
          </Button>
        ))}
      </div>

      {history.length > 0 && (
        <div className="space-y-1.5">
          {history.map((r) => (
            <div
              key={r.id}
              className="flex items-center justify-between rounded-md border border-border bg-surface-raised px-3 py-2"
            >
              <div className="text-sm text-text-secondary">
                <span className="font-mono">{r.label}</span>
                <span className="ml-2 text-xs text-text-muted">
                  [{r.rolls.join(", ")}]
                </span>
              </div>
              <span className="font-title text-xl text-accent">{r.total}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

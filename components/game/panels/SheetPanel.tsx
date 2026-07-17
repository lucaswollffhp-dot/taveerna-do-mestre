"use client";

import { TokenAvatar } from "@/components/ui/TokenAvatar";
import { useLiveRows } from "@/lib/realtime";
import type { Character, Json } from "@/lib/types/database.types";

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-md border border-border bg-bg px-2 py-1.5 text-center">
      <p className="text-[10px] uppercase tracking-wide text-text-muted">
        {label}
      </p>
      <p className="font-title text-text">{value}</p>
    </div>
  );
}

function attrs(a: Json): [string, number][] {
  if (a && typeof a === "object" && !Array.isArray(a)) {
    return Object.entries(a as Record<string, unknown>).map(([k, v]) => [
      k.toUpperCase(),
      Number(v) || 0,
    ]);
  }
  return [];
}

/**
 * Ficha do jogador. O RLS devolve apenas o próprio personagem, então
 * mostramos o primeiro registro retornado.
 */
export function SheetPanel({ campaignId }: { campaignId: string }) {
  const { rows, loading } = useLiveRows<Character>("characters", campaignId, {
    orderBy: "name",
  });

  if (loading) return <p className="text-sm text-text-muted">Carregando…</p>;
  const char = rows[0];
  if (!char)
    return (
      <p className="text-sm text-text-muted">
        Você ainda não tem um personagem nesta campanha.
      </p>
    );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <TokenAvatar name={char.name} imageUrl={char.token_image_url} size={52} />
        <div>
          <p className="font-title text-lg text-text">{char.name}</p>
          <p className="text-sm text-text-secondary">
            {[char.race, char.class].filter(Boolean).join(" ") || "Aventureiro"}{" "}
            · Nível {char.level}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2">
        <Stat label="PV" value={`${char.hp_current}/${char.hp_max}`} />
        <Stat label="CA" value={char.ac} />
        <Stat label="XP" value={char.xp_current} />
        <Stat label="Ouro" value={char.gold} />
      </div>

      {attrs(char.attributes).length > 0 && (
        <div className="grid grid-cols-6 gap-2">
          {attrs(char.attributes).map(([name, value]) => (
            <Stat key={name} label={name} value={value} />
          ))}
        </div>
      )}

      {char.background && (
        <div>
          <h3 className="mb-1 font-title text-text">História</h3>
          <p className="whitespace-pre-wrap text-sm text-text-secondary">
            {char.background}
          </p>
        </div>
      )}
    </div>
  );
}

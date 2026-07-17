"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { EmptyState } from "@/components/ui/EmptyState";
import { TokenAvatar } from "@/components/ui/TokenAvatar";
import { useTable } from "@/lib/table";
import type { Token } from "@/lib/types/database.types";

export interface PaletteEntry {
  id: string;
  name: string;
  token_image_url: string | null;
  /** Para personagens: usuário que controla o token (move o próprio). */
  player_id?: string | null;
}

interface SceneBoardProps {
  campaignId: string;
  /** Cena específica (Mestre). Ausente = cena ativa (Jogador). */
  sceneId?: string;
  isMaster: boolean;
  currentUserId: string;
  characters?: PaletteEntry[];
  npcs?: PaletteEntry[];
}

interface LocalPos {
  id: string;
  x: number;
  y: number;
}

export function SceneBoard({
  campaignId,
  sceneId,
  isMaster,
  currentUserId,
  characters = [],
  npcs = [],
}: SceneBoardProps) {
  const { scene, tokens, loading, refresh } = useTable(campaignId, sceneId);
  const mapRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  const [drag, setDrag] = useState<LocalPos | null>(null);
  const lastWrite = useRef(0);

  const canMove = useCallback(
    (t: Token) => isMaster || t.controlled_by === currentUserId,
    [isMaster, currentUserId],
  );

  const writePos = useCallback(
    async (id: string, x: number, y: number) => {
      await supabase.from("tokens").update({ x, y }).eq("id", id);
    },
    [supabase],
  );

  const posFromEvent = useCallback((clientX: number, clientY: number) => {
    const rect = mapRef.current?.getBoundingClientRect();
    if (!rect) return null;
    const x = ((clientX - rect.left) / rect.width) * 100;
    const y = ((clientY - rect.top) / rect.height) * 100;
    return {
      x: Math.max(0, Math.min(100, x)),
      y: Math.max(0, Math.min(100, y)),
    };
  }, []);

  useEffect(() => {
    if (!drag) return;

    function onMove(e: PointerEvent) {
      const p = posFromEvent(e.clientX, e.clientY);
      if (!p) return;
      setDrag((d) => (d ? { ...d, x: p.x, y: p.y } : d));
      const now = Date.now();
      if (now - lastWrite.current > 90) {
        lastWrite.current = now;
        writePos(drag!.id, p.x, p.y);
      }
    }
    function onUp(e: PointerEvent) {
      const p = posFromEvent(e.clientX, e.clientY);
      if (p) writePos(drag!.id, p.x, p.y);
      setDrag(null);
    }

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [drag, posFromEvent, writePos]);

  function startDrag(t: Token, e: React.PointerEvent) {
    if (!canMove(t)) return;
    e.preventDefault();
    setDrag({ id: t.id, x: t.x, y: t.y });
  }

  async function addToken(entry: PaletteEntry, refType: "character" | "npc") {
    if (!scene) return;
    await supabase.from("tokens").insert({
      scene_id: scene.id,
      campaign_id: campaignId,
      name: entry.name,
      image_url: entry.token_image_url,
      ref_type: refType,
      ref_id: entry.id,
      controlled_by: refType === "character" ? entry.player_id ?? null : null,
      x: 50,
      y: 50,
    });
    await refresh();
  }

  async function addCustom() {
    if (!scene) return;
    const name = window.prompt("Nome do token:");
    if (!name) return;
    await supabase.from("tokens").insert({
      scene_id: scene.id,
      campaign_id: campaignId,
      name,
      ref_type: "custom",
      x: 50,
      y: 50,
    });
    await refresh();
  }

  async function removeToken(id: string) {
    await supabase.from("tokens").delete().eq("id", id);
    await refresh();
  }

  if (loading) {
    return <p className="text-sm text-text-muted">Carregando a mesa…</p>;
  }

  if (!scene) {
    return (
      <EmptyState
        icon="table"
        title={isMaster ? "Nenhuma cena aberta" : "Nenhuma cena ativa"}
        description={
          isMaster
            ? "Crie uma cena e suba um mapa para começar a posicionar tokens."
            : "Assim que o Mestre abrir uma cena, o mapa aparecerá aqui."
        }
      />
    );
  }

  const usedRefIds = new Set(tokens.map((t) => t.ref_id).filter(Boolean));

  return (
    <div className="space-y-4">
      {/* Mapa */}
      <div
        ref={mapRef}
        className="relative w-full select-none overflow-hidden rounded-lg border border-border bg-surface-raised"
        style={{
          aspectRatio: "16 / 10",
          backgroundImage: scene.map_image_url
            ? `url(${scene.map_image_url})`
            : undefined,
          backgroundSize: "contain",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          touchAction: "none",
        }}
      >
        {!scene.map_image_url && (
          <div className="absolute inset-0 flex items-center justify-center text-sm text-text-muted">
            Sem mapa nesta cena
          </div>
        )}
        {tokens.map((t) => {
          const pos = drag && drag.id === t.id ? drag : { x: t.x, y: t.y };
          const movable = canMove(t);
          return (
            <div
              key={t.id}
              onPointerDown={(e) => startDrag(t, e)}
              className={`absolute -translate-x-1/2 -translate-y-1/2 ${
                movable ? "cursor-grab active:cursor-grabbing" : "cursor-default"
              }`}
              style={{
                left: `${pos.x}%`,
                top: `${pos.y}%`,
                touchAction: "none",
              }}
              title={t.name}
            >
              <TokenAvatar
                name={t.name}
                imageUrl={t.image_url}
                color={t.color}
                size={t.size}
              />
              {t.name && (
                <span className="pointer-events-none absolute left-1/2 top-full mt-0.5 -translate-x-1/2 whitespace-nowrap rounded bg-black/70 px-1.5 py-0.5 text-[10px] text-white">
                  {t.name}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Painel do Mestre */}
      {isMaster && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="space-y-3">
            <h2 className="font-title text-lg text-text">Adicionar tokens</h2>
            {characters.length === 0 && npcs.length === 0 && (
              <p className="text-sm text-text-muted">
                Cadastre personagens e NPCs para adicioná-los ao mapa.
              </p>
            )}
            {characters.length > 0 && (
              <div>
                <p className="mb-1 text-xs uppercase tracking-wide text-text-muted">
                  Personagens
                </p>
                <div className="flex flex-wrap gap-2">
                  {characters.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => addToken(c, "character")}
                      disabled={usedRefIds.has(c.id)}
                      className="inline-flex items-center gap-1.5 rounded-full border border-border px-2 py-1 text-xs text-text-secondary transition-colors hover:border-accent/50 hover:text-text disabled:opacity-40"
                    >
                      <TokenAvatar
                        name={c.name}
                        imageUrl={c.token_image_url}
                        size={20}
                      />
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {npcs.length > 0 && (
              <div>
                <p className="mb-1 text-xs uppercase tracking-wide text-text-muted">
                  NPCs
                </p>
                <div className="flex flex-wrap gap-2">
                  {npcs.map((n) => (
                    <button
                      key={n.id}
                      onClick={() => addToken(n, "npc")}
                      disabled={usedRefIds.has(n.id)}
                      className="inline-flex items-center gap-1.5 rounded-full border border-border px-2 py-1 text-xs text-text-secondary transition-colors hover:border-accent/50 hover:text-text disabled:opacity-40"
                    >
                      <TokenAvatar
                        name={n.name}
                        imageUrl={n.token_image_url}
                        size={20}
                      />
                      {n.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <Button variant="ghost" size="sm" onClick={addCustom}>
              <Icon name="add" size={14} />
              Token avulso
            </Button>
          </Card>

          <Card className="space-y-2">
            <h2 className="font-title text-lg text-text">Na cena</h2>
            {tokens.length === 0 ? (
              <p className="text-sm text-text-muted">Nenhum token ainda.</p>
            ) : (
              <ul className="space-y-1.5">
                {tokens.map((t) => (
                  <li
                    key={t.id}
                    className="flex items-center justify-between gap-2"
                  >
                    <span className="flex items-center gap-2 text-sm text-text-secondary">
                      <TokenAvatar
                        name={t.name}
                        imageUrl={t.image_url}
                        color={t.color}
                        size={22}
                      />
                      {t.name || "Sem nome"}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeToken(t.id)}
                      aria-label="Remover token"
                    >
                      <Icon name="remove" size={14} />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      )}

      {!isMaster && (
        <p className="text-xs text-text-muted">
          Arraste o seu token para movê-lo. Os demais se movem em tempo real.
        </p>
      )}
    </div>
  );
}

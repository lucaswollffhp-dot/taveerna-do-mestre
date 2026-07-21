"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Icon } from "@/components/ui/Icon";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { TokenAvatar } from "@/components/ui/TokenAvatar";
import { useLiveRows } from "@/lib/realtime";
import type { PaletteEntry } from "@/components/game/GameEnvironment";
import type { Scene, Token } from "@/lib/types/database.types";

interface ScenePanelProps {
  campaignId: string;
  activeScene: Scene | null;
  tokens: Token[];
  characters: PaletteEntry[];
  npcs: PaletteEntry[];
  onAddToken: (entry: PaletteEntry, refType: "character" | "npc") => void;
  onAddCustom: () => void;
  onRemoveToken: (id: string) => void;
  fogMode: boolean;
  onToggleFogMode: () => void;
  onToggleFog: () => void;
  onCoverAll: () => void;
  onRevealAll: () => void;
}

export function ScenePanel({
  campaignId,
  activeScene,
  tokens,
  characters,
  npcs,
  onAddToken,
  onAddCustom,
  onRemoveToken,
  fogMode,
  onToggleFogMode,
  onToggleFog,
  onCoverAll,
  onRevealAll,
}: ScenePanelProps) {
  const supabase = createClient();
  const { rows: scenes } = useLiveRows<Scene>("scenes", campaignId, {
    orderBy: "created_at",
    ascending: false,
  });

  const [name, setName] = useState("");
  const [mapUrl, setMapUrl] = useState("");
  const [creating, setCreating] = useState(false);

  async function activate(id: string) {
    await supabase
      .from("scenes")
      .update({ is_active: false })
      .eq("campaign_id", campaignId);
    await supabase.from("scenes").update({ is_active: true }).eq("id", id);
  }

  async function remove(id: string) {
    if (!window.confirm("Excluir esta cena?")) return;
    await supabase.from("scenes").delete().eq("id", id);
  }

  async function toggleGrid() {
    if (!activeScene) return;
    await supabase
      .from("scenes")
      .update({ grid_enabled: !activeScene.grid_enabled })
      .eq("id", activeScene.id);
  }

  async function createScene() {
    setCreating(true);
    const isFirst = scenes.length === 0;
    await supabase.from("scenes").insert({
      campaign_id: campaignId,
      name: name.trim() || "Cena",
      map_image_url: mapUrl || null,
      is_active: isFirst,
    });
    setName("");
    setMapUrl("");
    setCreating(false);
  }

  const usedRefIds = new Set(tokens.map((t) => t.ref_id).filter(Boolean));

  return (
    <div className="space-y-6">
      {/* Cenas */}
      <div className="space-y-2">
        <h3 className="font-title text-text">Cenas</h3>
        {scenes.map((s) => (
          <div
            key={s.id}
            className="flex items-center justify-between gap-2 rounded-md border border-border bg-surface-raised p-2"
          >
            <span className="flex items-center gap-2 text-sm text-text-secondary">
              {s.name}
              {s.is_active && <Badge tone="success">Ativa</Badge>}
            </span>
            <div className="flex items-center gap-1">
              {!s.is_active && (
                <Button variant="ghost" size="sm" onClick={() => activate(s.id)}>
                  Ativar
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => remove(s.id)}
                aria-label="Excluir cena"
              >
                <Icon name="remove" size={14} />
              </Button>
            </div>
          </div>
        ))}

        <div className="space-y-2 rounded-md border border-dashed border-border p-3">
          <p className="text-xs uppercase tracking-wide text-text-muted">
            Nova cena
          </p>
          <ImageUpload
            name="scene_map"
            campaignId={campaignId}
            folder="maps"
            shape="rect"
            label="Mapa"
            onChange={setMapUrl}
          />
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nome da cena"
            className="input"
          />
          <Button size="sm" onClick={createScene} disabled={creating}>
            {creating ? "Criando…" : "Criar cena"}
          </Button>
        </div>
      </div>

      {/* Névoa de guerra */}
      {activeScene && (
        <div className="space-y-2 rounded-md border border-border bg-surface-raised p-3">
          <div className="flex items-center justify-between">
            <h3 className="font-title text-text">Névoa de guerra</h3>
            <button
              onClick={onToggleFog}
              className={`rounded-full border px-2.5 py-1 text-xs transition-colors ${
                activeScene.fog_enabled
                  ? "border-accent/50 bg-accent/20 text-accent"
                  : "border-border text-text-muted hover:text-text"
              }`}
            >
              {activeScene.fog_enabled ? "Ativa" : "Desligada"}
            </button>
          </div>
          {activeScene.fog_enabled && (
            <>
              <p className="text-xs text-text-muted">
                No modo revelar, arraste sobre o mapa para descobrir áreas para
                os jogadores.
              </p>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant={fogMode ? "primary" : "ghost"}
                  onClick={onToggleFogMode}
                >
                  <Icon name={fogMode ? "visible" : "hidden"} size={14} />
                  {fogMode ? "Revelando…" : "Revelar áreas"}
                </Button>
                <Button size="sm" variant="ghost" onClick={onCoverAll}>
                  Cobrir tudo
                </Button>
                <Button size="sm" variant="ghost" onClick={onRevealAll}>
                  Revelar tudo
                </Button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Tokens da cena ativa */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="font-title text-text">Tokens na cena ativa</h3>
          {activeScene && (
            <button
              onClick={toggleGrid}
              className={`rounded-full border px-2.5 py-1 text-xs transition-colors ${
                activeScene.grid_enabled
                  ? "border-accent/50 bg-accent/20 text-accent"
                  : "border-border text-text-muted hover:text-text"
              }`}
            >
              Grid {activeScene.grid_enabled ? "ligado" : "desligado"}
            </button>
          )}
        </div>
        {!activeScene ? (
          <p className="text-sm text-text-muted">
            Ative uma cena para posicionar tokens.
          </p>
        ) : (
          <>
            {characters.length > 0 && (
              <div>
                <p className="mb-1 text-xs uppercase tracking-wide text-text-muted">
                  Personagens
                </p>
                <div className="flex flex-wrap gap-2">
                  {characters.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => onAddToken(c, "character")}
                      disabled={usedRefIds.has(c.id)}
                      className="inline-flex items-center gap-1.5 rounded-full border border-border px-2 py-1 text-xs text-text-secondary transition-colors hover:border-accent/50 hover:text-text disabled:opacity-40"
                    >
                      <TokenAvatar
                        name={c.name}
                        imageUrl={c.token_image_url}
                        size={18}
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
                      onClick={() => onAddToken(n, "npc")}
                      disabled={usedRefIds.has(n.id)}
                      className="inline-flex items-center gap-1.5 rounded-full border border-border px-2 py-1 text-xs text-text-secondary transition-colors hover:border-accent/50 hover:text-text disabled:opacity-40"
                    >
                      <TokenAvatar
                        name={n.name}
                        imageUrl={n.token_image_url}
                        size={18}
                      />
                      {n.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <Button variant="ghost" size="sm" onClick={onAddCustom}>
              <Icon name="add" size={14} />
              Token avulso
            </Button>

            {tokens.length > 0 && (
              <ul className="mt-2 space-y-1.5">
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
                        size={20}
                      />
                      {t.name || "Sem nome"}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onRemoveToken(t.id)}
                      aria-label="Remover token"
                    >
                      <Icon name="remove" size={13} />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </div>
    </div>
  );
}

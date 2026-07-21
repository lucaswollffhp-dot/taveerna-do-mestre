"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Icon, type IconName } from "@/components/ui/Icon";
import { useTable } from "@/lib/table";
import { useLiveEncounter } from "@/lib/live";
import { SceneStage } from "./SceneStage";
import { ScenePanel } from "./panels/ScenePanel";
import { CombatPanel } from "./panels/CombatPanel";
import { PartyPanel } from "./panels/PartyPanel";
import { SheetPanel } from "./panels/SheetPanel";
import { QuestsPanel } from "./panels/QuestsPanel";
import { NpcsPanel } from "./panels/NpcsPanel";
import { LocationsPanel } from "./panels/LocationsPanel";
import { DicePanel } from "./panels/DicePanel";
import type { Token } from "@/lib/types/database.types";

export interface PaletteEntry {
  id: string;
  name: string;
  token_image_url: string | null;
  player_id?: string | null;
}

interface GameEnvironmentProps {
  campaignId: string;
  isMaster: boolean;
  currentUserId: string;
  characters?: PaletteEntry[];
  npcs?: PaletteEntry[];
}

interface DockItem {
  key: string;
  label: string;
  icon: IconName;
  render: () => React.ReactNode;
}

export function GameEnvironment({
  campaignId,
  isMaster,
  currentUserId,
  characters = [],
  npcs = [],
}: GameEnvironmentProps) {
  const { scene, tokens, refresh } = useTable(campaignId);
  const { encounter, combatants } = useLiveEncounter(campaignId);
  const supabase = createClient();
  const [open, setOpen] = useState<string | null>(isMaster ? "scene" : null);
  const [fogMode, setFogMode] = useState(false);

  const activeCombatant =
    encounter && combatants.length > 0
      ? combatants[encounter.turn_index % combatants.length]
      : null;
  const activeMatch = activeCombatant
    ? { characterId: activeCombatant.character_id, name: activeCombatant.name }
    : null;

  const canMove = useCallback(
    (t: Token) => isMaster || t.controlled_by === currentUserId,
    [isMaster, currentUserId],
  );

  const persist = useCallback(
    (id: string, x: number, y: number) => {
      supabase.from("tokens").update({ x, y }).eq("id", id);
    },
    [supabase],
  );

  const addToken = useCallback(
    async (entry: PaletteEntry, refType: "character" | "npc") => {
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
    },
    [scene, supabase, campaignId, refresh],
  );

  const addCustom = useCallback(async () => {
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
  }, [scene, supabase, campaignId, refresh]);

  const removeToken = useCallback(
    async (id: string) => {
      await supabase.from("tokens").delete().eq("id", id);
      await refresh();
    },
    [supabase, refresh],
  );

  const updateToken = useCallback(
    async (id: string, patch: { size?: number; rotation?: number }) => {
      await supabase.from("tokens").update(patch).eq("id", id);
      await refresh();
    },
    [supabase, refresh],
  );

  const revealRect = useCallback(
    async (rect: { x: number; y: number; w: number; h: number }) => {
      if (!scene) return;
      const current = Array.isArray(scene.fog_revealed)
        ? (scene.fog_revealed as unknown[])
        : [];
      await supabase
        .from("scenes")
        .update({ fog_revealed: [...current, rect] as never })
        .eq("id", scene.id);
      await refresh();
    },
    [scene, supabase, refresh],
  );

  const setFog = useCallback(
    async (patch: { fog_enabled?: boolean; clear?: boolean }) => {
      if (!scene) return;
      const update: Record<string, unknown> = {};
      if (patch.fog_enabled !== undefined) update.fog_enabled = patch.fog_enabled;
      if (patch.clear) update.fog_revealed = [];
      await supabase.from("scenes").update(update as never).eq("id", scene.id);
      await refresh();
    },
    [scene, supabase, refresh],
  );

  const masterDock: DockItem[] = [
    {
      key: "scene",
      label: "Cena",
      icon: "table",
      render: () => (
        <ScenePanel
          campaignId={campaignId}
          activeScene={scene}
          tokens={tokens}
          characters={characters}
          npcs={npcs}
          onAddToken={addToken}
          onAddCustom={addCustom}
          onRemoveToken={removeToken}
          onUpdateToken={updateToken}
          fogMode={fogMode}
          onToggleFogMode={() => setFogMode((v) => !v)}
          onToggleFog={() => setFog({ fog_enabled: !scene?.fog_enabled })}
          onCoverAll={() => setFog({ fog_enabled: true, clear: true })}
          onRevealAll={() => setFog({ fog_enabled: false, clear: true })}
        />
      ),
    },
    {
      key: "combat",
      label: "Combate",
      icon: "live",
      render: () => <CombatPanel campaignId={campaignId} isMaster />,
    },
    {
      key: "party",
      label: "Grupo",
      icon: "character",
      render: () => <PartyPanel campaignId={campaignId} />,
    },
    {
      key: "quests",
      label: "Missões",
      icon: "quests",
      render: () => <QuestsPanel campaignId={campaignId} />,
    },
    {
      key: "npcs",
      label: "NPCs",
      icon: "npcs",
      render: () => <NpcsPanel campaignId={campaignId} />,
    },
    {
      key: "locations",
      label: "Locais",
      icon: "locations",
      render: () => <LocationsPanel campaignId={campaignId} />,
    },
    {
      key: "dice",
      label: "Dados",
      icon: "dice",
      render: () => <DicePanel />,
    },
  ];

  const playerDock: DockItem[] = [
    {
      key: "sheet",
      label: "Ficha",
      icon: "character",
      render: () => <SheetPanel campaignId={campaignId} />,
    },
    {
      key: "combat",
      label: "Combate",
      icon: "live",
      render: () => <CombatPanel campaignId={campaignId} isMaster={false} />,
    },
    {
      key: "quests",
      label: "Missões",
      icon: "quests",
      render: () => <QuestsPanel campaignId={campaignId} />,
    },
    {
      key: "npcs",
      label: "Conhecidos",
      icon: "npcs",
      render: () => <NpcsPanel campaignId={campaignId} />,
    },
    {
      key: "locations",
      label: "Locais",
      icon: "locations",
      render: () => <LocationsPanel campaignId={campaignId} />,
    },
    {
      key: "dice",
      label: "Dados",
      icon: "dice",
      render: () => <DicePanel />,
    },
  ];

  const dock = isMaster ? masterDock : playerDock;
  const active = dock.find((d) => d.key === open) ?? null;
  const exitHref = isMaster
    ? `/campaign/${campaignId}`
    : `/play/${campaignId}`;

  return (
    <div className="fixed inset-0 z-40 flex flex-col overflow-hidden bg-bg">
      {/* Barra superior mínima */}
      <div className="flex h-11 shrink-0 items-center justify-between border-b border-border bg-surface px-3">
        <Link
          href={exitHref}
          className="inline-flex items-center gap-1.5 text-sm text-text-secondary transition-colors hover:text-accent"
        >
          <Icon name="back" size={16} />
          Sair da mesa
        </Link>
        <span className="truncate font-title text-sm text-text">
          {scene?.name ?? "Sem cena ativa"}
        </span>
        <span className="w-20" />
      </div>

      {/* Corpo: palco + drawer + dock */}
      <div className="flex min-h-0 flex-1">
        {/* Palco */}
        <div className="relative min-w-0 flex-1">
          <SceneStage
            scene={scene}
            tokens={tokens}
            canMove={canMove}
            onPersist={persist}
            isMaster={isMaster}
            fogMode={fogMode}
            onRevealRect={revealRect}
            activeMatch={activeMatch}
          />
        </div>

        {/* Drawer */}
        {active && (
        <aside className="flex w-80 max-w-[85vw] flex-col border-l border-border bg-surface">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div className="flex items-center gap-2">
              <Icon name={active.icon} size={18} className="text-accent" />
              <h2 className="font-title text-text">{active.label}</h2>
            </div>
            <button
              onClick={() => setOpen(null)}
              aria-label="Fechar painel"
              className="text-text-muted hover:text-text"
            >
              <Icon name="remove" size={18} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4">{active.render()}</div>
        </aside>
      )}

      {/* Dock de ícones */}
      <nav className="flex w-16 shrink-0 flex-col items-center gap-1 border-l border-border bg-surface py-3">
        {dock.map((d) => {
          const isOpen = open === d.key;
          return (
            <button
              key={d.key}
              onClick={() => setOpen(isOpen ? null : d.key)}
              className={`flex w-14 flex-col items-center gap-1 rounded-md py-2 text-[10px] transition-colors ${
                isOpen
                  ? "bg-surface-raised text-accent"
                  : "text-text-muted hover:bg-surface-raised hover:text-text"
              }`}
            >
              <Icon name={d.icon} size={20} />
              {d.label}
            </button>
          );
        })}
        </nav>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { EmptyState } from "@/components/ui/EmptyState";
import { useLiveEncounter } from "@/lib/live";
import type { Combatant } from "@/lib/types/database.types";

interface Pc {
  id: string;
  name: string;
  hp_current: number;
  hp_max: number;
  ac: number;
}

interface LivePanelProps {
  campaignId: string;
  pcs: Pc[];
}

export function LivePanel({ campaignId, pcs }: LivePanelProps) {
  const { encounter, combatants, loading, refresh } =
    useLiveEncounter(campaignId);
  const supabase = createClient();

  // Formulário de novo combatente (adversário/NPC).
  const [name, setName] = useState("");
  const [initiative, setInitiative] = useState("");
  const [hp, setHp] = useState("");
  const [ac, setAc] = useState("");

  const activeId =
    encounter && combatants.length > 0
      ? combatants[encounter.turn_index % combatants.length].id
      : null;

  async function startEncounter() {
    await supabase
      .from("encounters")
      .insert({ campaign_id: campaignId, status: "active" });
    await refresh();
  }

  async function endEncounter() {
    if (!encounter) return;
    if (!window.confirm("Encerrar o combate atual?")) return;
    await supabase.from("combatants").delete().eq("encounter_id", encounter.id);
    await supabase
      .from("encounters")
      .update({ status: "ended" })
      .eq("id", encounter.id);
    await refresh();
  }

  async function addCombatant(payload: Partial<Combatant> & { name: string }) {
    if (!encounter) return;
    await supabase.from("combatants").insert({
      encounter_id: encounter.id,
      campaign_id: campaignId,
      initiative: 0,
      hp_current: 0,
      hp_max: 0,
      ac: 10,
      is_pc: false,
      ...payload,
    });
    await refresh();
  }

  async function addNpc() {
    if (!name.trim()) return;
    const maxHp = parseInt(hp, 10) || 0;
    await addCombatant({
      name: name.trim(),
      initiative: parseInt(initiative, 10) || 0,
      hp_current: maxHp,
      hp_max: maxHp,
      ac: parseInt(ac, 10) || 10,
      is_pc: false,
    });
    setName("");
    setInitiative("");
    setHp("");
    setAc("");
  }

  async function addPc(pc: Pc) {
    await addCombatant({
      name: pc.name,
      character_id: pc.id,
      initiative: 0,
      hp_current: pc.hp_current,
      hp_max: pc.hp_max,
      ac: pc.ac,
      is_pc: true,
    });
  }

  async function adjustHp(c: Combatant, delta: number) {
    const next = Math.max(0, c.hp_current + delta);
    await supabase
      .from("combatants")
      .update({ hp_current: next })
      .eq("id", c.id);
    await refresh();
  }

  async function setExactHp(c: Combatant, value: number) {
    const next = Math.max(0, value);
    if (next === c.hp_current) return;
    await supabase
      .from("combatants")
      .update({ hp_current: next })
      .eq("id", c.id);
    await refresh();
  }

  async function setConditions(c: Combatant, value: string) {
    if (value === (c.conditions ?? "")) return;
    await supabase
      .from("combatants")
      .update({ conditions: value.trim() || null })
      .eq("id", c.id);
    await refresh();
  }

  async function removeCombatant(id: string) {
    await supabase.from("combatants").delete().eq("id", id);
    await refresh();
  }

  async function nextTurn() {
    if (!encounter || combatants.length === 0) return;
    let idx = encounter.turn_index + 1;
    let round = encounter.round;
    if (idx >= combatants.length) {
      idx = 0;
      round += 1;
    }
    await supabase
      .from("encounters")
      .update({ turn_index: idx, round })
      .eq("id", encounter.id);
    await refresh();
  }

  if (loading) {
    return <p className="text-sm text-text-muted">Carregando combate…</p>;
  }

  if (!encounter) {
    return (
      <EmptyState
        icon="live"
        title="Nenhum combate ativo"
        description="Inicie um combate para rastrear iniciativa e HP em tempo real. Os jogadores acompanham pela própria tela."
      >
        <Button onClick={startEncounter} className="mt-2">
          Iniciar combate
        </Button>
      </EmptyState>
    );
  }

  const addedCharIds = new Set(
    combatants.filter((c) => c.character_id).map((c) => c.character_id),
  );
  const availablePcs = pcs.filter((p) => !addedCharIds.has(p.id));

  return (
    <div className="space-y-6">
      {/* Controle de rodada */}
      <Card className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Icon name="live" size={22} className="text-accent" />
          <div>
            <p className="font-title text-xl text-text">
              Rodada {encounter.round}
            </p>
            <p className="text-xs text-text-muted">
              {combatants.length} combatente(s)
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={nextTurn} disabled={combatants.length === 0}>
            Próximo turno
          </Button>
          <Button variant="ghost" onClick={endEncounter}>
            Encerrar
          </Button>
        </div>
      </Card>

      {/* Lista de combatentes */}
      {combatants.length === 0 ? (
        <p className="text-sm text-text-muted">
          Adicione combatentes abaixo para começar.
        </p>
      ) : (
        <div className="space-y-2">
          {combatants.map((c) => {
            const active = c.id === activeId;
            return (
              <Card
                key={c.id}
                className={`flex flex-wrap items-center gap-3 ${
                  active ? "border-accent bg-accent/5" : ""
                }`}
              >
                <div className="flex w-12 shrink-0 flex-col items-center">
                  <span className="text-xs text-text-muted">Init</span>
                  <span className="font-title text-lg text-text">
                    {c.initiative}
                  </span>
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {active && (
                      <Badge tone="accent" className="gap-1">
                        <Icon name="live" size={11} />
                        Turno
                      </Badge>
                    )}
                    <span className="font-medium text-text">{c.name}</span>
                    <Badge tone={c.is_pc ? "ally" : "neutral"}>
                      {c.is_pc ? "Jogador" : "Adversário"}
                    </Badge>
                    <span className="text-xs text-text-muted">CA {c.ac}</span>
                  </div>
                  <input
                    type="text"
                    defaultValue={c.conditions ?? ""}
                    onBlur={(e) => setConditions(c, e.target.value)}
                    placeholder="Condições (envenenado, caído…)"
                    className="input mt-2 h-8 py-1 text-xs"
                  />
                </div>

                {/* Controle de HP */}
                <div className="flex items-center gap-1.5">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => adjustHp(c, -1)}
                    aria-label="Reduzir HP"
                  >
                    −
                  </Button>
                  <div className="flex items-baseline gap-0.5">
                    <input
                      type="number"
                      defaultValue={c.hp_current}
                      key={`${c.id}-${c.hp_current}`}
                      onBlur={(e) =>
                        setExactHp(c, parseInt(e.target.value, 10) || 0)
                      }
                      className="input h-8 w-14 py-1 text-center text-sm"
                      aria-label={`HP de ${c.name}`}
                    />
                    <span className="text-sm text-text-muted">/ {c.hp_max}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => adjustHp(c, 1)}
                    aria-label="Aumentar HP"
                  >
                    +
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeCombatant(c.id)}
                    aria-label="Remover combatente"
                  >
                    <Icon name="remove" size={15} />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Adicionar jogadores rapidamente */}
      {availablePcs.length > 0 && (
        <Card className="space-y-2">
          <h2 className="font-title text-lg text-text">Adicionar jogadores</h2>
          <div className="flex flex-wrap gap-2">
            {availablePcs.map((pc) => (
              <Button
                key={pc.id}
                variant="ghost"
                size="sm"
                onClick={() => addPc(pc)}
              >
                <Icon name="add" size={14} />
                {pc.name}
              </Button>
            ))}
          </div>
        </Card>
      )}

      {/* Adicionar adversário */}
      <Card className="space-y-3">
        <h2 className="font-title text-lg text-text">Adicionar adversário</h2>
        <div className="grid gap-2 sm:grid-cols-[1fr_auto_auto_auto_auto]">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nome (ex.: Rato gigante)"
            className="input"
          />
          <input
            type="number"
            value={initiative}
            onChange={(e) => setInitiative(e.target.value)}
            placeholder="Init"
            className="input w-20 text-center"
            aria-label="Iniciativa"
          />
          <input
            type="number"
            value={hp}
            onChange={(e) => setHp(e.target.value)}
            placeholder="HP"
            className="input w-20 text-center"
            aria-label="HP máximo"
          />
          <input
            type="number"
            value={ac}
            onChange={(e) => setAc(e.target.value)}
            placeholder="CA"
            className="input w-20 text-center"
            aria-label="Classe de armadura"
          />
          <Button onClick={addNpc} disabled={!name.trim()}>
            Adicionar
          </Button>
        </div>
      </Card>
    </div>
  );
}

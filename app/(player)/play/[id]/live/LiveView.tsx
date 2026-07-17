"use client";

import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Icon } from "@/components/ui/Icon";
import { EmptyState } from "@/components/ui/EmptyState";
import { useLiveEncounter } from "@/lib/live";
import type { Combatant } from "@/lib/types/database.types";

/** Estado aproximado de um adversário (sem revelar HP exato). */
function enemyStatus(c: Combatant): { label: string; tone: "ally" | "warning" | "danger" | "default" } {
  if (c.hp_max <= 0) return { label: "—", tone: "default" };
  const ratio = c.hp_current / c.hp_max;
  if (ratio <= 0) return { label: "Abatido", tone: "default" };
  if (ratio <= 0.25) return { label: "Grave", tone: "danger" };
  if (ratio <= 0.6) return { label: "Ferido", tone: "warning" };
  return { label: "Saudável", tone: "ally" };
}

export function LiveView({ campaignId }: { campaignId: string }) {
  const { encounter, combatants, loading } = useLiveEncounter(campaignId);

  if (loading) {
    return <p className="text-sm text-text-muted">Carregando…</p>;
  }

  if (!encounter) {
    return (
      <EmptyState
        icon="live"
        title="Nenhum combate em andamento"
        description="Quando o Mestre iniciar um combate, a ordem de iniciativa aparecerá aqui em tempo real."
      />
    );
  }

  const activeId =
    combatants.length > 0
      ? combatants[encounter.turn_index % combatants.length].id
      : null;

  return (
    <div className="space-y-4">
      <Card className="flex items-center gap-3">
        <Icon name="live" size={22} className="text-accent" />
        <div>
          <p className="font-title text-xl text-text">
            Rodada {encounter.round}
          </p>
          <p className="text-xs text-text-muted">Combate em andamento</p>
        </div>
      </Card>

      <div className="space-y-2">
        {combatants.map((c) => {
          const active = c.id === activeId;
          const status = enemyStatus(c);
          return (
            <Card
              key={c.id}
              className={`flex items-center gap-3 ${
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
                </div>
              </div>
              <div className="text-right">
                {c.is_pc ? (
                  <span className="font-title text-sm text-text">
                    {c.hp_current}/{c.hp_max} PV
                  </span>
                ) : (
                  <Badge tone={status.tone}>{status.label}</Badge>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

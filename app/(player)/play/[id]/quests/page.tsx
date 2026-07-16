import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { questStatus, questType } from "@/lib/labels";
import type { Quest, QuestObjective } from "@/lib/types/database.types";

// Colunas públicas da missão (sem notas internas do Mestre).
type PublicQuest = Pick<
  Quest,
  | "id"
  | "title"
  | "description"
  | "type"
  | "status"
  | "objectives"
  | "reward_gold"
  | "reward_xp"
  | "reward_items"
>;

export default async function PlayerQuestsPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("quests")
    .select(
      "id, title, description, type, status, objectives, reward_gold, reward_xp, reward_items",
    )
    .eq("campaign_id", params.id)
    .eq("is_visible_to_players", true)
    .order("created_at", { ascending: false });

  const quests = (data ?? []) as PublicQuest[];

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8 md:px-6">
      <PageHeader
        title="Missões"
        icon="⚔️"
        description="O que está em jogo agora."
        backHref={`/play/${params.id}`}
        backLabel="Visão geral"
      />

      {quests.length === 0 ? (
        <EmptyState
          icon="⚔️"
          title="Nenhuma missão ativa"
          description="Quando seu Mestre liberar contratos e ganchos, eles aparecerão aqui."
        />
      ) : (
        <div className="space-y-4">
          {quests.map((quest) => {
            const objectives = quest.objectives as QuestObjective[];
            return (
              <Card key={quest.id} className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-title text-lg text-text">{quest.title}</h3>
                  <Badge tone={questType.tones[quest.type]}>
                    {questType.labels[quest.type]}
                  </Badge>
                  <Badge tone={questStatus.tones[quest.status]}>
                    {questStatus.labels[quest.status]}
                  </Badge>
                </div>
                {quest.description && (
                  <p className="text-sm text-text-secondary">
                    {quest.description}
                  </p>
                )}
                {objectives.length > 0 && (
                  <ul className="space-y-1">
                    {objectives.map((o, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm">
                        <span aria-hidden>{o.completed ? "☑" : "☐"}</span>
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
                {(quest.reward_gold > 0 ||
                  quest.reward_xp > 0 ||
                  quest.reward_items) && (
                  <p className="flex flex-wrap gap-3 border-t border-border pt-2 text-xs text-text-muted">
                    {quest.reward_gold > 0 && <span>💰 {quest.reward_gold} PO</span>}
                    {quest.reward_xp > 0 && <span>✨ {quest.reward_xp} XP</span>}
                    {quest.reward_items && <span>🎁 {quest.reward_items}</span>}
                  </p>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </main>
  );
}

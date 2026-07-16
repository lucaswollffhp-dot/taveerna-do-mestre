import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { VisibilityControl } from "./VisibilityControl";
import { questStatus, questType } from "@/lib/labels";
import type { Quest, QuestObjective } from "@/lib/types/database.types";

function progress(objectives: QuestObjective[]): string | null {
  if (!objectives.length) return null;
  const done = objectives.filter((o) => o.completed).length;
  return `${done}/${objectives.length}`;
}

export default async function QuestsPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("quests")
    .select("*")
    .eq("campaign_id", params.id)
    .order("created_at", { ascending: false });

  const quests = (data ?? []) as Quest[];
  const base = `/campaign/${params.id}`;

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 md:px-6">
      <PageHeader
        title="Missões"
        icon="⚔️"
        description="Board de missões com objetivos, recompensas e visibilidade."
        backHref={base}
        backLabel="Visão geral"
        actions={
          <Link href={`${base}/quests/new`}>
            <Button>+ Nova missão</Button>
          </Link>
        }
      />

      {quests.length === 0 ? (
        <EmptyState
          icon="⚔️"
          title="Nenhuma missão ainda"
          description="Crie ganchos e contratos para os jogadores perseguirem."
        >
          <Link href={`${base}/quests/new`} className="mt-2">
            <Button>+ Nova missão</Button>
          </Link>
        </EmptyState>
      ) : (
        <div className="space-y-3">
          {quests.map((quest) => {
            const prog = progress(quest.objectives as QuestObjective[]);
            return (
              <Card
                key={quest.id}
                className="flex flex-wrap items-center justify-between gap-4 transition-colors hover:border-accent/50"
              >
                <Link href={`${base}/quests/${quest.id}`} className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-title text-lg text-text">
                      {quest.title}
                    </span>
                    <Badge tone={questType.tones[quest.type]}>
                      {questType.labels[quest.type]}
                    </Badge>
                    <Badge tone={questStatus.tones[quest.status]}>
                      {questStatus.labels[quest.status]}
                    </Badge>
                    {prog && (
                      <span className="text-xs text-text-muted">
                        objetivos {prog}
                      </span>
                    )}
                  </div>
                  {quest.description && (
                    <p className="mt-1 line-clamp-1 text-sm text-text-secondary">
                      {quest.description}
                    </p>
                  )}
                </Link>
                <VisibilityControl
                  campaignId={params.id}
                  questId={quest.id}
                  visible={quest.is_visible_to_players}
                />
              </Card>
            );
          })}
        </div>
      )}
    </main>
  );
}

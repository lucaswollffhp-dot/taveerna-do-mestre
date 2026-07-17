import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import { Icon } from "@/components/ui/Icon";
import { DeleteButton } from "@/components/shared/DeleteButton";
import { VisibilityControl } from "../VisibilityControl";
import { deleteQuest } from "../actions";
import { questStatus, questType } from "@/lib/labels";
import type { Quest, QuestObjective } from "@/lib/types/database.types";

export default async function QuestDetailPage({
  params,
}: {
  params: { id: string; questId: string };
}) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("quests")
    .select("*")
    .eq("id", params.questId)
    .maybeSingle();

  if (!data) {
    notFound();
  }

  const quest = data as Quest;
  const base = `/campaign/${params.id}`;
  const objectives = quest.objectives as QuestObjective[];

  const [contractor, location] = await Promise.all([
    quest.contractor_id
      ? supabase.from("npcs").select("id, name").eq("id", quest.contractor_id).maybeSingle()
      : Promise.resolve({ data: null }),
    quest.location_id
      ? supabase.from("locations").select("id, name").eq("id", quest.location_id).maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  const contractorData = contractor.data as { id: string; name: string } | null;
  const locationData = location.data as { id: string; name: string } | null;
  const hasReward =
    quest.reward_gold > 0 ||
    quest.reward_xp > 0 ||
    quest.reward_items ||
    quest.reward_other;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 md:px-6">
      <PageHeader
        title={quest.title}
        icon="quests"
        backHref={`${base}/quests`}
        backLabel="Missões"
        actions={
          <>
            <Link href={`${base}/quests/${quest.id}/edit`}>
              <Button variant="ghost" size="sm">
                Editar
              </Button>
            </Link>
            <DeleteButton
              action={deleteQuest}
              id={quest.id}
              hidden={{ campaign_id: params.id }}
              confirm={`Excluir "${quest.title}"? Esta ação não pode ser desfeita.`}
            />
          </>
        }
      />

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Badge tone={questType.tones[quest.type]}>
          {questType.labels[quest.type]}
        </Badge>
        <Badge tone={questStatus.tones[quest.status]}>
          {questStatus.labels[quest.status]}
        </Badge>
        <VisibilityControl
          campaignId={params.id}
          questId={quest.id}
          visible={quest.is_visible_to_players}
        />
      </div>

      <div className="space-y-6">
        {quest.description && (
          <Card>
            <p className="whitespace-pre-wrap text-sm text-text-secondary">
              {quest.description}
            </p>
          </Card>
        )}

        {(contractorData || locationData) && (
          <Card className="flex flex-wrap gap-6">
            {contractorData && (
              <div>
                <p className="text-xs uppercase tracking-wide text-text-muted">
                  Contratante
                </p>
                <Link
                  href={`${base}/npcs/${contractorData.id}`}
                  className="inline-flex items-center gap-1.5 text-sm text-accent hover:underline"
                >
                  <Icon name="npcs" size={14} />
                  {contractorData.name}
                </Link>
              </div>
            )}
            {locationData && (
              <div>
                <p className="text-xs uppercase tracking-wide text-text-muted">
                  Local
                </p>
                <Link
                  href={`${base}/locations/${locationData.id}`}
                  className="inline-flex items-center gap-1.5 text-sm text-accent hover:underline"
                >
                  <Icon name="pin" size={14} />
                  {locationData.name}
                </Link>
              </div>
            )}
          </Card>
        )}

        <Card className="space-y-3">
          <h2 className="font-title text-lg text-text">Objetivos</h2>
          {objectives.length === 0 ? (
            <p className="text-sm text-text-muted">Nenhum objetivo definido.</p>
          ) : (
            <ul className="space-y-1.5">
              {objectives.map((o, i) => (
                <li key={i} className="flex items-center gap-2 text-sm">
                  <Icon
                    name={o.completed ? "checkDone" : "checkTodo"}
                    size={16}
                    className={o.completed ? "text-accent" : "text-text-muted"}
                  />
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
        </Card>

        {hasReward && (
          <Card className="space-y-2">
            <h2 className="font-title text-lg text-text">Recompensas</h2>
            <div className="flex flex-wrap gap-4 text-sm text-text-secondary">
              {quest.reward_gold > 0 && (
                <span className="inline-flex items-center gap-1.5">
                  <Icon name="gold" size={15} className="text-accent" />
                  {quest.reward_gold} PO
                </span>
              )}
              {quest.reward_xp > 0 && (
                <span className="inline-flex items-center gap-1.5">
                  <Icon name="xp" size={15} className="text-accent" />
                  {quest.reward_xp} XP
                </span>
              )}
            </div>
            {quest.reward_items && (
              <p className="text-sm text-text-secondary">
                <span className="text-text-muted">Itens:</span> {quest.reward_items}
              </p>
            )}
            {quest.reward_other && (
              <p className="text-sm text-text-secondary">
                <span className="text-text-muted">Outras:</span> {quest.reward_other}
              </p>
            )}
          </Card>
        )}
      </div>
    </main>
  );
}

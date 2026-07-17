import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/PageHeader";
import { QuestForm } from "../../QuestForm";
import { updateQuest } from "../../actions";
import type { Quest } from "@/lib/types/database.types";

export default async function EditQuestPage({
  params,
}: {
  params: { id: string; questId: string };
}) {
  const supabase = await createClient();
  const [{ data: quest }, { data: npcs }, { data: locations }] =
    await Promise.all([
      supabase.from("quests").select("*").eq("id", params.questId).maybeSingle(),
      supabase
        .from("npcs")
        .select("id, name")
        .eq("campaign_id", params.id)
        .order("name"),
      supabase
        .from("locations")
        .select("id, name")
        .eq("campaign_id", params.id)
        .order("name"),
    ]);

  if (!quest) {
    notFound();
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 md:px-6">
      <PageHeader
        title="Editar missão"
        icon="quests"
        backHref={`/campaign/${params.id}/quests/${params.questId}`}
        backLabel={(quest as Quest).title}
      />
      <QuestForm
        campaignId={params.id}
        action={updateQuest}
        npcs={npcs ?? []}
        locations={locations ?? []}
        quest={quest as Quest}
      />
    </main>
  );
}

import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/PageHeader";
import { QuestForm } from "../QuestForm";
import { createQuest } from "../actions";

export default async function NewQuestPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createClient();
  const [{ data: npcs }, { data: locations }] = await Promise.all([
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

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 md:px-6">
      <PageHeader
        title="Nova missão"
        icon="⚔️"
        backHref={`/campaign/${params.id}/quests`}
        backLabel="Missões"
      />
      <QuestForm
        campaignId={params.id}
        action={createQuest}
        npcs={npcs ?? []}
        locations={locations ?? []}
      />
    </main>
  );
}

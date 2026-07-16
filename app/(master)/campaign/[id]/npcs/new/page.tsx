import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/PageHeader";
import { NpcForm } from "../NpcForm";
import { createNpc } from "../actions";

export default async function NewNpcPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createClient();
  const [{ data: factions }, { data: locations }] = await Promise.all([
    supabase
      .from("factions")
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
        title="Novo NPC"
        icon="👤"
        backHref={`/campaign/${params.id}/npcs`}
        backLabel="NPCs"
      />
      <NpcForm
        campaignId={params.id}
        action={createNpc}
        factions={factions ?? []}
        locations={locations ?? []}
      />
    </main>
  );
}

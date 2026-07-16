import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/PageHeader";
import { NpcForm } from "../../NpcForm";
import { updateNpc } from "../../actions";
import type { Npc } from "@/lib/types/database.types";

export default async function EditNpcPage({
  params,
}: {
  params: { id: string; npcId: string };
}) {
  const supabase = await createClient();
  const [{ data: npc }, { data: factions }, { data: locations }] =
    await Promise.all([
      supabase.from("npcs").select("*").eq("id", params.npcId).maybeSingle(),
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

  if (!npc) {
    notFound();
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 md:px-6">
      <PageHeader
        title="Editar NPC"
        icon="👤"
        backHref={`/campaign/${params.id}/npcs/${params.npcId}`}
        backLabel={(npc as Npc).name}
      />
      <NpcForm
        campaignId={params.id}
        action={updateNpc}
        factions={factions ?? []}
        locations={locations ?? []}
        npc={npc as Npc}
      />
    </main>
  );
}

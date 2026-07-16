import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/PageHeader";
import { FactionForm } from "../../FactionForm";
import { updateFaction } from "../../actions";
import type { Faction } from "@/lib/types/database.types";

export default async function EditFactionPage({
  params,
}: {
  params: { id: string; factionId: string };
}) {
  const supabase = await createClient();
  const { data: faction } = await supabase
    .from("factions")
    .select("*")
    .eq("id", params.factionId)
    .maybeSingle();

  if (!faction) {
    notFound();
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 md:px-6">
      <PageHeader
        title="Editar facção"
        icon="⚜️"
        backHref={`/campaign/${params.id}/factions/${params.factionId}`}
        backLabel={(faction as Faction).name}
      />
      <FactionForm
        campaignId={params.id}
        action={updateFaction}
        faction={faction as Faction}
      />
    </main>
  );
}

import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/PageHeader";
import { ItemForm } from "../ItemForm";
import { createItem } from "../actions";
import type { Character } from "@/lib/types/database.types";

export default async function NewItemPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("characters")
    .select("id, name")
    .eq("campaign_id", params.id)
    .order("name");

  const holders = (data ?? []) as Pick<Character, "id" | "name">[];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 md:px-6">
      <PageHeader
        title="Novo item"
        icon="loot"
        backHref={`/campaign/${params.id}/loot`}
        backLabel="Loot"
      />
      <ItemForm
        campaignId={params.id}
        action={createItem}
        holders={holders}
      />
    </main>
  );
}

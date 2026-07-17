import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/PageHeader";
import { ItemForm } from "../../ItemForm";
import { updateItem } from "../../actions";
import type { Character, Item } from "@/lib/types/database.types";

export default async function EditItemPage({
  params,
}: {
  params: { id: string; itemId: string };
}) {
  const supabase = await createClient();

  const [{ data: item }, { data: charsData }] = await Promise.all([
    supabase.from("items").select("*").eq("id", params.itemId).maybeSingle(),
    supabase
      .from("characters")
      .select("id, name")
      .eq("campaign_id", params.id)
      .order("name"),
  ]);

  if (!item) {
    notFound();
  }

  const holders = (charsData ?? []) as Pick<Character, "id" | "name">[];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 md:px-6">
      <PageHeader
        title="Editar item"
        icon="loot"
        backHref={`/campaign/${params.id}/loot/${params.itemId}`}
        backLabel={(item as Item).name}
      />
      <ItemForm
        campaignId={params.id}
        action={updateItem}
        holders={holders}
        item={item as Item}
      />
    </main>
  );
}

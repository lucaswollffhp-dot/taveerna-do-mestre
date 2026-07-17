import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/PageHeader";
import { LocationForm } from "../LocationForm";
import { createLocation } from "../actions";

export default async function NewLocationPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createClient();
  const { data: parents } = await supabase
    .from("locations")
    .select("id, name")
    .eq("campaign_id", params.id)
    .order("name");

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 md:px-6">
      <PageHeader
        title="Novo local"
        icon="locations"
        backHref={`/campaign/${params.id}/locations`}
        backLabel="Locais"
      />
      <LocationForm
        campaignId={params.id}
        action={createLocation}
        parents={parents ?? []}
      />
    </main>
  );
}

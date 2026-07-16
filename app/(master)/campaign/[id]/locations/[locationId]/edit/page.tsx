import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/PageHeader";
import { LocationForm } from "../../LocationForm";
import { updateLocation } from "../../actions";
import type { Location } from "@/lib/types/database.types";

export default async function EditLocationPage({
  params,
}: {
  params: { id: string; locationId: string };
}) {
  const supabase = await createClient();
  const [{ data: location }, { data: parents }] = await Promise.all([
    supabase.from("locations").select("*").eq("id", params.locationId).maybeSingle(),
    supabase
      .from("locations")
      .select("id, name")
      .eq("campaign_id", params.id)
      .order("name"),
  ]);

  if (!location) {
    notFound();
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 md:px-6">
      <PageHeader
        title="Editar local"
        icon="🗺️"
        backHref={`/campaign/${params.id}/locations/${params.locationId}`}
        backLabel={(location as Location).name}
      />
      <LocationForm
        campaignId={params.id}
        action={updateLocation}
        parents={parents ?? []}
        location={location as Location}
      />
    </main>
  );
}

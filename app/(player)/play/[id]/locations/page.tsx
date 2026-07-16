import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { discoveryStatus } from "@/lib/labels";
import type { Location } from "@/lib/types/database.types";

// Apenas colunas públicas — master_notes nunca é selecionado.
type PublicLocation = Pick<
  Location,
  "id" | "name" | "type" | "region" | "public_description" | "discovery_status"
>;

export default async function PlayerLocationsPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("locations")
    .select("id, name, type, region, public_description, discovery_status")
    .eq("campaign_id", params.id)
    .neq("discovery_status", "undiscovered")
    .order("name");

  const locations = (data ?? []) as PublicLocation[];

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8 md:px-6">
      <PageHeader
        title="Locais descobertos"
        icon="🗺️"
        description="Os lugares por onde vocês já passaram ou ouviram falar."
        backHref={`/play/${params.id}`}
        backLabel="Visão geral"
      />

      {locations.length === 0 ? (
        <EmptyState
          icon="🗺️"
          title="Nenhum local ainda"
          description="Explorem o mundo — os lugares que descobrirem aparecerão aqui."
        />
      ) : (
        <div className="space-y-3">
          {locations.map((loc) => (
            <Card key={loc.id}>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-title text-lg text-text">{loc.name}</h3>
                {loc.type && <Badge tone="neutral">{loc.type}</Badge>}
                <Badge tone={discoveryStatus.tones[loc.discovery_status]}>
                  {discoveryStatus.labels[loc.discovery_status]}
                </Badge>
              </div>
              {loc.region && (
                <p className="mt-1 text-xs text-text-muted">{loc.region}</p>
              )}
              {loc.public_description && (
                <p className="mt-1 text-sm text-text-secondary">
                  {loc.public_description}
                </p>
              )}
            </Card>
          ))}
        </div>
      )}
    </main>
  );
}

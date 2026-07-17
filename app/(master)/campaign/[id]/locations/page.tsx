import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import { Icon } from "@/components/ui/Icon";
import { EmptyState } from "@/components/ui/EmptyState";
import { DiscoveryControl } from "./DiscoveryControl";
import { discoveryStatus } from "@/lib/labels";
import type { Location } from "@/lib/types/database.types";

export default async function LocationsPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("locations")
    .select("*")
    .eq("campaign_id", params.id)
    .order("name");

  const locations = (data ?? []) as Location[];
  const base = `/campaign/${params.id}`;

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 md:px-6">
      <PageHeader
        title="Locais"
        icon="locations"
        description="Lugares da campanha, com descoberta progressiva."
        backHref={base}
        backLabel="Visão geral"
        actions={
          <Link href={`${base}/locations/new`}>
            <Button>+ Novo local</Button>
          </Link>
        }
      />

      {locations.length === 0 ? (
        <EmptyState
          icon="locations"
          title="Nenhum local ainda"
          description="Mapeie os lugares por onde a aventura vai passar."
        >
          <Link href={`${base}/locations/new`} className="mt-2">
            <Button>+ Novo local</Button>
          </Link>
        </EmptyState>
      ) : (
        <div className="space-y-3">
          {locations.map((loc) => (
            <Card
              key={loc.id}
              className="flex flex-wrap items-center justify-between gap-4 transition-colors hover:border-accent/50"
            >
              <Link href={`${base}/locations/${loc.id}`} className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-title text-lg text-text">{loc.name}</span>
                  {loc.type && <Badge tone="neutral">{loc.type}</Badge>}
                  {loc.discovery_status === "undiscovered" && (
                    <Badge tone="default" className="gap-1">
                      <Icon name="private" size={11} />
                      Oculto p/ jogadores
                    </Badge>
                  )}
                </div>
                {loc.region && (
                  <p className="mt-1 text-xs text-text-muted">{loc.region}</p>
                )}
                {loc.public_description && (
                  <p className="mt-1 line-clamp-1 text-sm text-text-secondary">
                    {loc.public_description}
                  </p>
                )}
              </Link>
              <div className="flex items-center gap-2">
                <span className="hidden text-xs text-text-muted sm:inline">
                  {discoveryStatus.labels[loc.discovery_status]}
                </span>
                <DiscoveryControl
                  campaignId={params.id}
                  locationId={loc.id}
                  value={loc.discovery_status}
                />
              </div>
            </Card>
          ))}
        </div>
      )}
    </main>
  );
}

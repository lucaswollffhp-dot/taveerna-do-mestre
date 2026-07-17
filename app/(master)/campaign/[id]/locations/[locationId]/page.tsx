import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import { Icon } from "@/components/ui/Icon";
import { PrivacyBadge } from "@/components/shared/PrivacyBadge";
import { DeleteButton } from "@/components/shared/DeleteButton";
import { DiscoveryControl } from "../DiscoveryControl";
import { deleteLocation } from "../actions";
import { discoveryStatus } from "@/lib/labels";
import type { Location, Npc } from "@/lib/types/database.types";

export default async function LocationDetailPage({
  params,
}: {
  params: { id: string; locationId: string };
}) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("locations")
    .select("*")
    .eq("id", params.locationId)
    .maybeSingle();

  if (!data) {
    notFound();
  }

  const location = data as Location;
  const base = `/campaign/${params.id}`;

  const [parent, children, npcs] = await Promise.all([
    location.parent_location_id
      ? supabase
          .from("locations")
          .select("id, name")
          .eq("id", location.parent_location_id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
    supabase
      .from("locations")
      .select("id, name, discovery_status")
      .eq("parent_location_id", location.id)
      .order("name"),
    supabase
      .from("npcs")
      .select("id, name, type")
      .eq("location_id", location.id)
      .order("name"),
  ]);

  const parentData = parent.data as { id: string; name: string } | null;
  const childList = (children.data ?? []) as Pick<
    Location,
    "id" | "name" | "discovery_status"
  >[];
  const npcList = (npcs.data ?? []) as Pick<Npc, "id" | "name" | "type">[];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 md:px-6">
      <PageHeader
        title={location.name}
        icon="locations"
        backHref={`${base}/locations`}
        backLabel="Locais"
        actions={
          <>
            <Link href={`${base}/locations/${location.id}/edit`}>
              <Button variant="ghost" size="sm">
                Editar
              </Button>
            </Link>
            <DeleteButton
              action={deleteLocation}
              id={location.id}
              hidden={{ campaign_id: params.id }}
              confirm={`Excluir "${location.name}"? Esta ação não pode ser desfeita.`}
            />
          </>
        }
      />

      <div className="mb-6 flex flex-wrap items-center gap-3">
        {location.type && <Badge tone="neutral">{location.type}</Badge>}
        <Badge tone={discoveryStatus.tones[location.discovery_status]}>
          {discoveryStatus.labels[location.discovery_status]}
        </Badge>
        {location.region && (
          <span className="text-sm text-text-secondary">{location.region}</span>
        )}
        {parentData && (
          <Link
            href={`${base}/locations/${parentData.id}`}
            className="text-sm text-accent hover:underline"
          >
            ↑ {parentData.name}
          </Link>
        )}
      </div>

      <div className="space-y-6">
        <Card className="space-y-2">
          <h2 className="font-title text-lg text-text">Descrição pública</h2>
          {location.public_description ? (
            <p className="whitespace-pre-wrap text-sm text-text-secondary">
              {location.public_description}
            </p>
          ) : (
            <p className="text-sm text-text-muted">Sem descrição pública.</p>
          )}
        </Card>

        <Card className="field-private space-y-2">
          <div className="flex items-center gap-2">
            <h2 className="font-title text-lg text-text">Notas do Mestre</h2>
            <PrivacyBadge />
          </div>
          {location.master_notes ? (
            <p className="whitespace-pre-wrap text-sm text-text-secondary">
              {location.master_notes}
            </p>
          ) : (
            <p className="text-sm text-text-muted">Nenhuma nota privada.</p>
          )}
        </Card>

        {childList.length > 0 && (
          <Card className="space-y-2">
            <h2 className="font-title text-lg text-text">Sublocais</h2>
            <ul className="space-y-1">
              {childList.map((c) => (
                <li key={c.id}>
                  <Link
                    href={`${base}/locations/${c.id}`}
                    className="text-sm text-text-secondary hover:text-accent"
                  >
                    → {c.name}{" "}
                    <span className="text-xs text-text-muted">
                      ({discoveryStatus.labels[c.discovery_status]})
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
        )}

        {npcList.length > 0 && (
          <Card className="space-y-2">
            <h2 className="font-title text-lg text-text">NPCs neste local</h2>
            <ul className="space-y-1">
              {npcList.map((n) => (
                <li key={n.id}>
                  <Link
                    href={`${base}/npcs/${n.id}`}
                    className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-accent"
                  >
                    <Icon name="npcs" size={14} />
                    {n.name}
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
        )}

        <Card className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-text">Descoberta</p>
            <p className="text-xs text-text-muted">
              Controla se os jogadores conhecem este local.
            </p>
          </div>
          <DiscoveryControl
            campaignId={params.id}
            locationId={location.id}
            value={location.discovery_status}
          />
        </Card>
      </div>
    </main>
  );
}

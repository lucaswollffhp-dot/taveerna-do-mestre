import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { factionRelationship } from "@/lib/labels";
import type { Faction } from "@/lib/types/database.types";

export default async function FactionsPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("factions")
    .select("*")
    .eq("campaign_id", params.id)
    .order("name");

  const factions = (data ?? []) as Faction[];
  const base = `/campaign/${params.id}`;

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 md:px-6">
      <PageHeader
        title="Facções"
        icon="factions"
        description="Organizações e forças que movem o mundo."
        backHref={base}
        backLabel="Visão geral"
        actions={
          <Link href={`${base}/factions/new`}>
            <Button>+ Nova facção</Button>
          </Link>
        }
      />

      {factions.length === 0 ? (
        <EmptyState
          icon="factions"
          title="Nenhuma facção ainda"
          description="Crie organizações para dar profundidade política ao mundo."
        >
          <Link href={`${base}/factions/new`} className="mt-2">
            <Button>+ Nova facção</Button>
          </Link>
        </EmptyState>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {factions.map((faction) => (
            <Link key={faction.id} href={`${base}/factions/${faction.id}`}>
              <Card className="h-full transition-colors hover:border-accent/50">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <h3 className="font-title text-lg text-text">
                    {faction.name}
                  </h3>
                  <Badge tone={factionRelationship.tones[faction.player_relationship]}>
                    {factionRelationship.labels[faction.player_relationship]}
                  </Badge>
                </div>
                {faction.type && (
                  <p className="text-xs text-text-muted">{faction.type}</p>
                )}
                {faction.objectives && (
                  <p className="mt-2 line-clamp-2 text-sm text-text-secondary">
                    {faction.objectives}
                  </p>
                )}
              </Card>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}

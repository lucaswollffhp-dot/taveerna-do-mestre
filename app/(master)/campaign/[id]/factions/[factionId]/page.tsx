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
import { deleteFaction } from "../actions";
import { factionRelationship, npcType } from "@/lib/labels";
import type { Faction, Npc } from "@/lib/types/database.types";

export default async function FactionDetailPage({
  params,
}: {
  params: { id: string; factionId: string };
}) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("factions")
    .select("*")
    .eq("id", params.factionId)
    .maybeSingle();

  if (!data) {
    notFound();
  }

  const faction = data as Faction;
  const base = `/campaign/${params.id}`;

  const { data: members } = await supabase
    .from("npcs")
    .select("id, name, type")
    .eq("faction_id", faction.id)
    .order("name");

  const npcList = (members ?? []) as Pick<Npc, "id" | "name" | "type">[];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 md:px-6">
      <PageHeader
        title={faction.name}
        icon="factions"
        backHref={`${base}/factions`}
        backLabel="Facções"
        actions={
          <>
            <Link href={`${base}/factions/${faction.id}/edit`}>
              <Button variant="ghost" size="sm">
                Editar
              </Button>
            </Link>
            <DeleteButton
              action={deleteFaction}
              id={faction.id}
              hidden={{ campaign_id: params.id }}
              confirm={`Excluir "${faction.name}"? Esta ação não pode ser desfeita.`}
            />
          </>
        }
      />

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Badge tone={factionRelationship.tones[faction.player_relationship]}>
          {factionRelationship.labels[faction.player_relationship]}
        </Badge>
        {faction.type && (
          <span className="text-sm text-text-secondary">{faction.type}</span>
        )}
        {faction.alignment && (
          <span className="text-sm text-text-muted">{faction.alignment}</span>
        )}
      </div>

      <div className="space-y-6">
        <Card className="space-y-2">
          <h2 className="font-title text-lg text-text">Objetivos</h2>
          {faction.objectives ? (
            <p className="whitespace-pre-wrap text-sm text-text-secondary">
              {faction.objectives}
            </p>
          ) : (
            <p className="text-sm text-text-muted">Nenhum objetivo registrado.</p>
          )}
        </Card>

        <Card className="field-private space-y-2">
          <div className="flex items-center gap-2">
            <h2 className="font-title text-lg text-text">Segredos</h2>
            <PrivacyBadge />
          </div>
          {faction.secrets ? (
            <p className="whitespace-pre-wrap text-sm text-text-secondary">
              {faction.secrets}
            </p>
          ) : (
            <p className="text-sm text-text-muted">Nenhum segredo registrado.</p>
          )}
        </Card>

        {npcList.length > 0 && (
          <Card className="space-y-2">
            <h2 className="font-title text-lg text-text">Membros conhecidos</h2>
            <ul className="space-y-1">
              {npcList.map((n) => (
                <li key={n.id} className="flex items-center gap-2">
                  <Link
                    href={`${base}/npcs/${n.id}`}
                    className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-accent"
                  >
                    <Icon name="npcs" size={14} />
                    {n.name}
                  </Link>
                  <Badge tone={npcType.tones[n.type]}>
                    {npcType.labels[n.type]}
                  </Badge>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </div>
    </main>
  );
}

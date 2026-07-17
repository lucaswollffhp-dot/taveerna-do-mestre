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
import { RevelationControl } from "../RevelationControl";
import { deleteNpc } from "../actions";
import { npcType, revelationStatus } from "@/lib/labels";
import type { Npc } from "@/lib/types/database.types";

function Detail({
  label,
  value,
  privateField,
}: {
  label: string;
  value: string | null;
  privateField?: boolean;
}) {
  if (!value) return null;
  return (
    <div className={privateField ? "field-private py-1" : ""}>
      <div className="mb-1 flex items-center gap-2">
        <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
          {label}
        </p>
        {privateField && <PrivacyBadge />}
      </div>
      <p className="whitespace-pre-wrap text-sm text-text-secondary">{value}</p>
    </div>
  );
}

export default async function NpcDetailPage({
  params,
}: {
  params: { id: string; npcId: string };
}) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("npcs")
    .select("*")
    .eq("id", params.npcId)
    .maybeSingle();

  if (!data) {
    notFound();
  }

  const npc = data as Npc;
  const base = `/campaign/${params.id}`;

  // Resolve nomes de facção e local (consultas leves e opcionais).
  const [faction, location] = await Promise.all([
    npc.faction_id
      ? supabase.from("factions").select("name").eq("id", npc.faction_id).maybeSingle()
      : Promise.resolve({ data: null }),
    npc.location_id
      ? supabase.from("locations").select("name").eq("id", npc.location_id).maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 md:px-6">
      <PageHeader
        title={npc.name}
        icon="npcs"
        backHref={`${base}/npcs`}
        backLabel="NPCs"
        actions={
          <>
            <Link href={`${base}/npcs/${npc.id}/edit`}>
              <Button variant="ghost" size="sm">
                Editar
              </Button>
            </Link>
            <DeleteButton
              action={deleteNpc}
              id={npc.id}
              hidden={{ campaign_id: params.id }}
              confirm={`Excluir "${npc.name}"? Esta ação não pode ser desfeita.`}
            />
          </>
        }
      />

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Badge tone={npcType.tones[npc.type]}>{npcType.labels[npc.type]}</Badge>
        <Badge tone={revelationStatus.tones[npc.revelation_status]}>
          {revelationStatus.labels[npc.revelation_status]}
        </Badge>
        {(faction.data as { name: string } | null) && (
          <span className="inline-flex items-center gap-1.5 text-sm text-text-secondary">
            <Icon name="factions" size={14} />
            {(faction.data as { name: string }).name}
          </span>
        )}
        {(location.data as { name: string } | null) && (
          <span className="inline-flex items-center gap-1.5 text-sm text-text-secondary">
            <Icon name="pin" size={14} />
            {(location.data as { name: string }).name}
          </span>
        )}
      </div>

      {npc.aliases && npc.aliases.length > 0 && (
        <p className="mb-6 text-sm italic text-text-muted">
          também conhecido como {npc.aliases.join(", ")}
        </p>
      )}

      <div className="space-y-6">
        <Card className="space-y-4">
          <h2 className="font-title text-lg text-text">Público</h2>
          <Detail label="Descrição física" value={npc.physical_description} />
          {!npc.physical_description && (
            <p className="text-sm text-text-muted">Sem descrição pública.</p>
          )}
        </Card>

        <Card className="space-y-4">
          <div className="flex items-center gap-2">
            <h2 className="font-title text-lg text-text">Notas do Mestre</h2>
            <PrivacyBadge />
          </div>
          <Detail label="História" value={npc.history} privateField />
          <Detail label="Motivações" value={npc.motivations} privateField />
          <Detail label="Segredos" value={npc.secrets} privateField />
          <Detail label="Anotações" value={npc.master_notes} privateField />
          {!npc.history &&
            !npc.motivations &&
            !npc.secrets &&
            !npc.master_notes && (
              <p className="text-sm text-text-muted">
                Nenhuma nota privada registrada.
              </p>
            )}
        </Card>

        <Card className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-text">Revelação</p>
            <p className="text-xs text-text-muted">
              Controla se e o quanto os jogadores conhecem este NPC.
            </p>
          </div>
          <RevelationControl
            campaignId={params.id}
            npcId={npc.id}
            value={npc.revelation_status}
          />
        </Card>
      </div>
    </main>
  );
}

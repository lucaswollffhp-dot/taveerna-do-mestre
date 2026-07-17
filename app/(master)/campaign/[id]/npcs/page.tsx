import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import { Icon } from "@/components/ui/Icon";
import { EmptyState } from "@/components/ui/EmptyState";
import { RevelationControl } from "./RevelationControl";
import { npcType, revelationStatus } from "@/lib/labels";
import type { Npc } from "@/lib/types/database.types";

export default async function NpcsPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("npcs")
    .select("*")
    .eq("campaign_id", params.id)
    .order("name");

  const npcs = (data ?? []) as Npc[];
  const base = `/campaign/${params.id}`;

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 md:px-6">
      <PageHeader
        title="NPCs"
        icon="npcs"
        description="Personagens do mundo — com campos públicos e privados."
        backHref={base}
        backLabel="Visão geral"
        actions={
          <Link href={`${base}/npcs/new`}>
            <Button>+ Novo NPC</Button>
          </Link>
        }
      />

      {npcs.length === 0 ? (
        <EmptyState
          icon="npcs"
          title="Nenhum NPC ainda"
          description="Crie o primeiro personagem do mundo para começar a povoar sua campanha."
        >
          <Link href={`${base}/npcs/new`} className="mt-2">
            <Button>+ Novo NPC</Button>
          </Link>
        </EmptyState>
      ) : (
        <div className="space-y-3">
          {npcs.map((npc) => (
            <Card
              key={npc.id}
              className="flex flex-wrap items-center justify-between gap-4 transition-colors hover:border-accent/50"
            >
              <Link
                href={`${base}/npcs/${npc.id}`}
                className="min-w-0 flex-1"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-title text-lg text-text">
                    {npc.name}
                  </span>
                  <Badge tone={npcType.tones[npc.type]}>
                    {npcType.labels[npc.type]}
                  </Badge>
                  {npc.revelation_status === "unknown" && (
                    <Badge tone="default" className="gap-1">
                      <Icon name="private" size={11} />
                      Oculto p/ jogadores
                    </Badge>
                  )}
                </div>
                {npc.aliases && npc.aliases.length > 0 && (
                  <p className="mt-1 text-xs italic text-text-muted">
                    também conhecido como {npc.aliases.join(", ")}
                  </p>
                )}
                {npc.physical_description && (
                  <p className="mt-1 line-clamp-1 text-sm text-text-secondary">
                    {npc.physical_description}
                  </p>
                )}
              </Link>
              <div className="flex items-center gap-2">
                <span className="hidden text-xs text-text-muted sm:inline">
                  {revelationStatus.labels[npc.revelation_status]}
                </span>
                <RevelationControl
                  campaignId={params.id}
                  npcId={npc.id}
                  value={npc.revelation_status}
                />
              </div>
            </Card>
          ))}
        </div>
      )}
    </main>
  );
}

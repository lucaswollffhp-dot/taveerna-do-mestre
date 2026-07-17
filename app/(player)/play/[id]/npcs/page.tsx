import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { npcType } from "@/lib/labels";
import type { Npc } from "@/lib/types/database.types";

// Apenas colunas públicas — segredos e notas do Mestre nunca são selecionados.
type PublicNpc = Pick<
  Npc,
  "id" | "name" | "aliases" | "type" | "physical_description"
>;

export default async function PlayerNpcsPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("npcs")
    .select("id, name, aliases, type, physical_description")
    .eq("campaign_id", params.id)
    .neq("revelation_status", "unknown")
    .order("name");

  const npcs = (data ?? []) as PublicNpc[];

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8 md:px-6">
      <PageHeader
        title="Personagens conhecidos"
        icon="npcs"
        description="Quem vocês já conheceram nesta jornada."
        backHref={`/play/${params.id}`}
        backLabel="Visão geral"
      />

      {npcs.length === 0 ? (
        <EmptyState
          icon="npcs"
          title="Ninguém ainda"
          description="Conforme vocês avançarem, os personagens que encontrarem aparecerão aqui."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {npcs.map((npc) => (
            <Card key={npc.id}>
              <div className="mb-1 flex flex-wrap items-center gap-2">
                <h3 className="font-title text-lg text-text">{npc.name}</h3>
                <Badge tone={npcType.tones[npc.type]}>
                  {npcType.labels[npc.type]}
                </Badge>
              </div>
              {npc.aliases && npc.aliases.length > 0 && (
                <p className="mb-1 text-xs italic text-text-muted">
                  {npc.aliases.join(", ")}
                </p>
              )}
              {npc.physical_description ? (
                <p className="text-sm text-text-secondary">
                  {npc.physical_description}
                </p>
              ) : (
                <p className="text-sm text-text-muted">
                  Vocês ainda sabem pouco sobre esta pessoa.
                </p>
              )}
            </Card>
          ))}
        </div>
      )}
    </main>
  );
}

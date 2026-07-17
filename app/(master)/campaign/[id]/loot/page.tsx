import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { Icon } from "@/components/ui/Icon";
import { StatusControl } from "./StatusControl";
import { itemStatus } from "@/lib/labels";
import type { Item, Character } from "@/lib/types/database.types";

export default async function LootPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createClient();

  const [{ data: itemsData }, { data: charsData }] = await Promise.all([
    supabase
      .from("items")
      .select("*")
      .eq("campaign_id", params.id)
      .order("is_special", { ascending: false })
      .order("name"),
    supabase
      .from("characters")
      .select("id, name")
      .eq("campaign_id", params.id),
  ]);

  const items = (itemsData ?? []) as Item[];
  const chars = (charsData ?? []) as Pick<Character, "id" | "name">[];
  const holderName = new Map(chars.map((c) => [c.id, c.name]));
  const base = `/campaign/${params.id}`;

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 md:px-6">
      <PageHeader
        title="Loot"
        icon="loot"
        description="Itens, tesouro e recompensas da campanha."
        backHref={base}
        backLabel="Visão geral"
        actions={
          <Link href={`${base}/loot/new`}>
            <Button>+ Novo item</Button>
          </Link>
        }
      />

      {items.length === 0 ? (
        <EmptyState
          icon="loot"
          title="Nenhum item ainda"
          description="Registre tesouros, itens mágicos e recompensas para distribuir ao grupo."
        >
          <Link href={`${base}/loot/new`} className="mt-2">
            <Button>+ Novo item</Button>
          </Link>
        </EmptyState>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <Card
              key={item.id}
              className="flex flex-wrap items-center justify-between gap-4 transition-colors hover:border-accent/50"
            >
              <Link
                href={`${base}/loot/${item.id}`}
                className="min-w-0 flex-1"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-title text-lg text-text">
                    {item.name}
                  </span>
                  {item.is_special && (
                    <Badge tone="accent" className="gap-1">
                      <Icon name="reward" size={11} />
                      Especial
                    </Badge>
                  )}
                  <Badge tone={itemStatus.tones[item.status]}>
                    {itemStatus.labels[item.status]}
                  </Badge>
                </div>
                <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-text-muted">
                  {item.type && <span>{item.type}</span>}
                  {item.value_gp > 0 && (
                    <span className="inline-flex items-center gap-1">
                      <Icon name="gold" size={12} />
                      {item.value_gp} PO
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1">
                    <Icon name="character" size={12} />
                    {item.holder_id
                      ? holderName.get(item.holder_id) ?? "Personagem"
                      : "Tesouro do grupo"}
                  </span>
                </div>
              </Link>
              <StatusControl
                campaignId={params.id}
                itemId={item.id}
                value={item.status}
              />
            </Card>
          ))}
        </div>
      )}
    </main>
  );
}

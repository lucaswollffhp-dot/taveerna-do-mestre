import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import { Icon } from "@/components/ui/Icon";
import { DeleteButton } from "@/components/shared/DeleteButton";
import { deleteItem } from "../actions";
import { itemStatus } from "@/lib/labels";
import type { Item } from "@/lib/types/database.types";

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-text-muted">{label}</p>
      <p className="text-sm text-text-secondary">{value}</p>
    </div>
  );
}

export default async function ItemDetailPage({
  params,
}: {
  params: { id: string; itemId: string };
}) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("items")
    .select("*")
    .eq("id", params.itemId)
    .maybeSingle();

  if (!data) {
    notFound();
  }

  const item = data as Item;
  const base = `/campaign/${params.id}`;

  let holderName: string | null = null;
  if (item.holder_id) {
    const { data: holder } = await supabase
      .from("characters")
      .select("name")
      .eq("id", item.holder_id)
      .maybeSingle();
    holderName = (holder as { name: string } | null)?.name ?? null;
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 md:px-6">
      <PageHeader
        title={item.name}
        icon="loot"
        backHref={`${base}/loot`}
        backLabel="Loot"
        actions={
          <>
            <Link href={`${base}/loot/${item.id}/edit`}>
              <Button variant="ghost" size="sm">
                Editar
              </Button>
            </Link>
            <DeleteButton
              action={deleteItem}
              id={item.id}
              hidden={{ campaign_id: params.id }}
              confirm={`Excluir "${item.name}"? Esta ação não pode ser desfeita.`}
            />
          </>
        }
      />

      <div className="mb-6 flex flex-wrap items-center gap-3">
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

      <div className="space-y-6">
        <Card className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Detail label="Tipo" value={item.type ?? "—"} />
          <Detail
            label="Valor"
            value={item.value_gp > 0 ? `${item.value_gp} PO` : "—"}
          />
          <Detail
            label="Peso"
            value={item.weight_kg > 0 ? `${item.weight_kg} kg` : "—"}
          />
          <Detail
            label="Dono"
            value={holderName ?? "Tesouro do grupo"}
          />
        </Card>

        {item.magical_properties && (
          <Card className="space-y-2">
            <h2 className="font-title text-lg text-text">
              Propriedades mágicas
            </h2>
            <p className="whitespace-pre-wrap text-sm text-text-secondary">
              {item.magical_properties}
            </p>
          </Card>
        )}
      </div>
    </main>
  );
}

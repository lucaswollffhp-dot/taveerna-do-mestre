import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import { DeleteButton } from "@/components/shared/DeleteButton";
import { NewSceneForm } from "./NewSceneForm";
import { setActiveScene, deleteScene } from "./actions";
import type { Scene } from "@/lib/types/database.types";

export default async function ScenesPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("scenes")
    .select("*")
    .eq("campaign_id", params.id)
    .order("created_at", { ascending: false });

  const scenes = (data ?? []) as Scene[];
  const base = `/campaign/${params.id}`;

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 md:px-6">
      <PageHeader
        title="Mesa"
        icon="table"
        description="Cenas com mapa e tokens. Ative a cena que os jogadores devem ver."
        backHref={base}
        backLabel="Visão geral"
      />

      <NewSceneForm campaignId={params.id} />

      {scenes.length === 0 ? (
        <p className="text-sm text-text-muted">
          Nenhuma cena ainda. Crie a primeira acima.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {scenes.map((scene) => (
            <Card key={scene.id} className="space-y-3">
              <div
                className="aspect-video w-full rounded-md border border-border bg-surface-raised bg-contain bg-center bg-no-repeat"
                style={{
                  backgroundImage: scene.map_image_url
                    ? `url(${scene.map_image_url})`
                    : undefined,
                }}
              />
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <h3 className="font-title text-lg text-text">{scene.name}</h3>
                  {scene.is_active && <Badge tone="success">Ativa</Badge>}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Link href={`${base}/scenes/${scene.id}`}>
                  <Button size="sm">Abrir mesa</Button>
                </Link>
                {!scene.is_active && (
                  <form action={setActiveScene}>
                    <input type="hidden" name="campaign_id" value={params.id} />
                    <input type="hidden" name="id" value={scene.id} />
                    <Button type="submit" variant="ghost" size="sm">
                      Ativar
                    </Button>
                  </form>
                )}
                <DeleteButton
                  action={deleteScene}
                  id={scene.id}
                  hidden={{ campaign_id: params.id }}
                  confirm={`Excluir a cena "${scene.name}"?`}
                />
              </div>
            </Card>
          ))}
        </div>
      )}
    </main>
  );
}

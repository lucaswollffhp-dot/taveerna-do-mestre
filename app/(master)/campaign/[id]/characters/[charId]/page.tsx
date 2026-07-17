import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import { TokenAvatar } from "@/components/ui/TokenAvatar";
import { DeleteButton } from "@/components/shared/DeleteButton";
import { deleteCharacter } from "../actions";
import type { Character, Json } from "@/lib/types/database.types";

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-md border border-border bg-bg px-3 py-2 text-center">
      <p className="text-xs uppercase tracking-wide text-text-muted">{label}</p>
      <p className="font-title text-lg text-text">{value}</p>
    </div>
  );
}

function attrs(attributes: Json): [string, number][] {
  if (attributes && typeof attributes === "object" && !Array.isArray(attributes)) {
    return Object.entries(attributes as Record<string, unknown>).map(([k, v]) => [
      k.toUpperCase(),
      Number(v) || 0,
    ]);
  }
  return [];
}

export default async function CharacterDetailPage({
  params,
}: {
  params: { id: string; charId: string };
}) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("characters")
    .select("*")
    .eq("id", params.charId)
    .maybeSingle();

  if (!data) {
    notFound();
  }

  const char = data as Character;
  const base = `/campaign/${params.id}`;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 md:px-6">
      <PageHeader
        title={char.name}
        icon="character"
        backHref={`${base}/characters`}
        backLabel="Personagens"
        actions={
          <>
            <Link href={`${base}/characters/${char.id}/edit`}>
              <Button variant="ghost" size="sm">
                Editar
              </Button>
            </Link>
            <DeleteButton
              action={deleteCharacter}
              id={char.id}
              hidden={{ campaign_id: params.id }}
              confirm={`Excluir "${char.name}"? Esta ação não pode ser desfeita.`}
            />
          </>
        }
      />

      <div className="mb-6 flex items-center gap-4">
        <TokenAvatar name={char.name} imageUrl={char.token_image_url} size={64} />
        <div>
          <p className="text-text-secondary">
            {[char.race, char.class].filter(Boolean).join(" ") || "Aventureiro"}{" "}
            · Nível {char.level}
          </p>
          {char.player_id ? (
            <Badge tone="ally">Vinculado a um jogador</Badge>
          ) : (
            <Badge tone="neutral">Controlado pelo Mestre</Badge>
          )}
        </div>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="PV" value={`${char.hp_current}/${char.hp_max}`} />
          <Stat label="CA" value={char.ac} />
          <Stat label="XP" value={char.xp_current} />
          <Stat label="Ouro" value={char.gold} />
        </div>

        {attrs(char.attributes).length > 0 && (
          <Card className="space-y-3">
            <h2 className="font-title text-lg text-text">Atributos</h2>
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
              {attrs(char.attributes).map(([name, value]) => (
                <Stat key={name} label={name} value={value} />
              ))}
            </div>
          </Card>
        )}

        {char.background && (
          <Card className="space-y-2">
            <h2 className="font-title text-lg text-text">História</h2>
            <p className="whitespace-pre-wrap text-sm text-text-secondary">
              {char.background}
            </p>
          </Card>
        )}

        {char.secrets && (
          <Card className="field-private space-y-2">
            <h2 className="font-title text-lg text-text">Segredos</h2>
            <p className="whitespace-pre-wrap text-sm text-text-secondary">
              {char.secrets}
            </p>
          </Card>
        )}
      </div>
    </main>
  );
}

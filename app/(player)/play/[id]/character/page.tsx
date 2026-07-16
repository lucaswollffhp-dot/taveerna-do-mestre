import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import type { Character } from "@/lib/types/database.types";

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-md border border-border bg-bg px-3 py-2 text-center">
      <p className="text-xs uppercase tracking-wide text-text-muted">{label}</p>
      <p className="font-title text-xl text-text">{value}</p>
    </div>
  );
}

function attributesList(attributes: unknown): [string, number][] {
  if (attributes && typeof attributes === "object" && !Array.isArray(attributes)) {
    return Object.entries(attributes as Record<string, unknown>).map(([k, v]) => [
      k,
      Number(v) || 0,
    ]);
  }
  return [];
}

export default async function PlayerCharacterPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data } = await supabase
    .from("characters")
    .select("*")
    .eq("campaign_id", params.id)
    .eq("player_id", user!.id)
    .maybeSingle();

  if (!data) {
    return (
      <main className="mx-auto w-full max-w-3xl px-4 py-8 md:px-6">
        <PageHeader
          title="Meu personagem"
          icon="🛡️"
          backHref={`/play/${params.id}`}
          backLabel="Visão geral"
        />
        <EmptyState
          icon="🛡️"
          title="Você ainda não tem um personagem"
          description="Seu Mestre criará e vinculará sua ficha a esta campanha. Assim que estiver pronta, ela aparecerá aqui."
        />
      </main>
    );
  }

  const char = data as Character;
  const attrs = attributesList(char.attributes);
  const conditions = Array.isArray(char.conditions)
    ? (char.conditions as string[])
    : [];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 md:px-6">
      <PageHeader
        title={char.name}
        icon="🛡️"
        description={`${char.race ?? ""} ${char.class ?? ""} · Nível ${char.level}`.trim()}
        backHref={`/play/${params.id}`}
        backLabel="Visão geral"
      />

      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="PV" value={`${char.hp_current}/${char.hp_max}`} />
          <Stat label="CA" value={char.ac} />
          <Stat label="XP" value={char.xp_current} />
          <Stat label="Ouro" value={char.gold} />
        </div>

        {conditions.length > 0 && (
          <Card className="space-y-2">
            <h2 className="font-title text-lg text-text">Condições</h2>
            <div className="flex flex-wrap gap-2">
              {conditions.map((c, i) => (
                <Badge key={i} tone="warning">
                  {c}
                </Badge>
              ))}
            </div>
          </Card>
        )}

        {attrs.length > 0 && (
          <Card className="space-y-3">
            <h2 className="font-title text-lg text-text">Atributos</h2>
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
              {attrs.map(([name, value]) => (
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
          <Card className="space-y-2">
            <h2 className="font-title text-lg text-text">
              Segredos do personagem
            </h2>
            <p className="whitespace-pre-wrap text-sm text-text-secondary">
              {char.secrets}
            </p>
          </Card>
        )}
      </div>
    </main>
  );
}

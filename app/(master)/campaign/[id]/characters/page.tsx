import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { TokenAvatar } from "@/components/ui/TokenAvatar";
import type { Character } from "@/lib/types/database.types";

export default async function CharactersPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("characters")
    .select("*")
    .eq("campaign_id", params.id)
    .order("name");

  const characters = (data ?? []) as Character[];
  const base = `/campaign/${params.id}`;

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 md:px-6">
      <PageHeader
        title="Personagens"
        icon="character"
        description="Fichas dos heróis. Cada um vira um token no mapa."
        backHref={base}
        backLabel="Visão geral"
        actions={
          <Link href={`${base}/characters/new`}>
            <Button>+ Novo personagem</Button>
          </Link>
        }
      />

      {characters.length === 0 ? (
        <EmptyState
          icon="character"
          title="Nenhum personagem ainda"
          description="Crie as fichas dos jogadores com a arte do token para usar no mapa."
        >
          <Link href={`${base}/characters/new`} className="mt-2">
            <Button>+ Novo personagem</Button>
          </Link>
        </EmptyState>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {characters.map((char) => (
            <Link key={char.id} href={`${base}/characters/${char.id}`}>
              <Card className="flex items-center gap-3 transition-colors hover:border-accent/50">
                <TokenAvatar
                  name={char.name}
                  imageUrl={char.token_image_url}
                  size={48}
                />
                <div className="min-w-0 flex-1">
                  <p className="font-title text-lg text-text">{char.name}</p>
                  <p className="text-sm text-text-secondary">
                    {[char.race, char.class].filter(Boolean).join(" ") ||
                      "Aventureiro"}{" "}
                    · Nível {char.level}
                  </p>
                </div>
                {char.player_id ? (
                  <Badge tone="ally">Vinculado</Badge>
                ) : (
                  <Badge tone="neutral">Livre</Badge>
                )}
              </Card>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}

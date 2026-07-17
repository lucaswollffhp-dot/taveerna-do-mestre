import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";

const titles: Record<string, string> = {
  sessions: "Sessões",
  npcs: "NPCs",
  locations: "Locais",
  factions: "Facções",
  quests: "Missões",
  loot: "Loot",
  live: "Painel ao Vivo",
  ai: "IA Assistente",
};

/**
 * Placeholder para módulos ainda não implementados (Sprints 2–4).
 * Rotas concretas (ex.: sessions/page.tsx) têm precedência sobre este
 * catch-all quando forem criadas.
 */
export default function ModulePlaceholder({
  params,
}: {
  params: { id: string; module: string[] };
}) {
  const key = params.module[0] ?? "";
  const title = titles[key] ?? "Módulo";

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-12 md:px-6">
      <Card className="flex flex-col items-center gap-3 py-16 text-center">
        <div
          className="flex h-14 w-14 items-center justify-center rounded-full
            border border-border bg-surface-raised text-text-muted"
        >
          <Icon name="construction" size={26} />
        </div>
        <h1 className="font-title text-2xl text-text">{title}</h1>
        <p className="max-w-sm text-sm text-text-secondary">
          Este módulo faz parte dos próximos sprints e será construído em breve.
        </p>
        <Link
          href={`/campaign/${params.id}`}
          className="mt-2 inline-flex items-center gap-1.5 text-sm text-accent hover:underline"
        >
          <Icon name="back" size={15} />
          Voltar à visão geral
        </Link>
      </Card>
    </main>
  );
}

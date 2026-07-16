import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import type { Campaign, CampaignStatus } from "@/lib/types/database.types";

const statusLabels: Record<CampaignStatus, string> = {
  active: "Ativa",
  paused: "Pausada",
  completed: "Concluída",
};

interface ModuleLink {
  href: string;
  label: string;
  icon: string;
  description: string;
}

function modules(base: string): ModuleLink[] {
  return [
    {
      href: `${base}/sessions`,
      label: "Sessões",
      icon: "📜",
      description: "Planeje e registre cada sessão jogada.",
    },
    {
      href: `${base}/npcs`,
      label: "NPCs",
      icon: "👤",
      description: "Personagens do mundo com campos público/privado.",
    },
    {
      href: `${base}/quests`,
      label: "Missões",
      icon: "⚔️",
      description: "Board de missões com objetivos e recompensas.",
    },
    {
      href: `${base}/locations`,
      label: "Locais",
      icon: "🗺️",
      description: "Mapa conceitual dos lugares da campanha.",
    },
    {
      href: `${base}/live`,
      label: "Painel ao Vivo",
      icon: "🎭",
      description: "Conduza a sessão com iniciativa e HP em tempo real.",
    },
    {
      href: `${base}/ai`,
      label: "IA Assistente",
      icon: "✨",
      description: "Improvise NPCs, cenas e consequências com contexto.",
    },
  ];
}

export default async function CampaignHubPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("campaigns")
    .select("*")
    .eq("id", params.id)
    .maybeSingle();

  if (!data) {
    notFound();
  }

  const campaign = data as Campaign;
  const base = `/campaign/${params.id}`;

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 md:px-6">
      <div className="mb-8">
        <div className="mb-2 flex flex-wrap items-center gap-3">
          <h1 className="font-title text-3xl font-bold text-accent">
            {campaign.name}
          </h1>
          <Badge tone={campaign.status === "active" ? "success" : "default"}>
            {statusLabels[campaign.status]}
          </Badge>
        </div>
        {campaign.setting && (
          <p className="text-text-secondary">{campaign.setting}</p>
        )}
        {campaign.tone && (
          <p className="mt-1 text-sm italic text-text-muted">{campaign.tone}</p>
        )}
        {campaign.description && (
          <p className="mt-4 max-w-2xl text-sm text-text-secondary">
            {campaign.description}
          </p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {modules(base).map((mod) => (
          <Link key={mod.href} href={mod.href}>
            <Card className="h-full transition-colors hover:border-accent/50">
              <div className="mb-2 text-2xl" aria-hidden>
                {mod.icon}
              </div>
              <h2 className="font-title text-lg text-text">{mod.label}</h2>
              <p className="mt-1 text-sm text-text-secondary">
                {mod.description}
              </p>
            </Card>
          </Link>
        ))}
      </div>
    </main>
  );
}

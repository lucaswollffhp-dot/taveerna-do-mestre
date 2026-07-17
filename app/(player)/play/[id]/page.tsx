import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Icon, type IconName } from "@/components/ui/Icon";
import { campaignStatus } from "@/lib/labels";
import type { Campaign } from "@/lib/types/database.types";

interface Stat {
  href: string;
  label: string;
  icon: IconName;
  count: number;
}

export default async function PlayOverviewPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data } = await supabase
    .from("campaigns")
    .select("*")
    .eq("id", params.id)
    .maybeSingle();

  if (!data) {
    notFound();
  }

  const campaign = data as Campaign;
  const base = `/play/${params.id}`;

  // Contagens do que já foi liberado (filtros espelham o RLS do jogador,
  // garantindo a mesma visão mesmo quando o Mestre pré-visualiza).
  const [npcs, locations, quests, sessions, character] = await Promise.all([
    supabase
      .from("npcs")
      .select("id", { count: "exact", head: true })
      .eq("campaign_id", params.id)
      .neq("revelation_status", "unknown"),
    supabase
      .from("locations")
      .select("id", { count: "exact", head: true })
      .eq("campaign_id", params.id)
      .neq("discovery_status", "undiscovered"),
    supabase
      .from("quests")
      .select("id", { count: "exact", head: true })
      .eq("campaign_id", params.id)
      .eq("is_visible_to_players", true),
    supabase
      .from("sessions")
      .select("id", { count: "exact", head: true })
      .eq("campaign_id", params.id)
      .eq("status", "played"),
    supabase
      .from("characters")
      .select("id, name, level, class")
      .eq("campaign_id", params.id)
      .eq("player_id", user!.id)
      .maybeSingle(),
  ]);

  const stats: Stat[] = [
    {
      href: `${base}/quests`,
      label: "Missões",
      icon: "quests",
      count: quests.count ?? 0,
    },
    {
      href: `${base}/npcs`,
      label: "Conhecidos",
      icon: "npcs",
      count: npcs.count ?? 0,
    },
    {
      href: `${base}/locations`,
      label: "Locais",
      icon: "locations",
      count: locations.count ?? 0,
    },
    {
      href: `${base}/sessions`,
      label: "Sessões",
      icon: "sessions",
      count: sessions.count ?? 0,
    },
  ];

  const char = character.data as
    | { id: string; name: string; level: number; class: string | null }
    | null;

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8 md:px-6">
      <div className="mb-8">
        <div className="mb-2 flex flex-wrap items-center gap-3">
          <h1 className="font-title text-3xl font-bold text-accent">
            {campaign.name}
          </h1>
          <Badge tone={campaignStatus.tones[campaign.status]}>
            {campaignStatus.labels[campaign.status]}
          </Badge>
        </div>
        {campaign.setting && (
          <p className="text-text-secondary">{campaign.setting}</p>
        )}
        {campaign.tone && (
          <p className="mt-1 text-sm italic text-text-muted">{campaign.tone}</p>
        )}
      </div>

      {char && (
        <Link href={`${base}/character`}>
          <Card className="mb-6 flex items-center justify-between transition-colors hover:border-accent/50">
            <div className="flex items-center gap-3">
              <span className="text-accent" aria-hidden>
                <Icon name="character" size={26} />
              </span>
              <div>
                <p className="font-title text-lg text-text">{char.name}</p>
                <p className="text-sm text-text-secondary">
                  {char.class ?? "Aventureiro"} · Nível {char.level}
                </p>
              </div>
            </div>
            <span className="text-sm text-accent">Ver ficha →</span>
          </Card>
        </Link>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link key={stat.href} href={stat.href}>
            <Card className="h-full text-center transition-colors hover:border-accent/50">
              <div className="flex justify-center text-accent">
                <Icon name={stat.icon} size={24} />
              </div>
              <p className="mt-2 font-title text-2xl text-text">{stat.count}</p>
              <p className="text-sm text-text-secondary">{stat.label}</p>
            </Card>
          </Link>
        ))}
      </div>
    </main>
  );
}

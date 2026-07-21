import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Icon, type IconName } from "@/components/ui/Icon";
import { campaignStatus, sessionStatus } from "@/lib/labels";
import type { Campaign, Session } from "@/lib/types/database.types";

interface StatDef {
  href: string;
  label: string;
  icon: IconName;
  value: number;
}

export default async function CampaignPanelPage({
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
  const cid = params.id;
  const head = { count: "exact" as const, head: true };

  const [characters, npcs, locations, quests, sessionsPlayed, loot, lastSession] =
    await Promise.all([
      supabase.from("characters").select("id", head).eq("campaign_id", cid),
      supabase.from("npcs").select("id", head).eq("campaign_id", cid),
      supabase.from("locations").select("id", head).eq("campaign_id", cid),
      supabase
        .from("quests")
        .select("id", head)
        .eq("campaign_id", cid)
        .eq("status", "active"),
      supabase
        .from("sessions")
        .select("id", head)
        .eq("campaign_id", cid)
        .eq("status", "played"),
      supabase.from("items").select("id", head).eq("campaign_id", cid),
      supabase
        .from("sessions")
        .select("*")
        .eq("campaign_id", cid)
        .order("number", { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);

  const session = lastSession.data as Session | null;

  const stats: StatDef[] = [
    { href: `${base}/characters`, label: "Personagens", icon: "character", value: characters.count ?? 0 },
    { href: `${base}/npcs`, label: "NPCs", icon: "npcs", value: npcs.count ?? 0 },
    { href: `${base}/locations`, label: "Locais", icon: "locations", value: locations.count ?? 0 },
    { href: `${base}/quests`, label: "Missões ativas", icon: "quests", value: quests.count ?? 0 },
    { href: `${base}/sessions`, label: "Sessões", icon: "sessions", value: sessionsPlayed.count ?? 0 },
    { href: `${base}/loot`, label: "Itens", icon: "loot", value: loot.count ?? 0 },
  ];

  const quickAdds: { href: string; label: string; icon: IconName }[] = [
    { href: `${base}/characters/new`, label: "Personagem", icon: "character" },
    { href: `${base}/npcs/new`, label: "NPC", icon: "npcs" },
    { href: `${base}/quests/new`, label: "Missão", icon: "quests" },
    { href: `${base}/locations/new`, label: "Local", icon: "locations" },
  ];

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 md:px-6">
      {/* Cabeçalho da campanha */}
      <div className="relative mb-8 overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-[#23202e] via-[#1c1a26] to-[#191622] p-6">
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "radial-gradient(600px 200px at 90% -20%, rgba(184,134,11,.18), transparent 60%)",
          }}
        />
        <div className="relative flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="mb-1 flex flex-wrap items-center gap-3">
              <h1 className="font-title text-3xl font-bold text-text">
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
              <p className="mt-0.5 text-sm italic text-text-muted">
                {campaign.tone}
              </p>
            )}
          </div>
          <Link href={`${base}/mesa`} className="shrink-0">
            <Button variant="accent" size="lg">
              <Icon name="table" size={18} />
              Abrir a Mesa
            </Button>
          </Link>
        </div>
        {campaign.description && (
          <p className="relative mt-4 max-w-2xl text-sm leading-relaxed text-text-secondary">
            {campaign.description}
          </p>
        )}
      </div>

      {/* Estatísticas */}
      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {stats.map((s) => (
          <Link key={s.href} href={s.href} className="group">
            <div className="stat-tile transition-colors group-hover:border-accent/40">
              <div className="flex items-center justify-between">
                <Icon name={s.icon} size={18} className="text-accent" />
                <span className="font-title text-2xl text-text">{s.value}</span>
              </div>
              <p className="text-xs text-text-secondary">{s.label}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Continuar de onde parou */}
        <Card className="space-y-3">
          <h2 className="flex items-center gap-2 font-title text-lg text-text">
            <Icon name="sessions" size={18} className="text-accent" />
            Última sessão
          </h2>
          {session ? (
            <div>
              <div className="mb-1 flex items-center gap-2">
                <span className="font-medium text-text">
                  #{session.number} · {session.title}
                </span>
                <Badge tone={sessionStatus.tones[session.status]}>
                  {sessionStatus.labels[session.status]}
                </Badge>
              </div>
              {session.public_summary && (
                <p className="line-clamp-3 text-sm text-text-secondary">
                  {session.public_summary}
                </p>
              )}
              <Link
                href={`${base}/sessions/${session.id}`}
                className="mt-2 inline-block text-sm text-accent hover:underline"
              >
                Ver sessão →
              </Link>
            </div>
          ) : (
            <p className="text-sm text-text-muted">
              Nenhuma sessão registrada ainda.{" "}
              <Link
                href={`${base}/sessions/new`}
                className="text-accent hover:underline"
              >
                Planejar a primeira →
              </Link>
            </p>
          )}
        </Card>

        {/* Ações rápidas */}
        <Card className="space-y-3">
          <h2 className="flex items-center gap-2 font-title text-lg text-text">
            <Icon name="add" size={18} className="text-accent" />
            Adicionar rápido
          </h2>
          <div className="grid grid-cols-2 gap-2">
            {quickAdds.map((a) => (
              <Link
                key={a.href}
                href={a.href}
                className="flex items-center gap-2 rounded-lg border border-border bg-surface-raised px-3 py-2.5 text-sm text-text-secondary transition-colors hover:border-accent/40 hover:text-text"
              >
                <Icon name={a.icon} size={16} className="text-accent" />
                {a.label}
              </Link>
            ))}
          </div>
        </Card>
      </div>
    </main>
  );
}

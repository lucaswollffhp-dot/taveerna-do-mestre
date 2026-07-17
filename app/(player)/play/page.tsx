import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { campaignStatus, memberRole } from "@/lib/labels";
import type {
  Campaign,
  CampaignMember,
  MemberRole,
} from "@/lib/types/database.types";

export default async function PlayHomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Mesas onde o usuário participa (como jogador, mestre ou espectador).
  const { data: memberships } = await supabase
    .from("campaign_members")
    .select("campaign_id, role")
    .eq("user_id", user!.id);

  const members = (memberships ?? []) as Pick<
    CampaignMember,
    "campaign_id" | "role"
  >[];
  const roleById = new Map<string, MemberRole>(
    members.map((m) => [m.campaign_id, m.role]),
  );
  const ids = members.map((m) => m.campaign_id);

  const { data: campaignData } = ids.length
    ? await supabase.from("campaigns").select("*").in("id", ids).order("name")
    : { data: [] };

  const campaigns = (campaignData ?? []) as Campaign[];

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 md:px-6">
      <div className="mb-8">
        <h1 className="font-title text-2xl font-bold text-text">Minhas mesas</h1>
        <p className="mt-1 text-sm text-text-secondary">
          As campanhas em que você participa como jogador.
        </p>
      </div>

      {campaigns.length === 0 ? (
        <EmptyState
          icon="dice"
          title="Você ainda não está em nenhuma mesa"
          description="Peça ao seu Mestre para adicionar você a uma campanha. Assim que for convidado, ela aparecerá aqui."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {campaigns.map((campaign) => {
            const role = roleById.get(campaign.id) ?? "player";
            return (
              <Link key={campaign.id} href={`/play/${campaign.id}`}>
                <Card className="h-full transition-colors hover:border-accent/50">
                  <div className="mb-3 flex items-start justify-between gap-2">
                    <h3 className="font-title text-lg text-text">
                      {campaign.name}
                    </h3>
                    <Badge tone={campaignStatus.tones[campaign.status]}>
                      {campaignStatus.labels[campaign.status]}
                    </Badge>
                  </div>
                  {campaign.setting && (
                    <p className="text-sm text-text-secondary">
                      {campaign.setting}
                    </p>
                  )}
                  <p className="mt-4">
                    <Badge tone={memberRole.tones[role]}>
                      {memberRole.labels[role]}
                    </Badge>
                  </p>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}

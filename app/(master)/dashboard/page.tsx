import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { NewCampaignForm } from "./NewCampaignForm";
import type { Campaign, CampaignStatus } from "@/lib/types/database.types";

const statusLabels: Record<CampaignStatus, string> = {
  active: "Ativa",
  paused: "Pausada",
  completed: "Concluída",
};

const statusTone: Record<
  CampaignStatus,
  "success" | "warning" | "default"
> = {
  active: "success",
  paused: "warning",
  completed: "default",
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Campanhas onde o usuário é o Mestre (dono).
  const { data, error } = await supabase
    .from("campaigns")
    .select("*")
    .eq("master_id", user!.id)
    .order("created_at", { ascending: false });

  const campaigns = (data ?? []) as Campaign[];

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 md:px-6">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-title text-2xl font-bold text-text">
            Suas campanhas
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            Escolha uma campanha para conduzir ou crie uma nova.
          </p>
        </div>
        <NewCampaignForm />
      </div>

      {error && (
        <Card className="mb-6 border-primary/40">
          <p className="text-sm text-red-300">
            Não foi possível carregar as campanhas. Verifique se o Supabase
            está configurado em <code>.env.local</code> e se as migrations
            foram aplicadas.
          </p>
        </Card>
      )}

      {campaigns.length === 0 && !error ? (
        <Card className="flex flex-col items-center gap-3 py-16 text-center">
          <div className="text-4xl" aria-hidden>
            🗺️
          </div>
          <h2 className="font-title text-lg text-text">
            Nenhuma campanha ainda
          </h2>
          <p className="max-w-sm text-sm text-text-secondary">
            Crie sua primeira campanha para começar a planejar sessões, NPCs,
            missões e muito mais.
          </p>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {campaigns.map((campaign) => (
            <Link key={campaign.id} href={`/campaign/${campaign.id}`}>
              <Card className="h-full transition-colors hover:border-accent/50">
                <div className="mb-3 flex items-start justify-between gap-2">
                  <h3 className="font-title text-lg text-text">
                    {campaign.name}
                  </h3>
                  <Badge tone={statusTone[campaign.status]}>
                    {statusLabels[campaign.status]}
                  </Badge>
                </div>
                {campaign.setting && (
                  <p className="text-sm text-text-secondary">
                    {campaign.setting}
                  </p>
                )}
                {campaign.tone && (
                  <p className="mt-1 text-xs italic text-text-muted">
                    {campaign.tone}
                  </p>
                )}
                <p className="mt-4 font-mono text-xs text-text-muted">
                  {campaign.system}
                </p>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}

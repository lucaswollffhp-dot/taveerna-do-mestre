import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/PageHeader";
import { LivePanel } from "./LivePanel";
import type { Character } from "@/lib/types/database.types";

export default async function LivePage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createClient();

  const { data: campaign } = await supabase
    .from("campaigns")
    .select("id")
    .eq("id", params.id)
    .maybeSingle();

  if (!campaign) {
    notFound();
  }

  const { data } = await supabase
    .from("characters")
    .select("id, name, hp_current, hp_max, ac")
    .eq("campaign_id", params.id)
    .order("name");

  const pcs = (data ?? []) as Pick<
    Character,
    "id" | "name" | "hp_current" | "hp_max" | "ac"
  >[];

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8 md:px-6">
      <PageHeader
        title="Painel ao Vivo"
        icon="live"
        description="Rastreie iniciativa e HP em tempo real. Os jogadores acompanham pela própria tela."
        backHref={`/campaign/${params.id}`}
        backLabel="Visão geral"
      />
      <LivePanel campaignId={params.id} pcs={pcs} />
    </main>
  );
}

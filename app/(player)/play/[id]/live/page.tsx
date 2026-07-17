import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/PageHeader";
import { LiveView } from "./LiveView";

export default async function PlayerLivePage({
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

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 md:px-6">
      <PageHeader
        title="Painel ao Vivo"
        icon="live"
        description="Acompanhe a iniciativa e o combate em tempo real."
        backHref={`/play/${params.id}`}
        backLabel="Visão geral"
      />
      <LiveView campaignId={params.id} />
    </main>
  );
}

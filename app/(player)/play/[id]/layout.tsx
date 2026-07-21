import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PlayerSidebar } from "@/components/shared/PlayerSidebar";

export default async function PlayCampaignLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { id: string };
}) {
  const supabase = await createClient();

  // Só entra quem tem visibilidade da campanha (RLS: membro ou mestre).
  const { data: campaign } = await supabase
    .from("campaigns")
    .select("id, name")
    .eq("id", params.id)
    .maybeSingle();

  if (!campaign) {
    notFound();
  }

  return (
    <div className="flex flex-1">
      <PlayerSidebar
        campaignId={params.id}
        campaignName={(campaign as { name: string }).name}
      />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

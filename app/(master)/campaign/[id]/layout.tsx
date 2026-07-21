import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/shared/Sidebar";

export default async function CampaignLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { id: string };
}) {
  const supabase = await createClient();
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
      <Sidebar
        campaignId={params.id}
        campaignName={(campaign as { name: string }).name}
      />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

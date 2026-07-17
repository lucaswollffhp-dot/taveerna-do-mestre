import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { GameEnvironment } from "@/components/game/GameEnvironment";

export default async function PlayerTablePage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createClient();
  const [{ data: campaign }, { data: auth }] = await Promise.all([
    supabase.from("campaigns").select("id").eq("id", params.id).maybeSingle(),
    supabase.auth.getUser(),
  ]);

  if (!campaign) {
    notFound();
  }

  return (
    <GameEnvironment
      campaignId={params.id}
      isMaster={false}
      currentUserId={auth.user!.id}
    />
  );
}

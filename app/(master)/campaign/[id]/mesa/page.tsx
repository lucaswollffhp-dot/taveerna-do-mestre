import { createClient } from "@/lib/supabase/server";
import { GameEnvironment, type PaletteEntry } from "@/components/game/GameEnvironment";

export default async function MasterGamePage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createClient();
  const [{ data: auth }, { data: chars }, { data: npcsData }] =
    await Promise.all([
      supabase.auth.getUser(),
      supabase
        .from("characters")
        .select("id, name, token_image_url, player_id")
        .eq("campaign_id", params.id)
        .order("name"),
      supabase
        .from("npcs")
        .select("id, name, token_image_url")
        .eq("campaign_id", params.id)
        .order("name"),
    ]);

  return (
    <GameEnvironment
      campaignId={params.id}
      isMaster
      currentUserId={auth.user!.id}
      characters={(chars ?? []) as PaletteEntry[]}
      npcs={(npcsData ?? []) as PaletteEntry[]}
    />
  );
}

import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/PageHeader";
import { SceneBoard, type PaletteEntry } from "@/components/table/SceneBoard";
import type { Scene } from "@/lib/types/database.types";

export default async function SceneBoardPage({
  params,
}: {
  params: { id: string; sceneId: string };
}) {
  const supabase = await createClient();

  const [{ data: scene }, { data: auth }, { data: chars }, { data: npcsData }] =
    await Promise.all([
      supabase.from("scenes").select("*").eq("id", params.sceneId).maybeSingle(),
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

  if (!scene) {
    notFound();
  }

  const characters = (chars ?? []) as PaletteEntry[];
  const npcs = (npcsData ?? []) as PaletteEntry[];

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 md:px-6">
      <PageHeader
        title={(scene as Scene).name}
        icon="live"
        description="Arraste os tokens. Tudo é sincronizado com os jogadores em tempo real."
        backHref={`/campaign/${params.id}/scenes`}
        backLabel="Cenas"
      />
      <SceneBoard
        campaignId={params.id}
        sceneId={params.sceneId}
        isMaster
        currentUserId={auth.user!.id}
        characters={characters}
        npcs={npcs}
      />
    </main>
  );
}

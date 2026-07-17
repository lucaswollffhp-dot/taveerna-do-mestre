import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/PageHeader";
import { SceneBoard } from "@/components/table/SceneBoard";

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
    <main className="mx-auto w-full max-w-5xl px-4 py-8 md:px-6">
      <PageHeader
        title="Mesa"
        icon="table"
        description="O mapa da cena atual. Arraste o seu token para movê-lo."
        backHref={`/play/${params.id}`}
        backLabel="Visão geral"
      />
      <SceneBoard
        campaignId={params.id}
        isMaster={false}
        currentUserId={auth.user!.id}
      />
    </main>
  );
}

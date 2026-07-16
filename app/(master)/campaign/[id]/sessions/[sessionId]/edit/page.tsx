import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/PageHeader";
import { SessionForm } from "../../SessionForm";
import { updateSession } from "../../actions";
import type { Session } from "@/lib/types/database.types";

export default async function EditSessionPage({
  params,
}: {
  params: { id: string; sessionId: string };
}) {
  const supabase = await createClient();
  const { data: session } = await supabase
    .from("sessions")
    .select("*")
    .eq("id", params.sessionId)
    .maybeSingle();

  if (!session) {
    notFound();
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 md:px-6">
      <PageHeader
        title="Editar sessão"
        icon="📜"
        backHref={`/campaign/${params.id}/sessions/${params.sessionId}`}
        backLabel={(session as Session).title}
      />
      <SessionForm
        campaignId={params.id}
        action={updateSession}
        session={session as Session}
      />
    </main>
  );
}

import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/PageHeader";
import { SessionForm } from "../SessionForm";
import { createSession } from "../actions";

export default async function NewSessionPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("sessions")
    .select("number")
    .eq("campaign_id", params.id)
    .order("number", { ascending: false })
    .limit(1)
    .maybeSingle();

  const suggested = ((data as { number: number } | null)?.number ?? 0) + 1;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 md:px-6">
      <PageHeader
        title="Nova sessão"
        icon="sessions"
        backHref={`/campaign/${params.id}/sessions`}
        backLabel="Sessões"
      />
      <SessionForm
        campaignId={params.id}
        action={createSession}
        suggestedNumber={suggested}
      />
    </main>
  );
}

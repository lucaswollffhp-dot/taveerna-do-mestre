import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import type { Session } from "@/lib/types/database.types";

// Só resumo público — master_notes e decisões não são selecionados.
type PublicSession = Pick<
  Session,
  "id" | "number" | "title" | "session_date" | "public_summary"
>;

export default async function PlayerSessionsPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("sessions")
    .select("id, number, title, session_date, public_summary")
    .eq("campaign_id", params.id)
    .eq("status", "played")
    .order("number", { ascending: false });

  const sessions = (data ?? []) as PublicSession[];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 md:px-6">
      <PageHeader
        title="Diário de campanha"
        icon="sessions"
        description="O relato das sessões que já jogaram."
        backHref={`/play/${params.id}`}
        backLabel="Visão geral"
      />

      {sessions.length === 0 ? (
        <EmptyState
          icon="sessions"
          title="Nenhuma sessão registrada"
          description="Depois da primeira sessão jogada, o resumo aparecerá aqui."
        />
      ) : (
        <div className="space-y-4">
          {sessions.map((session) => (
            <Card key={session.id}>
              <div className="mb-1 flex flex-wrap items-center gap-2">
                <span className="font-mono text-sm text-text-muted">
                  #{session.number}
                </span>
                <h3 className="font-title text-lg text-text">{session.title}</h3>
                {session.session_date && (
                  <span className="text-xs text-text-muted">
                    {session.session_date}
                  </span>
                )}
              </div>
              {session.public_summary ? (
                <p className="whitespace-pre-wrap text-sm text-text-secondary">
                  {session.public_summary}
                </p>
              ) : (
                <p className="text-sm text-text-muted">
                  Sessão jogada — sem resumo publicado.
                </p>
              )}
            </Card>
          ))}
        </div>
      )}
    </main>
  );
}

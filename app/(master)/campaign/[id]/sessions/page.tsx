import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { sessionStatus } from "@/lib/labels";
import type { Session } from "@/lib/types/database.types";

export default async function SessionsPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("sessions")
    .select("*")
    .eq("campaign_id", params.id)
    .order("number", { ascending: false });

  const sessions = (data ?? []) as Session[];
  const base = `/campaign/${params.id}`;

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 md:px-6">
      <PageHeader
        title="Sessões"
        icon="sessions"
        description="Planeje e registre cada sessão da campanha."
        backHref={base}
        backLabel="Visão geral"
        actions={
          <Link href={`${base}/sessions/new`}>
            <Button>+ Nova sessão</Button>
          </Link>
        }
      />

      {sessions.length === 0 ? (
        <EmptyState
          icon="sessions"
          title="Nenhuma sessão ainda"
          description="Registre a primeira sessão para acompanhar o andamento da campanha."
        >
          <Link href={`${base}/sessions/new`} className="mt-2">
            <Button>+ Nova sessão</Button>
          </Link>
        </EmptyState>
      ) : (
        <div className="space-y-3">
          {sessions.map((session) => (
            <Card
              key={session.id}
              className="transition-colors hover:border-accent/50"
            >
              <Link href={`${base}/sessions/${session.id}`}>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-sm text-text-muted">
                    #{session.number}
                  </span>
                  <span className="font-title text-lg text-text">
                    {session.title}
                  </span>
                  <Badge tone={sessionStatus.tones[session.status]}>
                    {sessionStatus.labels[session.status]}
                  </Badge>
                  {session.session_date && (
                    <span className="text-xs text-text-muted">
                      {session.session_date}
                    </span>
                  )}
                </div>
                {session.public_summary && (
                  <p className="mt-1 line-clamp-2 text-sm text-text-secondary">
                    {session.public_summary}
                  </p>
                )}
              </Link>
            </Card>
          ))}
        </div>
      )}
    </main>
  );
}

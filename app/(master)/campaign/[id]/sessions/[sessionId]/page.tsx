import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import { PrivacyBadge } from "@/components/shared/PrivacyBadge";
import { DeleteButton } from "@/components/shared/DeleteButton";
import { deleteSession } from "../actions";
import { sessionStatus } from "@/lib/labels";
import type { Session } from "@/lib/types/database.types";

export default async function SessionDetailPage({
  params,
}: {
  params: { id: string; sessionId: string };
}) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("sessions")
    .select("*")
    .eq("id", params.sessionId)
    .maybeSingle();

  if (!data) {
    notFound();
  }

  const session = data as Session;
  const base = `/campaign/${params.id}`;
  const decisions = Array.isArray(session.decisions)
    ? (session.decisions as string[])
    : [];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 md:px-6">
      <PageHeader
        title={`#${session.number} — ${session.title}`}
        icon="📜"
        backHref={`${base}/sessions`}
        backLabel="Sessões"
        actions={
          <>
            <Link href={`${base}/sessions/${session.id}/edit`}>
              <Button variant="ghost" size="sm">
                Editar
              </Button>
            </Link>
            <DeleteButton
              action={deleteSession}
              id={session.id}
              hidden={{ campaign_id: params.id }}
              confirm={`Excluir a sessão #${session.number}? Esta ação não pode ser desfeita.`}
            />
          </>
        }
      />

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Badge tone={sessionStatus.tones[session.status]}>
          {sessionStatus.labels[session.status]}
        </Badge>
        {session.session_date && (
          <span className="text-sm text-text-secondary">
            {session.session_date}
          </span>
        )}
        {session.xp_awarded > 0 && (
          <span className="text-sm text-text-secondary">
            ✨ {session.xp_awarded} XP
          </span>
        )}
      </div>

      <div className="space-y-6">
        <Card className="space-y-2">
          <h2 className="font-title text-lg text-text">Resumo público</h2>
          {session.public_summary ? (
            <p className="whitespace-pre-wrap text-sm text-text-secondary">
              {session.public_summary}
            </p>
          ) : (
            <p className="text-sm text-text-muted">Sem resumo público.</p>
          )}
        </Card>

        <Card className="field-private space-y-2">
          <div className="flex items-center gap-2">
            <h2 className="font-title text-lg text-text">Notas do Mestre</h2>
            <PrivacyBadge />
          </div>
          {session.master_notes ? (
            <p className="whitespace-pre-wrap text-sm text-text-secondary">
              {session.master_notes}
            </p>
          ) : (
            <p className="text-sm text-text-muted">Nenhuma nota privada.</p>
          )}
        </Card>

        {decisions.length > 0 && (
          <Card className="field-private space-y-2">
            <div className="flex items-center gap-2">
              <h2 className="font-title text-lg text-text">
                Decisões dos jogadores
              </h2>
              <PrivacyBadge />
            </div>
            <ul className="list-inside list-disc space-y-1 text-sm text-text-secondary">
              {decisions.map((d, i) => (
                <li key={i}>{d}</li>
              ))}
            </ul>
          </Card>
        )}
      </div>
    </main>
  );
}

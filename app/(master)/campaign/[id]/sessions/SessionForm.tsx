"use client";

import Link from "next/link";
import { useFormState, useFormStatus } from "react-dom";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { InputField, SelectField, TextareaField } from "@/components/ui/Field";
import { PrivacyBadge } from "@/components/shared/PrivacyBadge";
import { sessionStatus, toOptions } from "@/lib/labels";
import type { SessionFormState } from "./actions";
import type { Session } from "@/lib/types/database.types";

interface SessionFormProps {
  campaignId: string;
  action: (prev: SessionFormState, formData: FormData) => Promise<SessionFormState>;
  session?: Session;
  suggestedNumber?: number;
}

function SubmitButton({ editing }: { editing: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Salvando…" : editing ? "Salvar alterações" : "Criar sessão"}
    </Button>
  );
}

function decisionsToText(decisions: unknown): string {
  if (Array.isArray(decisions)) return decisions.join("\n");
  return "";
}

export function SessionForm({
  campaignId,
  action,
  session,
  suggestedNumber,
}: SessionFormProps) {
  const [state, formAction] = useFormState(action, {} as SessionFormState);
  const editing = Boolean(session);
  const backHref = editing
    ? `/campaign/${campaignId}/sessions/${session!.id}`
    : `/campaign/${campaignId}/sessions`;

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="campaign_id" value={campaignId} />
      {editing && <input type="hidden" name="id" value={session!.id} />}

      <Card className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-[120px_1fr]">
          <InputField
            label="Número"
            name="number"
            type="number"
            min={1}
            required
            defaultValue={session?.number ?? suggestedNumber ?? 1}
          />
          <InputField
            label="Título"
            name="title"
            required
            defaultValue={session?.title ?? ""}
            placeholder="A Torre em Ruínas"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <InputField
            label="Data"
            name="session_date"
            type="date"
            defaultValue={session?.session_date ?? ""}
          />
          <SelectField
            label="Status"
            name="status"
            options={toOptions(sessionStatus)}
            defaultValue={session?.status ?? "planned"}
          />
          <InputField
            label="XP concedido"
            name="xp_awarded"
            type="number"
            min={0}
            defaultValue={session?.xp_awarded ?? 0}
          />
        </div>
        <TextareaField
          label="Resumo público"
          name="public_summary"
          defaultValue={session?.public_summary ?? ""}
          placeholder="O que aconteceu, na visão dos jogadores…"
          hint="Visível aos jogadores quando a sessão estiver 'Jogada'."
          rows={4}
        />
      </Card>

      <Card className="field-private space-y-4">
        <div className="flex items-center gap-2">
          <h2 className="font-title text-lg text-text">Notas do Mestre</h2>
          <PrivacyBadge />
        </div>
        <TextareaField
          label="Anotações privadas"
          name="master_notes"
          private
          defaultValue={session?.master_notes ?? ""}
          placeholder="Preparo, ganchos, o que ficou pendente…"
          rows={4}
        />
        <TextareaField
          label="Decisões dos jogadores"
          name="decisions"
          private
          defaultValue={decisionsToText(session?.decisions)}
          placeholder="Uma decisão por linha…"
          hint="Uma por linha."
        />
      </Card>

      {state.error && (
        <p className="rounded-md border border-primary/40 bg-danger/30 px-3 py-2 text-sm text-red-300">
          {state.error}
        </p>
      )}

      <div className="flex items-center gap-3">
        <SubmitButton editing={editing} />
        <Link href={backHref}>
          <Button type="button" variant="ghost">
            Cancelar
          </Button>
        </Link>
      </div>
    </form>
  );
}

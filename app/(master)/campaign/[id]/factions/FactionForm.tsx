"use client";

import Link from "next/link";
import { useFormState, useFormStatus } from "react-dom";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { InputField, SelectField, TextareaField } from "@/components/ui/Field";
import { PrivacyBadge } from "@/components/shared/PrivacyBadge";
import { factionRelationship, toOptions } from "@/lib/labels";
import type { FactionFormState } from "./actions";
import type { Faction } from "@/lib/types/database.types";

interface FactionFormProps {
  campaignId: string;
  action: (prev: FactionFormState, formData: FormData) => Promise<FactionFormState>;
  faction?: Faction;
}

function SubmitButton({ editing }: { editing: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Salvando…" : editing ? "Salvar alterações" : "Criar facção"}
    </Button>
  );
}

export function FactionForm({ campaignId, action, faction }: FactionFormProps) {
  const [state, formAction] = useFormState(action, {} as FactionFormState);
  const editing = Boolean(faction);
  const backHref = editing
    ? `/campaign/${campaignId}/factions/${faction!.id}`
    : `/campaign/${campaignId}/factions`;

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="campaign_id" value={campaignId} />
      {editing && <input type="hidden" name="id" value={faction!.id} />}

      <Card className="space-y-4">
        <h2 className="font-title text-lg text-text">Facção</h2>
        <InputField
          label="Nome"
          name="name"
          required
          defaultValue={faction?.name ?? ""}
          placeholder="Conselho de Luskan"
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <InputField
            label="Tipo"
            name="type"
            defaultValue={faction?.type ?? ""}
            placeholder="política, arcana, religiosa…"
          />
          <InputField
            label="Alinhamento"
            name="alignment"
            defaultValue={faction?.alignment ?? ""}
            placeholder="Neutro e mau…"
          />
        </div>
        <SelectField
          label="Relação com os jogadores"
          name="player_relationship"
          options={toOptions(factionRelationship)}
          defaultValue={faction?.player_relationship ?? "unknown"}
          hint="Enquanto 'Desconhecida', a facção não aparece para os jogadores."
        />
        <TextareaField
          label="Objetivos"
          name="objectives"
          defaultValue={faction?.objectives ?? ""}
          placeholder="O que a facção busca…"
        />
      </Card>

      <Card className="field-private space-y-4">
        <div className="flex items-center gap-2">
          <h2 className="font-title text-lg text-text">Segredos</h2>
          <PrivacyBadge />
        </div>
        <TextareaField
          label="Segredos da facção"
          name="secrets"
          private
          defaultValue={faction?.secrets ?? ""}
          placeholder="Planos ocultos, traições, verdades…"
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

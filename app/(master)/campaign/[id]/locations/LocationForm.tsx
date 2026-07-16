"use client";

import Link from "next/link";
import { useFormState, useFormStatus } from "react-dom";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { InputField, SelectField, TextareaField } from "@/components/ui/Field";
import { PrivacyBadge } from "@/components/shared/PrivacyBadge";
import { discoveryStatus, toOptions } from "@/lib/labels";
import type { LocationFormState } from "./actions";
import type { Location } from "@/lib/types/database.types";

interface Option {
  id: string;
  name: string;
}

interface LocationFormProps {
  campaignId: string;
  action: (prev: LocationFormState, formData: FormData) => Promise<LocationFormState>;
  parents: Option[];
  location?: Location;
}

function SubmitButton({ editing }: { editing: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Salvando…" : editing ? "Salvar alterações" : "Criar local"}
    </Button>
  );
}

export function LocationForm({
  campaignId,
  action,
  parents,
  location,
}: LocationFormProps) {
  const [state, formAction] = useFormState(action, {} as LocationFormState);
  const editing = Boolean(location);
  const backHref = editing
    ? `/campaign/${campaignId}/locations/${location!.id}`
    : `/campaign/${campaignId}/locations`;

  const parentOptions = [
    { value: "", label: "— nenhum (nível superior) —" },
    ...parents
      .filter((p) => p.id !== location?.id)
      .map((p) => ({ value: p.id, label: p.name })),
  ];

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="campaign_id" value={campaignId} />
      {editing && <input type="hidden" name="id" value={location!.id} />}

      <Card className="space-y-4">
        <h2 className="font-title text-lg text-text">Local</h2>
        <InputField
          label="Nome"
          name="name"
          required
          defaultValue={location?.name ?? ""}
          placeholder="Pedra Salgada"
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <InputField
            label="Tipo"
            name="type"
            defaultValue={location?.type ?? ""}
            placeholder="vilarejo, taverna, masmorra…"
          />
          <InputField
            label="Região"
            name="region"
            defaultValue={location?.region ?? ""}
            placeholder="Costa Norte"
          />
        </div>
        <SelectField
          label="Local pai"
          name="parent_location_id"
          options={parentOptions}
          defaultValue={location?.parent_location_id ?? ""}
          hint="Aninhe pontos de interesse dentro de um local maior."
        />
        <TextareaField
          label="Descrição pública"
          name="public_description"
          defaultValue={location?.public_description ?? ""}
          placeholder="O que os jogadores percebem ao chegar…"
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
          defaultValue={location?.master_notes ?? ""}
          placeholder="Segredos, encontros, ganchos, tesouros ocultos…"
        />
      </Card>

      <Card>
        <SelectField
          label="Status de descoberta"
          name="discovery_status"
          options={toOptions(discoveryStatus)}
          defaultValue={location?.discovery_status ?? "undiscovered"}
          hint="Enquanto 'Não descoberto', o local não aparece para os jogadores."
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

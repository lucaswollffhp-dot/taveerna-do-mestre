"use client";

import Link from "next/link";
import { useFormState, useFormStatus } from "react-dom";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { InputField, SelectField, TextareaField } from "@/components/ui/Field";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { PrivacyBadge } from "@/components/shared/PrivacyBadge";
import { npcType, revelationStatus, toOptions } from "@/lib/labels";
import type { NpcFormState } from "./actions";
import type { Npc } from "@/lib/types/database.types";

interface Option {
  id: string;
  name: string;
}

interface NpcFormProps {
  campaignId: string;
  action: (prev: NpcFormState, formData: FormData) => Promise<NpcFormState>;
  factions: Option[];
  locations: Option[];
  npc?: Npc;
}

function SubmitButton({ editing }: { editing: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Salvando…" : editing ? "Salvar alterações" : "Criar NPC"}
    </Button>
  );
}

function relationOptions(list: Option[], emptyLabel: string) {
  return [
    { value: "", label: emptyLabel },
    ...list.map((o) => ({ value: o.id, label: o.name })),
  ];
}

export function NpcForm({
  campaignId,
  action,
  factions,
  locations,
  npc,
}: NpcFormProps) {
  const [state, formAction] = useFormState(action, {} as NpcFormState);
  const editing = Boolean(npc);
  const backHref = editing
    ? `/campaign/${campaignId}/npcs/${npc!.id}`
    : `/campaign/${campaignId}/npcs`;

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="campaign_id" value={campaignId} />
      {editing && <input type="hidden" name="id" value={npc!.id} />}

      {/* ── Seção pública ── */}
      <Card className="space-y-4">
        <h2 className="font-title text-lg text-text">Identidade</h2>
        <ImageUpload
          name="token_image_url"
          campaignId={campaignId}
          folder="tokens"
          defaultUrl={npc?.token_image_url}
          label="Arte do token (opcional)"
          hint="Sem imagem, o token vira uma moeda com a inicial do nome."
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <InputField
            label="Nome"
            name="name"
            required
            defaultValue={npc?.name ?? ""}
            placeholder="Aldric Voss"
          />
          <InputField
            label="Apelidos / aliases"
            name="aliases"
            defaultValue={npc?.aliases?.join(", ") ?? ""}
            placeholder="Kazeth, O Conselheiro"
            hint="Separe por vírgula."
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <SelectField
            label="Tipo"
            name="type"
            options={toOptions(npcType)}
            defaultValue={npc?.type ?? "neutral"}
          />
          <SelectField
            label="Facção"
            name="faction_id"
            options={relationOptions(factions, "— nenhuma —")}
            defaultValue={npc?.faction_id ?? ""}
          />
          <SelectField
            label="Local"
            name="location_id"
            options={relationOptions(locations, "— nenhum —")}
            defaultValue={npc?.location_id ?? ""}
          />
        </div>
        <TextareaField
          label="Descrição física"
          name="physical_description"
          defaultValue={npc?.physical_description ?? ""}
          placeholder="Aparência, trejeitos, sinais visíveis…"
          hint="O que os jogadores podem observar."
        />
      </Card>

      {/* ── Seção privada (só Mestre) ── */}
      <Card className="field-private space-y-4">
        <div className="flex items-center gap-2">
          <h2 className="font-title text-lg text-text">Notas do Mestre</h2>
          <PrivacyBadge />
        </div>
        <TextareaField
          label="História"
          name="history"
          private
          defaultValue={npc?.history ?? ""}
          placeholder="Passado, origem, vínculos ocultos…"
        />
        <TextareaField
          label="Motivações"
          name="motivations"
          private
          defaultValue={npc?.motivations ?? ""}
        />
        <TextareaField
          label="Segredos"
          name="secrets"
          private
          defaultValue={npc?.secrets ?? ""}
          placeholder="Verdades que os jogadores ainda não sabem…"
        />
        <TextareaField
          label="Anotações livres"
          name="master_notes"
          private
          defaultValue={npc?.master_notes ?? ""}
        />
      </Card>

      {/* ── Revelação ── */}
      <Card className="space-y-4">
        <SelectField
          label="Status de revelação"
          name="revelation_status"
          options={toOptions(revelationStatus)}
          defaultValue={npc?.revelation_status ?? "unknown"}
          hint="Enquanto 'Oculto', o NPC não aparece para os jogadores."
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

"use client";

import Link from "next/link";
import { useFormState, useFormStatus } from "react-dom";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { InputField, SelectField, TextareaField, Field } from "@/components/ui/Field";
import { ObjectivesEditor } from "./ObjectivesEditor";
import { questStatus, questType, toOptions } from "@/lib/labels";
import type { QuestFormState } from "./actions";
import type { Quest, QuestObjective } from "@/lib/types/database.types";

interface Option {
  id: string;
  name: string;
}

interface QuestFormProps {
  campaignId: string;
  action: (prev: QuestFormState, formData: FormData) => Promise<QuestFormState>;
  npcs: Option[];
  locations: Option[];
  quest?: Quest;
}

function SubmitButton({ editing }: { editing: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Salvando…" : editing ? "Salvar alterações" : "Criar missão"}
    </Button>
  );
}

function relationOptions(list: Option[], emptyLabel: string) {
  return [
    { value: "", label: emptyLabel },
    ...list.map((o) => ({ value: o.id, label: o.name })),
  ];
}

export function QuestForm({
  campaignId,
  action,
  npcs,
  locations,
  quest,
}: QuestFormProps) {
  const [state, formAction] = useFormState(action, {} as QuestFormState);
  const editing = Boolean(quest);
  const backHref = editing
    ? `/campaign/${campaignId}/quests/${quest!.id}`
    : `/campaign/${campaignId}/quests`;

  const objectives = (quest?.objectives as QuestObjective[] | undefined) ?? [];

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="campaign_id" value={campaignId} />
      {editing && <input type="hidden" name="id" value={quest!.id} />}

      <Card className="space-y-4">
        <h2 className="font-title text-lg text-text">Missão</h2>
        <InputField
          label="Título"
          name="title"
          required
          defaultValue={quest?.title ?? ""}
          placeholder="Investigar a Torre em Ruínas"
        />
        <TextareaField
          label="Descrição"
          name="description"
          defaultValue={quest?.description ?? ""}
          placeholder="Contexto, gancho, quem contratou…"
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <SelectField
            label="Tipo"
            name="type"
            options={toOptions(questType)}
            defaultValue={quest?.type ?? "secondary"}
          />
          <SelectField
            label="Status"
            name="status"
            options={toOptions(questStatus)}
            defaultValue={quest?.status ?? "available"}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <SelectField
            label="Contratante"
            name="contractor_id"
            options={relationOptions(npcs, "— nenhum —")}
            defaultValue={quest?.contractor_id ?? ""}
          />
          <SelectField
            label="Local"
            name="location_id"
            options={relationOptions(locations, "— nenhum —")}
            defaultValue={quest?.location_id ?? ""}
          />
        </div>
      </Card>

      <Card className="space-y-3">
        <h2 className="font-title text-lg text-text">Objetivos</h2>
        <ObjectivesEditor initial={objectives} />
      </Card>

      <Card className="space-y-4">
        <h2 className="font-title text-lg text-text">Recompensas</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <InputField
            label="Ouro (PO)"
            name="reward_gold"
            type="number"
            min={0}
            defaultValue={quest?.reward_gold ?? 0}
          />
          <InputField
            label="XP"
            name="reward_xp"
            type="number"
            min={0}
            defaultValue={quest?.reward_xp ?? 0}
          />
        </div>
        <InputField
          label="Itens"
          name="reward_items"
          defaultValue={quest?.reward_items ?? ""}
          placeholder="Adaga +1, poção de cura…"
        />
        <InputField
          label="Outras recompensas"
          name="reward_other"
          defaultValue={quest?.reward_other ?? ""}
          placeholder="Favores, reputação, informação…"
        />
      </Card>

      <Card>
        <Field label="Visibilidade" htmlFor="is_visible_to_players">
          <label className="flex items-center gap-2 text-sm text-text-secondary">
            <input
              type="checkbox"
              id="is_visible_to_players"
              name="is_visible_to_players"
              defaultChecked={quest?.is_visible_to_players ?? false}
              className="h-4 w-4 accent-accent"
            />
            Missão visível aos jogadores no board
          </label>
        </Field>
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

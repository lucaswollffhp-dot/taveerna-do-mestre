"use client";

import Link from "next/link";
import { useFormState, useFormStatus } from "react-dom";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { InputField, SelectField, TextareaField } from "@/components/ui/Field";
import { itemStatus, toOptions } from "@/lib/labels";
import type { ItemFormState } from "./actions";
import type { Item } from "@/lib/types/database.types";

interface HolderOption {
  id: string;
  name: string;
}

interface ItemFormProps {
  campaignId: string;
  action: (prev: ItemFormState, formData: FormData) => Promise<ItemFormState>;
  holders: HolderOption[];
  item?: Item;
}

function SubmitButton({ editing }: { editing: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Salvando…" : editing ? "Salvar alterações" : "Adicionar item"}
    </Button>
  );
}

export function ItemForm({
  campaignId,
  action,
  holders,
  item,
}: ItemFormProps) {
  const [state, formAction] = useFormState(action, {} as ItemFormState);
  const editing = Boolean(item);
  const backHref = editing
    ? `/campaign/${campaignId}/loot/${item!.id}`
    : `/campaign/${campaignId}/loot`;

  const holderOptions = [
    { value: "", label: "Tesouro do grupo (sem dono)" },
    ...holders.map((h) => ({ value: h.id, label: h.name })),
  ];

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="campaign_id" value={campaignId} />
      {editing && <input type="hidden" name="id" value={item!.id} />}

      <Card className="space-y-4">
        <h2 className="font-title text-lg text-text">Item</h2>
        <InputField
          label="Nome"
          name="name"
          required
          defaultValue={item?.name ?? ""}
          placeholder='Adaga +1 "Presa de Valdris"'
        />
        <div className="grid gap-4 sm:grid-cols-3">
          <InputField
            label="Tipo"
            name="type"
            defaultValue={item?.type ?? ""}
            placeholder="arma, poção, pergaminho…"
          />
          <InputField
            label="Valor (PO)"
            name="value_gp"
            type="number"
            min={0}
            defaultValue={item?.value_gp ? String(item.value_gp) : ""}
            placeholder="0"
          />
          <InputField
            label="Peso (kg)"
            name="weight_kg"
            type="number"
            min={0}
            step="0.1"
            defaultValue={item?.weight_kg ? String(item.weight_kg) : ""}
            placeholder="0"
          />
        </div>
        <TextareaField
          label="Propriedades mágicas"
          name="magical_properties"
          defaultValue={item?.magical_properties ?? ""}
          placeholder="Bônus, encantamentos, condições de uso…"
        />
        <label className="flex items-center gap-2 text-sm text-text-secondary">
          <input
            type="checkbox"
            name="is_special"
            defaultChecked={item?.is_special ?? false}
            className="h-4 w-4 accent-accent"
          />
          Item especial (relevante para a trama)
        </label>
      </Card>

      <Card className="space-y-4">
        <h2 className="font-title text-lg text-text">Posse e situação</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <SelectField
            label="Dono"
            name="holder_id"
            options={holderOptions}
            defaultValue={item?.holder_id ?? ""}
            hint="Ao vincular a um personagem, o item aparece na ficha do jogador."
          />
          <SelectField
            label="Situação"
            name="status"
            options={toOptions(itemStatus)}
            defaultValue={item?.status ?? "active"}
          />
        </div>
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

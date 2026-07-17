"use client";

import Link from "next/link";
import { useFormState, useFormStatus } from "react-dom";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { InputField, SelectField, TextareaField } from "@/components/ui/Field";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { PrivacyBadge } from "@/components/shared/PrivacyBadge";
import type { CharacterFormState } from "./actions";
import type { Character, Json } from "@/lib/types/database.types";

interface CharacterFormProps {
  campaignId: string;
  currentUserId: string;
  action: (
    prev: CharacterFormState,
    formData: FormData,
  ) => Promise<CharacterFormState>;
  character?: Character;
}

const ATTRS: { key: string; label: string }[] = [
  { key: "str", label: "FOR" },
  { key: "dex", label: "DES" },
  { key: "con", label: "CON" },
  { key: "int", label: "INT" },
  { key: "wis", label: "SAB" },
  { key: "cha", label: "CAR" },
];

function attrValue(attributes: Json | undefined, key: string): number {
  if (attributes && typeof attributes === "object" && !Array.isArray(attributes)) {
    const v = (attributes as Record<string, unknown>)[key];
    return Number(v) || 10;
  }
  return 10;
}

function SubmitButton({ editing }: { editing: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending
        ? "Salvando…"
        : editing
          ? "Salvar alterações"
          : "Criar personagem"}
    </Button>
  );
}

export function CharacterForm({
  campaignId,
  currentUserId,
  action,
  character,
}: CharacterFormProps) {
  const [state, formAction] = useFormState(action, {} as CharacterFormState);
  const editing = Boolean(character);
  const backHref = editing
    ? `/campaign/${campaignId}/characters/${character!.id}`
    : `/campaign/${campaignId}/characters`;

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="campaign_id" value={campaignId} />
      {editing && <input type="hidden" name="id" value={character!.id} />}

      <Card className="space-y-4">
        <h2 className="font-title text-lg text-text">Identidade</h2>
        <ImageUpload
          name="token_image_url"
          campaignId={campaignId}
          folder="tokens"
          defaultUrl={character?.token_image_url}
          label="Arte do token (PNG)"
          required
          hint="Aparece como a 'moeda' do personagem no mapa. Ideal: imagem quadrada."
        />
        <InputField
          label="Nome"
          name="name"
          required
          defaultValue={character?.name ?? ""}
          placeholder="Thalia Meiassombra"
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <InputField
            label="Raça"
            name="race"
            defaultValue={character?.race ?? ""}
            placeholder="Meio-elfa"
          />
          <InputField
            label="Classe"
            name="class"
            defaultValue={character?.class ?? ""}
            placeholder="Ladina"
          />
        </div>
        <SelectField
          label="Controlado por"
          name="player_id"
          options={[
            { value: "", label: "Sem vínculo (Mestre controla)" },
            { value: currentUserId, label: "Eu (jogar com esta ficha)" },
          ]}
          defaultValue={character?.player_id ?? ""}
          hint="Vincule a um jogador para que ele mova o próprio token no mapa."
        />
      </Card>

      <Card className="space-y-4">
        <h2 className="font-title text-lg text-text">Estatísticas</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <InputField
            label="Nível"
            name="level"
            type="number"
            min={1}
            defaultValue={String(character?.level ?? 1)}
          />
          <InputField
            label="CA"
            name="ac"
            type="number"
            min={0}
            defaultValue={String(character?.ac ?? 10)}
          />
          <InputField
            label="XP"
            name="xp_current"
            type="number"
            min={0}
            defaultValue={String(character?.xp_current ?? 0)}
          />
          <InputField
            label="PV atual"
            name="hp_current"
            type="number"
            min={0}
            defaultValue={String(character?.hp_current ?? 10)}
          />
          <InputField
            label="PV máximo"
            name="hp_max"
            type="number"
            min={0}
            defaultValue={String(character?.hp_max ?? 10)}
          />
          <InputField
            label="Ouro"
            name="gold"
            type="number"
            min={0}
            defaultValue={String(character?.gold ?? 0)}
          />
        </div>
        <div>
          <p className="mb-1.5 text-sm font-medium text-text-secondary">
            Atributos
          </p>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
            {ATTRS.map((a) => (
              <div key={a.key}>
                <label
                  htmlFor={`attr_${a.key}`}
                  className="mb-1 block text-center text-xs text-text-muted"
                >
                  {a.label}
                </label>
                <input
                  id={`attr_${a.key}`}
                  name={`attr_${a.key}`}
                  type="number"
                  min={1}
                  defaultValue={attrValue(character?.attributes, a.key)}
                  className="input text-center"
                />
              </div>
            ))}
          </div>
        </div>
      </Card>

      <Card className="space-y-4">
        <h2 className="font-title text-lg text-text">História</h2>
        <TextareaField
          label="História / antecedente"
          name="background"
          defaultValue={character?.background ?? ""}
          placeholder="De onde vem, motivações, laços…"
        />
        <div className="field-private">
          <TextareaField
            label="Segredos"
            name="secrets"
            private
            defaultValue={character?.secrets ?? ""}
            placeholder="Visível apenas ao Mestre."
          />
          <div className="mt-1">
            <PrivacyBadge />
          </div>
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

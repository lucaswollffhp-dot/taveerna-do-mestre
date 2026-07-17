"use client";

import { useFormState, useFormStatus } from "react-dom";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { InputField } from "@/components/ui/Field";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { createScene, type SceneFormState } from "./actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Criando…" : "Criar cena"}
    </Button>
  );
}

export function NewSceneForm({ campaignId }: { campaignId: string }) {
  const [state, formAction] = useFormState(createScene, {} as SceneFormState);

  return (
    <Card className="mb-6">
      <form action={formAction} className="space-y-4">
        <input type="hidden" name="campaign_id" value={campaignId} />
        <h2 className="font-title text-lg text-text">Nova cena</h2>
        <ImageUpload
          name="map_image_url"
          campaignId={campaignId}
          folder="maps"
          label="Mapa da cena"
          shape="rect"
          hint="Imagem de fundo da mesa (JPG/PNG/WebP). Pode adicionar depois."
        />
        <InputField
          label="Nome da cena"
          name="name"
          placeholder="Escombros da Torre em Ruínas"
        />
        {state.error && (
          <p className="rounded-md border border-primary/40 bg-danger/30 px-3 py-2 text-sm text-red-300">
            {state.error}
          </p>
        )}
        <SubmitButton />
      </form>
    </Card>
  );
}

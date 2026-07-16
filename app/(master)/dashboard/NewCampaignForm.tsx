"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { createCampaign, type CreateCampaignState } from "./actions";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

const initialState: CreateCampaignState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Criando…" : "Criar campanha"}
    </Button>
  );
}

export function NewCampaignForm() {
  const [open, setOpen] = useState(false);
  const [state, formAction] = useFormState(createCampaign, initialState);

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)}>+ Nova campanha</Button>
    );
  }

  return (
    <Card raised className="w-full max-w-lg">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-title text-lg text-text">Nova campanha</h3>
        <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
          Cancelar
        </Button>
      </div>
      <form action={formAction} className="space-y-4">
        <div>
          <label htmlFor="name" className="label">
            Nome
          </label>
          <input
            id="name"
            name="name"
            required
            className="input"
            placeholder="Os Três Selos do Abismo"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="setting" className="label">
              Cenário
            </label>
            <input
              id="setting"
              name="setting"
              className="input"
              placeholder="Forgotten Realms — Costa Norte"
            />
          </div>
          <div>
            <label htmlFor="tone" className="label">
              Tom
            </label>
            <input
              id="tone"
              name="tone"
              className="input"
              placeholder="Fantasia heroica com mistério"
            />
          </div>
        </div>

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

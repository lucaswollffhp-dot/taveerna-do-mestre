"use client";

import Link from "next/link";
import { useFormState, useFormStatus } from "react-dom";
import { register, type AuthState } from "../actions";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

const initialState: AuthState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" fullWidth disabled={pending}>
      {pending ? "Criando…" : "📜 Criar conta"}
    </Button>
  );
}

export default function RegisterPage() {
  const [state, formAction] = useFormState(register, initialState);

  return (
    <Card className="p-6">
      <h2 className="mb-6 text-center font-title text-xl text-text">
        Criar conta
      </h2>
      <form action={formAction} className="space-y-4">
        <div>
          <label htmlFor="displayName" className="label">
            Nome de exibição
          </label>
          <input
            id="displayName"
            name="displayName"
            type="text"
            autoComplete="nickname"
            className="input"
            placeholder="Mestre dos Dados"
          />
        </div>
        <div>
          <label htmlFor="email" className="label">
            E-mail
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="input"
            placeholder="mestre@taverna.com"
          />
        </div>
        <div>
          <label htmlFor="password" className="label">
            Senha
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={6}
            className="input"
            placeholder="Mínimo 6 caracteres"
          />
        </div>

        {state.error && (
          <p className="rounded-md border border-primary/40 bg-danger/30 px-3 py-2 text-sm text-red-300">
            {state.error}
          </p>
        )}
        {state.message && (
          <p className="rounded-md border border-success/60 bg-success/20 px-3 py-2 text-sm text-green-300">
            {state.message}
          </p>
        )}

        <SubmitButton />
      </form>

      <p className="mt-6 text-center text-sm text-text-secondary">
        Já tem conta?{" "}
        <Link href="/login" className="text-accent hover:underline">
          Entrar
        </Link>
      </p>
    </Card>
  );
}

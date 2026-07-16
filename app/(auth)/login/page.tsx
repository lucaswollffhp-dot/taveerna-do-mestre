"use client";

import Link from "next/link";
import { useFormState, useFormStatus } from "react-dom";
import { login, type AuthState } from "../actions";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

const initialState: AuthState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" fullWidth disabled={pending}>
      {pending ? "Entrando…" : "⚔ Entrar na taverna"}
    </Button>
  );
}

export default function LoginPage() {
  const [state, formAction] = useFormState(login, initialState);

  return (
    <Card className="p-6">
      <h2 className="mb-6 text-center font-title text-xl text-text">Entrar</h2>
      <form action={formAction} className="space-y-4">
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
            autoComplete="current-password"
            required
            className="input"
            placeholder="••••••••"
          />
        </div>

        {state.error && (
          <p className="rounded-md border border-primary/40 bg-danger/30 px-3 py-2 text-sm text-red-300">
            {state.error}
          </p>
        )}

        <SubmitButton />
      </form>

      <p className="mt-6 text-center text-sm text-text-secondary">
        Ainda não tem conta?{" "}
        <Link href="/register" className="text-accent hover:underline">
          Criar conta
        </Link>
      </p>
    </Card>
  );
}

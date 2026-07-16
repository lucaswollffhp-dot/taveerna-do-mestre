"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/Button";

function Inner({ label, confirm }: { label: string; confirm: string }) {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      variant="danger"
      size="sm"
      disabled={pending}
      onClick={(e) => {
        if (!window.confirm(confirm)) {
          e.preventDefault();
        }
      }}
    >
      {pending ? "Excluindo…" : label}
    </Button>
  );
}

interface DeleteButtonProps {
  /** Server Action que recebe o FormData com o `id`. */
  action: (formData: FormData) => void | Promise<void>;
  id: string;
  label?: string;
  confirm?: string;
  /** Campos ocultos extras (ex.: redirecionamento pós-exclusão). */
  hidden?: Record<string, string>;
}

/**
 * Botão de exclusão com confirmação nativa, acoplado a um Server Action.
 * Envia `id` (e campos extras) via FormData.
 */
export function DeleteButton({
  action,
  id,
  label = "Excluir",
  confirm = "Tem certeza? Esta ação não pode ser desfeita.",
  hidden,
}: DeleteButtonProps) {
  return (
    <form action={action} className="inline">
      <input type="hidden" name="id" value={id} />
      {hidden &&
        Object.entries(hidden).map(([k, v]) => (
          <input key={k} type="hidden" name={k} value={v} />
        ))}
      <Inner label={label} confirm={confirm} />
    </form>
  );
}

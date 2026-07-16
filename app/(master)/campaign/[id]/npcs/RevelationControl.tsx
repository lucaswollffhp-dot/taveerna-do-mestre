"use client";

import { useRef } from "react";
import { setNpcRevelation } from "./actions";
import { revelationStatus, toOptions } from "@/lib/labels";
import type { RevelationStatus } from "@/lib/types/database.types";

interface RevelationControlProps {
  campaignId: string;
  npcId: string;
  value: RevelationStatus;
}

/**
 * Select que altera o status de revelação do NPC ao mudar,
 * submetendo o Server Action sem botão explícito.
 */
export function RevelationControl({
  campaignId,
  npcId,
  value,
}: RevelationControlProps) {
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form ref={formRef} action={setNpcRevelation} className="inline-flex">
      <input type="hidden" name="campaign_id" value={campaignId} />
      <input type="hidden" name="id" value={npcId} />
      <select
        name="revelation_status"
        defaultValue={value}
        onChange={() => formRef.current?.requestSubmit()}
        className="rounded-md border border-border bg-bg px-2 py-1 text-xs text-text focus:border-accent focus:outline-none"
        aria-label="Status de revelação"
      >
        {toOptions(revelationStatus).map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </form>
  );
}

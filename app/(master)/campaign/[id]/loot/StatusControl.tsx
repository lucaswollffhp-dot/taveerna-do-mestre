"use client";

import { useRef } from "react";
import { setItemStatus } from "./actions";
import { itemStatus, toOptions } from "@/lib/labels";
import type { ItemStatus } from "@/lib/types/database.types";

interface StatusControlProps {
  campaignId: string;
  itemId: string;
  value: ItemStatus;
}

export function StatusControl({
  campaignId,
  itemId,
  value,
}: StatusControlProps) {
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form ref={formRef} action={setItemStatus} className="inline-flex">
      <input type="hidden" name="campaign_id" value={campaignId} />
      <input type="hidden" name="id" value={itemId} />
      <select
        name="status"
        defaultValue={value}
        onChange={() => formRef.current?.requestSubmit()}
        className="rounded-md border border-border bg-bg px-2 py-1 text-xs text-text focus:border-accent focus:outline-none"
        aria-label="Situação do item"
      >
        {toOptions(itemStatus).map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </form>
  );
}

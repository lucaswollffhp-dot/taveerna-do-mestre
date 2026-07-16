"use client";

import { useRef } from "react";
import { setLocationDiscovery } from "./actions";
import { discoveryStatus, toOptions } from "@/lib/labels";
import type { DiscoveryStatus } from "@/lib/types/database.types";

interface DiscoveryControlProps {
  campaignId: string;
  locationId: string;
  value: DiscoveryStatus;
}

export function DiscoveryControl({
  campaignId,
  locationId,
  value,
}: DiscoveryControlProps) {
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form ref={formRef} action={setLocationDiscovery} className="inline-flex">
      <input type="hidden" name="campaign_id" value={campaignId} />
      <input type="hidden" name="id" value={locationId} />
      <select
        name="discovery_status"
        defaultValue={value}
        onChange={() => formRef.current?.requestSubmit()}
        className="rounded-md border border-border bg-bg px-2 py-1 text-xs text-text focus:border-accent focus:outline-none"
        aria-label="Status de descoberta"
      >
        {toOptions(discoveryStatus).map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </form>
  );
}

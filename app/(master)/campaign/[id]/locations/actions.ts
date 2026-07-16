"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { DiscoveryStatus } from "@/lib/types/database.types";

export interface LocationFormState {
  error?: string;
}

function nullable(raw: FormDataEntryValue | null): string | null {
  const v = String(raw ?? "").trim();
  return v || null;
}

function buildPayload(formData: FormData) {
  return {
    name: String(formData.get("name") ?? "").trim(),
    type: nullable(formData.get("type")),
    region: nullable(formData.get("region")),
    public_description: nullable(formData.get("public_description")),
    master_notes: nullable(formData.get("master_notes")),
    discovery_status: (String(
      formData.get("discovery_status") ?? "undiscovered",
    ) as DiscoveryStatus),
    parent_location_id: nullable(formData.get("parent_location_id")),
  };
}

export async function createLocation(
  _prev: LocationFormState,
  formData: FormData,
): Promise<LocationFormState> {
  const campaignId = String(formData.get("campaign_id") ?? "");
  const payload = buildPayload(formData);

  if (!payload.name) {
    return { error: "Dê um nome ao local." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("locations")
    .insert({ campaign_id: campaignId, ...payload })
    .select("id")
    .single();

  if (error || !data) {
    return { error: "Não foi possível criar o local. Tente novamente." };
  }

  revalidatePath(`/campaign/${campaignId}/locations`);
  redirect(`/campaign/${campaignId}/locations/${data.id}`);
}

export async function updateLocation(
  _prev: LocationFormState,
  formData: FormData,
): Promise<LocationFormState> {
  const campaignId = String(formData.get("campaign_id") ?? "");
  const id = String(formData.get("id") ?? "");
  const payload = buildPayload(formData);

  if (!payload.name) {
    return { error: "Dê um nome ao local." };
  }
  // Evita ciclo trivial (local como pai de si mesmo).
  if (payload.parent_location_id === id) {
    payload.parent_location_id = null;
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("locations")
    .update(payload)
    .eq("id", id);

  if (error) {
    return { error: "Não foi possível salvar as alterações." };
  }

  revalidatePath(`/campaign/${campaignId}/locations`);
  revalidatePath(`/campaign/${campaignId}/locations/${id}`);
  redirect(`/campaign/${campaignId}/locations/${id}`);
}

export async function setLocationDiscovery(formData: FormData): Promise<void> {
  const campaignId = String(formData.get("campaign_id") ?? "");
  const id = String(formData.get("id") ?? "");
  const status = String(
    formData.get("discovery_status") ?? "",
  ) as DiscoveryStatus;

  const supabase = await createClient();
  await supabase
    .from("locations")
    .update({ discovery_status: status })
    .eq("id", id);

  revalidatePath(`/campaign/${campaignId}/locations`);
  revalidatePath(`/campaign/${campaignId}/locations/${id}`);
}

export async function deleteLocation(formData: FormData): Promise<void> {
  const campaignId = String(formData.get("campaign_id") ?? "");
  const id = String(formData.get("id") ?? "");

  const supabase = await createClient();
  await supabase.from("locations").delete().eq("id", id);

  revalidatePath(`/campaign/${campaignId}/locations`);
  redirect(`/campaign/${campaignId}/locations`);
}

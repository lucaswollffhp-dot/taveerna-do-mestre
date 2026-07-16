"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { FactionRelationship } from "@/lib/types/database.types";

export interface FactionFormState {
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
    alignment: nullable(formData.get("alignment")),
    objectives: nullable(formData.get("objectives")),
    player_relationship: (String(
      formData.get("player_relationship") ?? "unknown",
    ) as FactionRelationship),
    secrets: nullable(formData.get("secrets")),
  };
}

export async function createFaction(
  _prev: FactionFormState,
  formData: FormData,
): Promise<FactionFormState> {
  const campaignId = String(formData.get("campaign_id") ?? "");
  const payload = buildPayload(formData);

  if (!payload.name) {
    return { error: "Dê um nome à facção." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("factions")
    .insert({ campaign_id: campaignId, ...payload })
    .select("id")
    .single();

  if (error || !data) {
    return { error: "Não foi possível criar a facção. Tente novamente." };
  }

  revalidatePath(`/campaign/${campaignId}/factions`);
  redirect(`/campaign/${campaignId}/factions/${data.id}`);
}

export async function updateFaction(
  _prev: FactionFormState,
  formData: FormData,
): Promise<FactionFormState> {
  const campaignId = String(formData.get("campaign_id") ?? "");
  const id = String(formData.get("id") ?? "");
  const payload = buildPayload(formData);

  if (!payload.name) {
    return { error: "Dê um nome à facção." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("factions").update(payload).eq("id", id);

  if (error) {
    return { error: "Não foi possível salvar as alterações." };
  }

  revalidatePath(`/campaign/${campaignId}/factions`);
  revalidatePath(`/campaign/${campaignId}/factions/${id}`);
  redirect(`/campaign/${campaignId}/factions/${id}`);
}

export async function deleteFaction(formData: FormData): Promise<void> {
  const campaignId = String(formData.get("campaign_id") ?? "");
  const id = String(formData.get("id") ?? "");

  const supabase = await createClient();
  await supabase.from("factions").delete().eq("id", id);

  revalidatePath(`/campaign/${campaignId}/factions`);
  redirect(`/campaign/${campaignId}/factions`);
}

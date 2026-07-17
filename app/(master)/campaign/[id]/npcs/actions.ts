"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type {
  NpcType,
  RevelationStatus,
} from "@/lib/types/database.types";

export interface NpcFormState {
  error?: string;
}

/** Converte "a, b, c" em ["a","b","c"] (ou null se vazio). */
function parseAliases(raw: string): string[] | null {
  const list = raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return list.length ? list : null;
}

function nullable(raw: FormDataEntryValue | null): string | null {
  const v = String(raw ?? "").trim();
  return v || null;
}

function buildPayload(formData: FormData) {
  return {
    name: String(formData.get("name") ?? "").trim(),
    aliases: parseAliases(String(formData.get("aliases") ?? "")),
    type: (String(formData.get("type") ?? "neutral") as NpcType),
    faction_id: nullable(formData.get("faction_id")),
    location_id: nullable(formData.get("location_id")),
    physical_description: nullable(formData.get("physical_description")),
    history: nullable(formData.get("history")),
    motivations: nullable(formData.get("motivations")),
    secrets: nullable(formData.get("secrets")),
    master_notes: nullable(formData.get("master_notes")),
    revelation_status: (String(
      formData.get("revelation_status") ?? "unknown",
    ) as RevelationStatus),
    token_image_url: nullable(formData.get("token_image_url")),
  };
}

export async function createNpc(
  _prev: NpcFormState,
  formData: FormData,
): Promise<NpcFormState> {
  const campaignId = String(formData.get("campaign_id") ?? "");
  const payload = buildPayload(formData);

  if (!payload.name) {
    return { error: "Dê um nome ao NPC." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("npcs")
    .insert({ campaign_id: campaignId, ...payload })
    .select("id")
    .single();

  if (error || !data) {
    return { error: "Não foi possível criar o NPC. Tente novamente." };
  }

  revalidatePath(`/campaign/${campaignId}/npcs`);
  redirect(`/campaign/${campaignId}/npcs/${data.id}`);
}

export async function updateNpc(
  _prev: NpcFormState,
  formData: FormData,
): Promise<NpcFormState> {
  const campaignId = String(formData.get("campaign_id") ?? "");
  const id = String(formData.get("id") ?? "");
  const payload = buildPayload(formData);

  if (!payload.name) {
    return { error: "Dê um nome ao NPC." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("npcs")
    .update(payload)
    .eq("id", id);

  if (error) {
    return { error: "Não foi possível salvar as alterações." };
  }

  revalidatePath(`/campaign/${campaignId}/npcs`);
  revalidatePath(`/campaign/${campaignId}/npcs/${id}`);
  redirect(`/campaign/${campaignId}/npcs/${id}`);
}

/** Altera apenas o status de revelação (usado no controle inline). */
export async function setNpcRevelation(formData: FormData): Promise<void> {
  const campaignId = String(formData.get("campaign_id") ?? "");
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("revelation_status") ?? "") as RevelationStatus;

  const supabase = await createClient();
  await supabase
    .from("npcs")
    .update({ revelation_status: status })
    .eq("id", id);

  revalidatePath(`/campaign/${campaignId}/npcs`);
  revalidatePath(`/campaign/${campaignId}/npcs/${id}`);
}

export async function deleteNpc(formData: FormData): Promise<void> {
  const campaignId = String(formData.get("campaign_id") ?? "");
  const id = String(formData.get("id") ?? "");

  const supabase = await createClient();
  await supabase.from("npcs").delete().eq("id", id);

  revalidatePath(`/campaign/${campaignId}/npcs`);
  redirect(`/campaign/${campaignId}/npcs`);
}

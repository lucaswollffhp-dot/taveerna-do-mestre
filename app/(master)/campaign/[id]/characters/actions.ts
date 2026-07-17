"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Json } from "@/lib/types/database.types";

export interface CharacterFormState {
  error?: string;
}

function nullable(raw: FormDataEntryValue | null): string | null {
  const v = String(raw ?? "").trim();
  return v || null;
}

function toInt(raw: FormDataEntryValue | null, fallback = 0): number {
  const n = parseInt(String(raw ?? ""), 10);
  return Number.isFinite(n) ? n : fallback;
}

function buildAttributes(formData: FormData): Json {
  const keys = ["str", "dex", "con", "int", "wis", "cha"] as const;
  const attrs: Record<string, number> = {};
  for (const k of keys) attrs[k] = toInt(formData.get(`attr_${k}`), 10);
  return attrs as Json;
}

function buildPayload(formData: FormData) {
  return {
    name: String(formData.get("name") ?? "").trim(),
    player_id: nullable(formData.get("player_id")),
    race: nullable(formData.get("race")),
    class: nullable(formData.get("class")),
    level: toInt(formData.get("level"), 1),
    hp_current: toInt(formData.get("hp_current"), 10),
    hp_max: toInt(formData.get("hp_max"), 10),
    ac: toInt(formData.get("ac"), 10),
    xp_current: toInt(formData.get("xp_current"), 0),
    gold: toInt(formData.get("gold"), 0),
    background: nullable(formData.get("background")),
    secrets: nullable(formData.get("secrets")),
    token_image_url: nullable(formData.get("token_image_url")),
    attributes: buildAttributes(formData),
  };
}

export async function createCharacter(
  _prev: CharacterFormState,
  formData: FormData,
): Promise<CharacterFormState> {
  const campaignId = String(formData.get("campaign_id") ?? "");
  const payload = buildPayload(formData);

  if (!payload.name) {
    return { error: "Dê um nome ao personagem." };
  }
  if (!payload.token_image_url) {
    return { error: "Envie uma imagem (PNG) para o token do personagem." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("characters")
    .insert({ campaign_id: campaignId, ...payload })
    .select("id")
    .single();

  if (error || !data) {
    return { error: "Não foi possível criar o personagem. Tente novamente." };
  }

  revalidatePath(`/campaign/${campaignId}/characters`);
  redirect(`/campaign/${campaignId}/characters/${data.id}`);
}

export async function updateCharacter(
  _prev: CharacterFormState,
  formData: FormData,
): Promise<CharacterFormState> {
  const campaignId = String(formData.get("campaign_id") ?? "");
  const id = String(formData.get("id") ?? "");
  const payload = buildPayload(formData);

  if (!payload.name) {
    return { error: "Dê um nome ao personagem." };
  }
  if (!payload.token_image_url) {
    return { error: "Envie uma imagem (PNG) para o token do personagem." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("characters")
    .update(payload)
    .eq("id", id);

  if (error) {
    return { error: "Não foi possível salvar as alterações." };
  }

  revalidatePath(`/campaign/${campaignId}/characters`);
  revalidatePath(`/campaign/${campaignId}/characters/${id}`);
  redirect(`/campaign/${campaignId}/characters/${id}`);
}

export async function deleteCharacter(formData: FormData): Promise<void> {
  const campaignId = String(formData.get("campaign_id") ?? "");
  const id = String(formData.get("id") ?? "");

  const supabase = await createClient();
  await supabase.from("characters").delete().eq("id", id);

  revalidatePath(`/campaign/${campaignId}/characters`);
  redirect(`/campaign/${campaignId}/characters`);
}

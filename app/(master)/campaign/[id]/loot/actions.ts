"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { ItemStatus } from "@/lib/types/database.types";

export interface ItemFormState {
  error?: string;
}

function nullable(raw: FormDataEntryValue | null): string | null {
  const v = String(raw ?? "").trim();
  return v || null;
}

function toInt(raw: FormDataEntryValue | null): number {
  const n = parseInt(String(raw ?? "0"), 10);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

function toNum(raw: FormDataEntryValue | null): number {
  const n = parseFloat(String(raw ?? "0").replace(",", "."));
  return Number.isFinite(n) && n > 0 ? n : 0;
}

function buildPayload(formData: FormData) {
  return {
    name: String(formData.get("name") ?? "").trim(),
    type: nullable(formData.get("type")),
    value_gp: toInt(formData.get("value_gp")),
    weight_kg: toNum(formData.get("weight_kg")),
    magical_properties: nullable(formData.get("magical_properties")),
    holder_id: nullable(formData.get("holder_id")),
    status: String(formData.get("status") ?? "active") as ItemStatus,
    is_special: formData.get("is_special") === "on",
  };
}

export async function createItem(
  _prev: ItemFormState,
  formData: FormData,
): Promise<ItemFormState> {
  const campaignId = String(formData.get("campaign_id") ?? "");
  const payload = buildPayload(formData);

  if (!payload.name) {
    return { error: "Dê um nome ao item." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("items")
    .insert({ campaign_id: campaignId, ...payload })
    .select("id")
    .single();

  if (error || !data) {
    return { error: "Não foi possível criar o item. Tente novamente." };
  }

  revalidatePath(`/campaign/${campaignId}/loot`);
  redirect(`/campaign/${campaignId}/loot/${data.id}`);
}

export async function updateItem(
  _prev: ItemFormState,
  formData: FormData,
): Promise<ItemFormState> {
  const campaignId = String(formData.get("campaign_id") ?? "");
  const id = String(formData.get("id") ?? "");
  const payload = buildPayload(formData);

  if (!payload.name) {
    return { error: "Dê um nome ao item." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("items").update(payload).eq("id", id);

  if (error) {
    return { error: "Não foi possível salvar as alterações." };
  }

  revalidatePath(`/campaign/${campaignId}/loot`);
  revalidatePath(`/campaign/${campaignId}/loot/${id}`);
  redirect(`/campaign/${campaignId}/loot/${id}`);
}

/** Atualização rápida de status a partir da lista/detalhe. */
export async function setItemStatus(formData: FormData): Promise<void> {
  const campaignId = String(formData.get("campaign_id") ?? "");
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "active") as ItemStatus;

  const supabase = await createClient();
  await supabase.from("items").update({ status }).eq("id", id);

  revalidatePath(`/campaign/${campaignId}/loot`);
  revalidatePath(`/campaign/${campaignId}/loot/${id}`);
}

export async function deleteItem(formData: FormData): Promise<void> {
  const campaignId = String(formData.get("campaign_id") ?? "");
  const id = String(formData.get("id") ?? "");

  const supabase = await createClient();
  await supabase.from("items").delete().eq("id", id);

  revalidatePath(`/campaign/${campaignId}/loot`);
  redirect(`/campaign/${campaignId}/loot`);
}

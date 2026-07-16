"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type {
  QuestObjective,
  QuestStatus,
  QuestType,
} from "@/lib/types/database.types";

export interface QuestFormState {
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

/** Lê o JSON serializado do editor de objetivos e valida a forma. */
function parseObjectives(raw: FormDataEntryValue | null): QuestObjective[] {
  try {
    const parsed = JSON.parse(String(raw ?? "[]"));
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((o) => o && typeof o.text === "string" && o.text.trim())
      .map((o) => ({ text: String(o.text).trim(), completed: Boolean(o.completed) }));
  } catch {
    return [];
  }
}

function buildPayload(formData: FormData) {
  return {
    title: String(formData.get("title") ?? "").trim(),
    description: nullable(formData.get("description")),
    type: (String(formData.get("type") ?? "secondary") as QuestType),
    status: (String(formData.get("status") ?? "available") as QuestStatus),
    contractor_id: nullable(formData.get("contractor_id")),
    location_id: nullable(formData.get("location_id")),
    objectives: parseObjectives(formData.get("objectives")),
    reward_gold: toInt(formData.get("reward_gold")),
    reward_xp: toInt(formData.get("reward_xp")),
    reward_items: nullable(formData.get("reward_items")),
    reward_other: nullable(formData.get("reward_other")),
    is_visible_to_players: formData.get("is_visible_to_players") === "on",
  };
}

export async function createQuest(
  _prev: QuestFormState,
  formData: FormData,
): Promise<QuestFormState> {
  const campaignId = String(formData.get("campaign_id") ?? "");
  const payload = buildPayload(formData);

  if (!payload.title) {
    return { error: "Dê um título à missão." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("quests")
    .insert({ campaign_id: campaignId, ...payload })
    .select("id")
    .single();

  if (error || !data) {
    return { error: "Não foi possível criar a missão. Tente novamente." };
  }

  revalidatePath(`/campaign/${campaignId}/quests`);
  redirect(`/campaign/${campaignId}/quests/${data.id}`);
}

export async function updateQuest(
  _prev: QuestFormState,
  formData: FormData,
): Promise<QuestFormState> {
  const campaignId = String(formData.get("campaign_id") ?? "");
  const id = String(formData.get("id") ?? "");
  const payload = buildPayload(formData);

  if (!payload.title) {
    return { error: "Dê um título à missão." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("quests").update(payload).eq("id", id);

  if (error) {
    return { error: "Não foi possível salvar as alterações." };
  }

  revalidatePath(`/campaign/${campaignId}/quests`);
  revalidatePath(`/campaign/${campaignId}/quests/${id}`);
  redirect(`/campaign/${campaignId}/quests/${id}`);
}

/** Alterna a visibilidade da missão para os jogadores. */
export async function toggleQuestVisibility(formData: FormData): Promise<void> {
  const campaignId = String(formData.get("campaign_id") ?? "");
  const id = String(formData.get("id") ?? "");
  const next = formData.get("next") === "true";

  const supabase = await createClient();
  await supabase
    .from("quests")
    .update({ is_visible_to_players: next })
    .eq("id", id);

  revalidatePath(`/campaign/${campaignId}/quests`);
  revalidatePath(`/campaign/${campaignId}/quests/${id}`);
}

export async function deleteQuest(formData: FormData): Promise<void> {
  const campaignId = String(formData.get("campaign_id") ?? "");
  const id = String(formData.get("id") ?? "");

  const supabase = await createClient();
  await supabase.from("quests").delete().eq("id", id);

  revalidatePath(`/campaign/${campaignId}/quests`);
  redirect(`/campaign/${campaignId}/quests`);
}

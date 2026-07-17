"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export interface SceneFormState {
  error?: string;
}

export async function createScene(
  _prev: SceneFormState,
  formData: FormData,
): Promise<SceneFormState> {
  const campaignId = String(formData.get("campaign_id") ?? "");
  const name = String(formData.get("name") ?? "").trim() || "Cena";
  const mapUrl = String(formData.get("map_image_url") ?? "").trim() || null;

  const supabase = await createClient();

  // A primeira cena da campanha já entra como ativa.
  const { count } = await supabase
    .from("scenes")
    .select("id", { count: "exact", head: true })
    .eq("campaign_id", campaignId);

  const { data, error } = await supabase
    .from("scenes")
    .insert({
      campaign_id: campaignId,
      name,
      map_image_url: mapUrl,
      is_active: (count ?? 0) === 0,
    })
    .select("id")
    .single();

  if (error || !data) {
    return { error: "Não foi possível criar a cena. Tente novamente." };
  }

  revalidatePath(`/campaign/${campaignId}/scenes`);
  redirect(`/campaign/${campaignId}/scenes/${data.id}`);
}

/** Marca a cena escolhida como a ativa (a que os jogadores veem). */
export async function setActiveScene(formData: FormData): Promise<void> {
  const campaignId = String(formData.get("campaign_id") ?? "");
  const id = String(formData.get("id") ?? "");

  const supabase = await createClient();
  await supabase
    .from("scenes")
    .update({ is_active: false })
    .eq("campaign_id", campaignId);
  await supabase.from("scenes").update({ is_active: true }).eq("id", id);

  revalidatePath(`/campaign/${campaignId}/scenes`);
}

export async function deleteScene(formData: FormData): Promise<void> {
  const campaignId = String(formData.get("campaign_id") ?? "");
  const id = String(formData.get("id") ?? "");

  const supabase = await createClient();
  await supabase.from("scenes").delete().eq("id", id);

  revalidatePath(`/campaign/${campaignId}/scenes`);
  redirect(`/campaign/${campaignId}/scenes`);
}

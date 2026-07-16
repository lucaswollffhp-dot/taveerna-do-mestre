"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export interface CreateCampaignState {
  error?: string;
}

export async function createCampaign(
  _prevState: CreateCampaignState,
  formData: FormData,
): Promise<CreateCampaignState> {
  const name = String(formData.get("name") ?? "").trim();
  const setting = String(formData.get("setting") ?? "").trim();
  const tone = String(formData.get("tone") ?? "").trim();

  if (!name) {
    return { error: "Dê um nome à campanha." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Sessão expirada. Entre novamente." };
  }

  const { data: campaign, error } = await supabase
    .from("campaigns")
    .insert({
      name,
      setting: setting || null,
      tone: tone || null,
      master_id: user.id,
    })
    .select("id")
    .single();

  if (error || !campaign) {
    return { error: "Não foi possível criar a campanha. Tente novamente." };
  }

  // Registra o criador como Mestre da campanha.
  await supabase.from("campaign_members").insert({
    campaign_id: campaign.id,
    user_id: user.id,
    role: "master",
  });

  revalidatePath("/dashboard");
  redirect(`/campaign/${campaign.id}`);
}

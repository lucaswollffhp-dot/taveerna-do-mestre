"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { SessionStatus } from "@/lib/types/database.types";

export interface SessionFormState {
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

/** Converte texto multilinha em array JSON de decisões (uma por linha). */
function parseDecisions(raw: FormDataEntryValue | null): string[] {
  return String(raw ?? "")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
}

function buildPayload(formData: FormData) {
  return {
    number: toInt(formData.get("number")),
    title: String(formData.get("title") ?? "").trim(),
    session_date: nullable(formData.get("session_date")),
    status: (String(formData.get("status") ?? "planned") as SessionStatus),
    public_summary: nullable(formData.get("public_summary")),
    master_notes: nullable(formData.get("master_notes")),
    xp_awarded: toInt(formData.get("xp_awarded")),
    decisions: parseDecisions(formData.get("decisions")),
  };
}

export async function createSession(
  _prev: SessionFormState,
  formData: FormData,
): Promise<SessionFormState> {
  const campaignId = String(formData.get("campaign_id") ?? "");
  const payload = buildPayload(formData);

  if (!payload.title) {
    return { error: "Dê um título à sessão." };
  }
  if (payload.number <= 0) {
    return { error: "Informe o número da sessão." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("sessions")
    .insert({ campaign_id: campaignId, ...payload })
    .select("id")
    .single();

  if (error || !data) {
    return {
      error:
        "Não foi possível criar a sessão. Verifique se o número já não existe.",
    };
  }

  revalidatePath(`/campaign/${campaignId}/sessions`);
  redirect(`/campaign/${campaignId}/sessions/${data.id}`);
}

export async function updateSession(
  _prev: SessionFormState,
  formData: FormData,
): Promise<SessionFormState> {
  const campaignId = String(formData.get("campaign_id") ?? "");
  const id = String(formData.get("id") ?? "");
  const payload = buildPayload(formData);

  if (!payload.title) {
    return { error: "Dê um título à sessão." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("sessions").update(payload).eq("id", id);

  if (error) {
    return { error: "Não foi possível salvar as alterações." };
  }

  revalidatePath(`/campaign/${campaignId}/sessions`);
  revalidatePath(`/campaign/${campaignId}/sessions/${id}`);
  redirect(`/campaign/${campaignId}/sessions/${id}`);
}

export async function deleteSession(formData: FormData): Promise<void> {
  const campaignId = String(formData.get("campaign_id") ?? "");
  const id = String(formData.get("id") ?? "");

  const supabase = await createClient();
  await supabase.from("sessions").delete().eq("id", id);

  revalidatePath(`/campaign/${campaignId}/sessions`);
  redirect(`/campaign/${campaignId}/sessions`);
}

"use client";

import { useFormStatus } from "react-dom";
import { toggleQuestVisibility } from "./actions";

function Toggle({ visible }: { visible: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors disabled:opacity-50
        ${
          visible
            ? "border-green-900 bg-success/30 text-green-300 hover:bg-success/50"
            : "border-border bg-surface-raised text-text-secondary hover:text-text"
        }`}
    >
      {visible ? "👁️ Visível aos jogadores" : "🔒 Oculta"}
    </button>
  );
}

export function VisibilityControl({
  campaignId,
  questId,
  visible,
}: {
  campaignId: string;
  questId: string;
  visible: boolean;
}) {
  return (
    <form action={toggleQuestVisibility} className="inline">
      <input type="hidden" name="campaign_id" value={campaignId} />
      <input type="hidden" name="id" value={questId} />
      <input type="hidden" name="next" value={String(!visible)} />
      <Toggle visible={visible} />
    </form>
  );
}

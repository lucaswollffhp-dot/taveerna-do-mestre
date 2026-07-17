import { Icon } from "@/components/ui/Icon";

/**
 * Marca visual de campo privado (visível apenas para o Mestre).
 * Usado ao lado de labels de campos que os jogadores nunca veem.
 */
export function PrivacyBadge({ label = "Privado" }: { label?: string }) {
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full border
        border-primary/40 bg-[#2a1a1a] px-2 py-0.5 font-mono text-[10px]
        uppercase tracking-wide text-primary/90"
      title="Somente o Mestre vê este campo"
    >
      <Icon name="private" size={11} />
      {label}
    </span>
  );
}

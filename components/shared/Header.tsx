import Link from "next/link";
import { LogoutButton } from "./LogoutButton";

interface HeaderProps {
  userLabel?: string;
  /** Destino do logo. Mestre → /dashboard; Jogador → /play. */
  homeHref?: string;
  /** Link para alternar de área (Mestre ↔ Jogador). */
  altArea?: { href: string; label: string };
}

export function Header({
  userLabel,
  homeHref = "/dashboard",
  altArea,
}: HeaderProps) {
  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-surface px-4 md:px-6">
      <Link href={homeHref} className="flex items-center gap-2">
        <span className="text-xl" aria-hidden>
          ⚔️
        </span>
        <span className="font-title text-lg font-semibold text-accent">
          Taverna do Mestre
        </span>
      </Link>
      <div className="flex items-center gap-3">
        {altArea && (
          <Link
            href={altArea.href}
            className="rounded-md border border-border px-3 py-1.5 text-sm text-text-secondary transition-colors hover:border-accent/50 hover:text-text"
          >
            {altArea.label}
          </Link>
        )}
        {userLabel && (
          <span className="hidden text-sm text-text-secondary sm:inline">
            {userLabel}
          </span>
        )}
        <LogoutButton />
      </div>
    </header>
  );
}

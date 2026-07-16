import Link from "next/link";
import { LogoutButton } from "./LogoutButton";

interface HeaderProps {
  userLabel?: string;
}

export function Header({ userLabel }: HeaderProps) {
  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-surface px-4 md:px-6">
      <Link href="/dashboard" className="flex items-center gap-2">
        <span className="text-xl" aria-hidden>
          ⚔️
        </span>
        <span className="font-title text-lg font-semibold text-accent">
          Taverna do Mestre
        </span>
      </Link>
      <div className="flex items-center gap-3">
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

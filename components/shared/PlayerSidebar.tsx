"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
  href: string;
  label: string;
  icon: string;
}

function buildItems(campaignId: string): NavItem[] {
  const base = `/play/${campaignId}`;
  return [
    { href: base, label: "Visão geral", icon: "🏰" },
    { href: `${base}/character`, label: "Meu personagem", icon: "🛡️" },
    { href: `${base}/quests`, label: "Missões", icon: "⚔️" },
    { href: `${base}/npcs`, label: "Conhecidos", icon: "👤" },
    { href: `${base}/locations`, label: "Locais", icon: "🗺️" },
    { href: `${base}/sessions`, label: "Diário", icon: "📜" },
  ];
}

export function PlayerSidebar({ campaignId }: { campaignId: string }) {
  const pathname = usePathname();
  const items = buildItems(campaignId);

  return (
    <aside className="hidden w-60 shrink-0 border-r border-border bg-surface md:block">
      <nav className="flex flex-col gap-1 p-4">
        <Link
          href="/play"
          className="mb-4 text-sm text-text-secondary transition-colors hover:text-accent"
        >
          ← Minhas mesas
        </Link>
        {items.map((item) => {
          const active =
            pathname === item.href ||
            (item.href.split("/").length > 3 && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2 rounded-md px-2 py-2 text-sm transition-colors
                ${
                  active
                    ? "bg-surface-raised text-text"
                    : "text-text-secondary hover:bg-surface-raised hover:text-text"
                }`}
            >
              <span aria-hidden>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon, type IconName } from "@/components/ui/Icon";

interface NavItem {
  href: string;
  label: string;
  icon: IconName;
}

function buildItems(campaignId: string): NavItem[] {
  const base = `/play/${campaignId}`;
  return [
    { href: base, label: "Visão geral", icon: "overview" },
    { href: `${base}/table`, label: "Mesa", icon: "table" },
    { href: `${base}/live`, label: "Painel ao Vivo", icon: "live" },
    { href: `${base}/character`, label: "Meu personagem", icon: "character" },
    { href: `${base}/quests`, label: "Missões", icon: "quests" },
    { href: `${base}/npcs`, label: "Conhecidos", icon: "npcs" },
    { href: `${base}/locations`, label: "Locais", icon: "locations" },
    { href: `${base}/sessions`, label: "Diário", icon: "sessions" },
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
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-text-secondary transition-colors hover:text-accent"
        >
          <Icon name="back" size={15} />
          Minhas mesas
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
              <Icon name={item.icon} size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

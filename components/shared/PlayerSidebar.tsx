"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon, type IconName } from "@/components/ui/Icon";

interface NavItem {
  href: string;
  label: string;
  icon: IconName;
  exact?: boolean;
}

function buildItems(campaignId: string): NavItem[] {
  const base = `/play/${campaignId}`;
  return [
    { href: base, label: "Painel", icon: "overview", exact: true },
    { href: `${base}/table`, label: "Mesa", icon: "table" },
    { href: `${base}/character`, label: "Meu personagem", icon: "character" },
    { href: `${base}/quests`, label: "Missões", icon: "quests" },
    { href: `${base}/npcs`, label: "Conhecidos", icon: "npcs" },
    { href: `${base}/locations`, label: "Locais", icon: "locations" },
    { href: `${base}/sessions`, label: "Diário", icon: "sessions" },
  ];
}

function isActive(pathname: string, item: NavItem): boolean {
  if (item.exact) return pathname === item.href;
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

export function PlayerSidebar({
  campaignId,
  campaignName,
}: {
  campaignId: string;
  campaignName?: string;
}) {
  const pathname = usePathname();
  const items = buildItems(campaignId);
  const base = `/play/${campaignId}`;

  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-border bg-gradient-to-b from-surface to-[#191926] md:flex">
      <div className="border-b border-border px-4 py-4">
        <Link
          href="/play"
          className="mb-2 inline-flex items-center gap-1.5 text-xs text-text-muted transition-colors hover:text-accent"
        >
          <Icon name="back" size={13} />
          Minhas mesas
        </Link>
        <p className="truncate font-title text-lg font-semibold text-text">
          {campaignName ?? "Campanha"}
        </p>
        <span className="mt-1 inline-block rounded-full border border-accent/30 bg-accent/10 px-2 py-0.5 text-[10px] uppercase tracking-wide text-accent">
          Jogador
        </span>
      </div>

      <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-3">
        {items.map((item) => {
          const active = isActive(pathname, item);
          const isMesa = item.href === `${base}/table`;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group relative flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors
                ${
                  active
                    ? "bg-accent/12 font-medium text-accent"
                    : "text-text-secondary hover:bg-surface-raised hover:text-text"
                }`}
            >
              {active && (
                <span className="absolute inset-y-1.5 left-0 w-0.5 rounded-full bg-accent" />
              )}
              <Icon
                name={item.icon}
                size={18}
                className={isMesa && !active ? "text-accent/80" : undefined}
              />
              {item.label}
              {isMesa && (
                <span className="ml-auto rounded bg-accent/20 px-1.5 py-0.5 text-[9px] uppercase tracking-wide text-accent">
                  jogar
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

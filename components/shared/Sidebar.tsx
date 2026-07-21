"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon, type IconName } from "@/components/ui/Icon";

interface NavItem {
  href: string;
  label: string;
  icon: IconName;
  /** Correspondência exata do pathname (para o item "Painel"). */
  exact?: boolean;
}

interface NavGroup {
  title?: string;
  items: NavItem[];
}

function buildGroups(campaignId: string): NavGroup[] {
  const base = `/campaign/${campaignId}`;
  return [
    {
      items: [
        { href: base, label: "Painel", icon: "overview", exact: true },
        { href: `${base}/mesa`, label: "Mesa", icon: "table" },
      ],
    },
    {
      title: "Mundo",
      items: [
        { href: `${base}/characters`, label: "Personagens", icon: "character" },
        { href: `${base}/npcs`, label: "NPCs", icon: "npcs" },
        { href: `${base}/locations`, label: "Locais", icon: "locations" },
        { href: `${base}/factions`, label: "Facções", icon: "factions" },
      ],
    },
    {
      title: "Aventura",
      items: [
        { href: `${base}/quests`, label: "Missões", icon: "quests" },
        { href: `${base}/loot`, label: "Loot", icon: "loot" },
        { href: `${base}/sessions`, label: "Sessões", icon: "sessions" },
      ],
    },
    {
      title: "Ferramentas",
      items: [{ href: `${base}/ai`, label: "IA Assistente", icon: "ai" }],
    },
  ];
}

function isActive(pathname: string, item: NavItem): boolean {
  if (item.exact) return pathname === item.href;
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

export function Sidebar({
  campaignId,
  campaignName,
}: {
  campaignId: string;
  campaignName?: string;
}) {
  const pathname = usePathname();
  const groups = buildGroups(campaignId);
  const base = `/campaign/${campaignId}`;

  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-border bg-gradient-to-b from-surface to-[#191926] md:flex">
      {/* Contexto da campanha */}
      <div className="border-b border-border px-4 py-4">
        <Link
          href="/dashboard"
          className="mb-2 inline-flex items-center gap-1.5 text-xs text-text-muted transition-colors hover:text-accent"
        >
          <Icon name="back" size={13} />
          Campanhas
        </Link>
        <p className="truncate font-title text-lg font-semibold text-text">
          {campaignName ?? "Campanha"}
        </p>
        <span className="mt-1 inline-block rounded-full border border-accent/30 bg-accent/10 px-2 py-0.5 text-[10px] uppercase tracking-wide text-accent">
          Mestre
        </span>
      </div>

      <nav className="flex flex-1 flex-col gap-5 overflow-y-auto p-3">
        {groups.map((group, gi) => (
          <div key={group.title ?? gi}>
            {group.title && (
              <p className="section-label mb-1.5">{group.title}</p>
            )}
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const active = isActive(pathname, item);
                const isMesa = item.href === `${base}/mesa`;
                return (
                  <li key={item.href}>
                    <Link
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
                        className={
                          isMesa && !active ? "text-accent/80" : undefined
                        }
                      />
                      {item.label}
                      {isMesa && (
                        <span className="ml-auto rounded bg-accent/20 px-1.5 py-0.5 text-[9px] uppercase tracking-wide text-accent">
                          jogar
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
  href: string;
  label: string;
  icon: string;
  highlight?: boolean;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

function buildGroups(campaignId: string): NavGroup[] {
  const base = `/campaign/${campaignId}`;
  return [
    {
      title: "Campanha",
      items: [
        { href: base, label: "Visão geral", icon: "🏰" },
        { href: `${base}/sessions`, label: "Sessões", icon: "📜" },
        {
          href: `${base}/live`,
          label: "Painel ao Vivo",
          icon: "🎭",
          highlight: true,
        },
      ],
    },
    {
      title: "Mundo",
      items: [
        { href: `${base}/npcs`, label: "NPCs", icon: "👤" },
        { href: `${base}/locations`, label: "Locais", icon: "🗺️" },
        { href: `${base}/factions`, label: "Facções", icon: "⚜️" },
      ],
    },
    {
      title: "Aventura",
      items: [
        { href: `${base}/quests`, label: "Missões", icon: "⚔️" },
        { href: `${base}/loot`, label: "Loot", icon: "💰" },
      ],
    },
    {
      title: "Ferramentas",
      items: [{ href: `${base}/ai`, label: "IA Assistente", icon: "✨" }],
    },
  ];
}

export function Sidebar({ campaignId }: { campaignId: string }) {
  const pathname = usePathname();
  const groups = buildGroups(campaignId);

  return (
    <aside className="hidden w-60 shrink-0 border-r border-border bg-surface md:block">
      <nav className="flex flex-col gap-6 p-4">
        <Link
          href="/dashboard"
          className="text-sm text-text-secondary transition-colors hover:text-accent"
        >
          ← Campanhas
        </Link>
        {groups.map((group) => (
          <div key={group.title}>
            <p className="mb-2 px-2 font-title text-xs uppercase tracking-widest text-text-muted">
              {group.title}
            </p>
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const active =
                  pathname === item.href ||
                  (item.href.split("/").length > 3 &&
                    pathname.startsWith(item.href));
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`flex items-center gap-2 rounded-md px-2 py-2 text-sm transition-colors
                        ${
                          active
                            ? "bg-surface-raised text-text"
                            : "text-text-secondary hover:bg-surface-raised hover:text-text"
                        }
                        ${item.highlight ? "font-medium text-accent" : ""}`}
                    >
                      <span aria-hidden>{item.icon}</span>
                      {item.label}
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

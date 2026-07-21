import Link from "next/link";
import type { ReactNode } from "react";
import { Icon, type IconName } from "./Icon";

interface PageHeaderProps {
  title: string;
  icon?: IconName;
  description?: string;
  /** Link "voltar" opcional (ex.: para a visão geral da campanha). */
  backHref?: string;
  backLabel?: string;
  /** Ações à direita (botões, links). */
  actions?: ReactNode;
}

export function PageHeader({
  title,
  icon,
  description,
  backHref,
  backLabel = "Voltar",
  actions,
}: PageHeaderProps) {
  return (
    <div className="mb-6">
      {backHref && (
        <Link
          href={backHref}
          className="mb-3 inline-flex items-center gap-1 text-sm text-text-secondary transition-colors hover:text-accent"
        >
          <Icon name="back" size={15} />
          {backLabel}
        </Link>
      )}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
        <div className="flex items-center gap-3">
          {icon && (
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-accent/25 bg-gradient-to-b from-accent/15 to-accent/5 text-accent">
              <Icon name={icon} size={22} />
            </span>
          )}
          <div>
            <h1 className="font-title text-2xl font-bold text-text">{title}</h1>
            {description && (
              <p className="mt-0.5 text-sm text-text-secondary">
                {description}
              </p>
            )}
          </div>
        </div>
        {actions && (
          <div className="flex items-center gap-2">{actions}</div>
        )}
      </div>
    </div>
  );
}

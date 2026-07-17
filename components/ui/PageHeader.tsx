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
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2.5 font-title text-2xl font-bold text-text">
            {icon && <Icon name={icon} size={24} className="text-accent" />}
            {title}
          </h1>
          {description && (
            <p className="mt-1 text-sm text-text-secondary">{description}</p>
          )}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}

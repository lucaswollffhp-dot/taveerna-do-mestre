import type { ReactNode } from "react";
import { Card } from "./Card";
import { Icon, type IconName } from "./Icon";

interface EmptyStateProps {
  icon?: IconName;
  title: string;
  description?: string;
  children?: ReactNode;
}

export function EmptyState({
  icon = "empty",
  title,
  description,
  children,
}: EmptyStateProps) {
  return (
    <Card className="flex flex-col items-center gap-3 py-16 text-center">
      <div
        className="flex h-14 w-14 items-center justify-center rounded-full
          border border-border bg-surface-raised text-text-muted"
      >
        <Icon name={icon} size={26} />
      </div>
      <h2 className="font-title text-lg text-text">{title}</h2>
      {description && (
        <p className="max-w-sm text-sm text-text-secondary">{description}</p>
      )}
      {children}
    </Card>
  );
}

import type { ReactNode } from "react";
import { Card } from "./Card";

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  children?: ReactNode;
}

export function EmptyState({
  icon = "📭",
  title,
  description,
  children,
}: EmptyStateProps) {
  return (
    <Card className="flex flex-col items-center gap-3 py-16 text-center">
      <div className="text-4xl" aria-hidden>
        {icon}
      </div>
      <h2 className="font-title text-lg text-text">{title}</h2>
      {description && (
        <p className="max-w-sm text-sm text-text-secondary">{description}</p>
      )}
      {children}
    </Card>
  );
}

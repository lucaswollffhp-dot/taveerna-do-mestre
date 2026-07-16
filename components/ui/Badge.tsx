import type { HTMLAttributes } from "react";

type Tone =
  | "default"
  | "ally"
  | "neutral"
  | "antagonist"
  | "villain"
  | "success"
  | "warning"
  | "danger"
  | "accent";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
}

const toneClasses: Record<Tone, string> = {
  default: "bg-surface-raised text-text-secondary border-border",
  ally: "bg-ally text-green-300 border-green-900",
  neutral: "bg-unknown text-text-secondary border-border",
  antagonist: "bg-antagonist text-orange-300 border-orange-900",
  villain: "bg-villain text-red-300 border-red-900",
  success: "bg-success/30 text-green-300 border-green-900",
  warning: "bg-warning/30 text-amber-300 border-amber-900",
  danger: "bg-danger text-red-300 border-red-900",
  accent: "bg-accent/20 text-accent border-accent/40",
};

export function Badge({
  tone = "default",
  className = "",
  ...props
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5
        text-xs font-medium ${toneClasses[tone]} ${className}`}
      {...props}
    />
  );
}

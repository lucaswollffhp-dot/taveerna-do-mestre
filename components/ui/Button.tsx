import { forwardRef } from "react";
import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "accent" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-primary hover:bg-primary-hover text-white border border-transparent",
  accent:
    "bg-accent hover:bg-[#c99a0f] text-black font-semibold border border-transparent",
  ghost:
    "bg-transparent hover:bg-surface-raised text-text-secondary hover:text-text border border-border",
  danger:
    "bg-danger hover:bg-[#7a2020] text-white border border-transparent",
};

const sizeClasses: Record<Size, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-3 text-base",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    { variant = "primary", size = "md", fullWidth, className = "", ...props },
    ref,
  ) {
    return (
      <button
        ref={ref}
        className={`inline-flex items-center justify-center gap-2 rounded-md
          font-medium transition-colors disabled:cursor-not-allowed
          disabled:opacity-50 ${variantClasses[variant]} ${sizeClasses[size]}
          ${fullWidth ? "w-full" : ""} ${className}`}
        {...props}
      />
    );
  },
);

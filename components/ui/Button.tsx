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
    "bg-gradient-to-b from-[#a01414] to-[#7a0000] hover:from-[#b81818] hover:to-[#8f0000] text-white border border-[#c02020]/40 shadow-[0_1px_2px_rgba(0,0,0,.5)]",
  accent:
    "bg-gradient-to-b from-[#caa023] to-[#a9780a] hover:from-[#d9ae2e] hover:to-[#b8860b] text-black font-semibold border border-[#e0c060]/40 shadow-[0_1px_2px_rgba(0,0,0,.5)]",
  ghost:
    "bg-surface/60 hover:bg-surface-raised text-text-secondary hover:text-text border border-border",
  danger:
    "bg-gradient-to-b from-[#7a2020] to-[#5a1a1a] hover:from-[#8f2626] hover:to-[#6a2020] text-white border border-[#8a2a2a]/40",
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
        className={`inline-flex items-center justify-center gap-2 rounded-lg
          font-medium transition-all active:translate-y-px disabled:cursor-not-allowed
          disabled:opacity-50 ${variantClasses[variant]} ${sizeClasses[size]}
          ${fullWidth ? "w-full" : ""} ${className}`}
        {...props}
      />
    );
  },
);

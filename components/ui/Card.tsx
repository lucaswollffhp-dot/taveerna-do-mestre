import type { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  raised?: boolean;
}

export function Card({ raised, className = "", ...props }: CardProps) {
  return (
    <div
      className={`${raised ? "card-raised" : "card"} ${className}`}
      {...props}
    />
  );
}

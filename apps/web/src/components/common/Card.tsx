import type { MouseEvent, ReactNode } from "react";

export function Card({
  children,
  className = "",
  onClick,
}: {
  children: ReactNode;
  className?: string;
  onClick?: (e: MouseEvent<HTMLDivElement>) => void;
}) {
  return (
    <div className={`bg-card rounded-2xl border border-border ${className}`} onClick={onClick}>
      {children}
    </div>
  );
}

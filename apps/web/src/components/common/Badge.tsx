import type { ReactNode } from "react";

export function Badge({ children, color = "primary" }: { children: ReactNode; color?: "primary" | "accent" | "muted" | "success" | "danger" }) {
  const map = {
    primary: "bg-primary/10 text-primary",
    accent: "bg-accent/15 text-amber-700 dark:text-amber-400",
    muted: "bg-muted text-muted-foreground",
    success: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    danger: "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold font-mono ${map[color]}`}>
      {children}
    </span>
  );
}

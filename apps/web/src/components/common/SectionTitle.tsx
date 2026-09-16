import type { ReactNode } from "react";

export function SectionTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="font-display font-bold text-lg text-foreground">{children}</h2>
      {action}
    </div>
  );
}

import type { ReactNode } from "react";

export function Layout({ children }: { children: ReactNode }) {
  return (
    <main className="pt-14 pb-20 lg:pb-0 lg:pl-56 min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 lg:px-6 py-6">{children}</div>
    </main>
  );
}

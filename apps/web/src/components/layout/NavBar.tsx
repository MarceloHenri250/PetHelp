import type { Tab } from "@/lib/types";

export function NavBar({ tabs, active, onChange }: { tabs: Tab[]; active: string; onChange: (id: string) => void }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-card border-t border-border flex lg:hidden">
      {tabs.map(t => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          className={`flex-1 flex flex-col items-center gap-1 py-2 text-xs font-medium transition-colors ${active === t.id ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
        >
          <t.icon className="w-5 h-5" />
        </button>
      ))}
    </nav>
  );
}

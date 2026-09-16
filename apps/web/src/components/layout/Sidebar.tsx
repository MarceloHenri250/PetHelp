import type { Tab } from "@/lib/types";

export function Sidebar({ tabs, active, onChange }: { tabs: Tab[]; active: string; onChange: (id: string) => void }) {
  return (
    <aside className="hidden lg:flex fixed top-14 left-0 bottom-0 w-56 bg-sidebar border-r border-sidebar-border flex-col py-4 px-3 gap-1 z-40">
      {tabs.map(t => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${active === t.id ? "bg-primary text-primary-foreground" : "text-sidebar-foreground hover:bg-sidebar-accent"}`}
        >
          <t.icon className="w-4 h-4 shrink-0" />
          {t.label}
        </button>
      ))}
    </aside>
  );
}

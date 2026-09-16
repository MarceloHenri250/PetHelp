import { PawPrint } from "lucide-react";

export function Logo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const s = { sm: "w-7 h-7", md: "w-8 h-8", lg: "w-10 h-10" };
  const t = { sm: "text-base", md: "text-lg", lg: "text-xl" };
  return (
    <div className="flex items-center gap-2">
      <div className={`${s[size]} rounded-xl bg-primary flex items-center justify-center`}>
        <PawPrint className="w-4 h-4 text-primary-foreground" />
      </div>
      <span className={`font-display font-bold ${t[size]} text-foreground tracking-tight`}>
        Pet<span className="text-primary">Help</span>
      </span>
    </div>
  );
}

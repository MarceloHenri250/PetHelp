import { Star } from "lucide-react";

export function StarRating({ value, onChange }: { value: number; onChange?: (v: number) => void }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(s => (
        <button
          key={s}
          onClick={() => onChange?.(s)}
          className={`transition-colors ${s <= value ? "text-accent" : "text-muted"} ${onChange ? "hover:text-accent cursor-pointer" : "cursor-default"}`}
          aria-label={`${s} estrelas`}
        >
          <Star className="w-5 h-5 fill-current" />
        </button>
      ))}
    </div>
  );
}

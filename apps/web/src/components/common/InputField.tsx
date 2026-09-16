import { useState } from "react";
import type { FC } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";

export function InputField({
  label, type = "text", placeholder, value, onChange, icon: Icon, required, hint, readOnly
}: {
  label?: string; type?: string; placeholder?: string; value?: string;
  onChange?: (v: string) => void; icon?: FC<{ className?: string }>;
  required?: boolean; hint?: string; readOnly?: boolean;
}) {
  const [showPw, setShowPw] = useState(false);
  const inputType = type === "password" ? (showPw ? "text" : "password") : type;
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-semibold text-foreground">
          {label}
          {required && <span className="text-destructive ml-0.5">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />}
        <input
          type={inputType}
          placeholder={placeholder}
          value={value}
          onChange={e => onChange?.(e.target.value)}
          readOnly={readOnly}
          className={`w-full rounded-xl border px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-shadow
            ${readOnly
              ? "bg-muted border-border cursor-not-allowed text-muted-foreground select-none"
              : "bg-input-background border-border"
            }
            ${Icon ? "pl-9" : ""}
            ${type === "password" ? "pr-9" : ""}
          `}
        />
        {readOnly && (
          <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/60" />
        )}
        {type === "password" && !readOnly && (
          <button type="button" onClick={() => setShowPw(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
            {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
      </div>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

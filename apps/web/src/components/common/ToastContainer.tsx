import type { ReactNode } from "react";
import { AlertTriangle, CheckCircle, Info, XCircle } from "lucide-react";
import type { Toast, ToastType } from "@/lib/types";

export function ToastContainer({ toasts }: { toasts: Toast[] }) {
  const icons: Record<ToastType, ReactNode> = {
    success: <CheckCircle className="w-4 h-4 text-emerald-500" />,
    error: <XCircle className="w-4 h-4 text-red-500" />,
    info: <Info className="w-4 h-4 text-blue-500" />,
    warning: <AlertTriangle className="w-4 h-4 text-amber-500" />,
  };
  const bg: Record<ToastType, string> = {
    success: "border-emerald-200 dark:border-emerald-800",
    error: "border-red-200 dark:border-red-800",
    info: "border-blue-200 dark:border-blue-800",
    warning: "border-amber-200 dark:border-amber-800",
  };
  return (
    <div className="fixed top-4 right-4 z-[200] flex flex-col gap-2 pointer-events-none">
      {toasts.map(t => (
        <div key={t.id} className={`flex items-center gap-2.5 bg-card text-card-foreground border ${bg[t.type]} shadow-lg rounded-xl px-4 py-3 text-sm font-medium min-w-[260px] pointer-events-auto`}
          style={{ animation: "slideInRight 0.25s ease" }}>
          {icons[t.type]}
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  );
}

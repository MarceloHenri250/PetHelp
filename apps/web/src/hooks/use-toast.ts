import { useState } from "react";
import type { Toast, ToastType } from "@/lib/types";

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const show = (message: string, type: ToastType = "success") => {
    const id = Math.random().toString(36).slice(2);
    setToasts(p => [...p, { id, message, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3500);
  };
  return { toasts, show };
}

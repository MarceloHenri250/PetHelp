import type { FC } from "react";

export type ToastType = "success" | "error" | "info" | "warning";

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

export type ToastFn = (message: string, type?: ToastType) => void;

export interface Notification {
  id: string;
  title: string;
  body: string;
  time: string;
  read: boolean;
  icon: "bell" | "check" | "alert" | "info";
}

export interface Tab {
  id: string;
  label: string;
  icon: FC<{ className?: string }>;
}

export type Role = "tutor" | "vet" | "clinic";

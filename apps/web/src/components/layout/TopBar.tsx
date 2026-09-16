import { useEffect, useRef, useState } from "react";
import { Bell, LogOut, Moon, Settings, Sun } from "lucide-react";
import type { Notification } from "@/lib/types";
import { Logo } from "@/components/common/Logo";
import { NotificationPanel } from "./NotificationPanel";

export function TopBar({
  userName, onLogout, darkMode, onToggleDark, onOpenSettings,
  notifications, onReadNotif, onReadAllNotifs
}: {
  userName: string;
  onLogout: () => void;
  darkMode: boolean;
  onToggleDark: () => void;
  onOpenSettings: () => void;
  notifications: Notification[];
  onReadNotif: (id: string) => void;
  onReadAllNotifs: () => void;
}) {
  const [showNotifs, setShowNotifs] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const unread = notifications.filter(n => !n.read).length;

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifs(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-14 bg-card/80 backdrop-blur-md border-b border-border flex items-center px-4 lg:px-6 gap-4">
      <Logo size="sm" />
      <div className="flex-1" />
      <span className="text-sm text-muted-foreground hidden sm:block">
        Olá, <span className="font-semibold text-foreground">{userName}</span>
      </span>
      <div className="flex items-center gap-1">
        <button onClick={onToggleDark} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-muted transition-colors" aria-label="Alternar tema">
          {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Notifications */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => setShowNotifs(p => !p)}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-muted transition-colors relative"
            aria-label="Notificações"
          >
            <Bell className="w-4 h-4" />
            {unread > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-accent rounded-full" />
            )}
          </button>
          {showNotifs && (
            <NotificationPanel
              notifications={notifications}
              onRead={(id) => { onReadNotif(id); }}
              onReadAll={() => { onReadAllNotifs(); }}
              onClose={() => setShowNotifs(false)}
            />
          )}
        </div>

        {/* Settings */}
        <button
          onClick={() => { onOpenSettings(); }}
          className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-muted transition-colors"
          aria-label="Configurações"
        >
          <Settings className="w-4 h-4" />
        </button>

        <button onClick={onLogout} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-muted transition-colors text-muted-foreground hover:text-destructive" aria-label="Sair">
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}

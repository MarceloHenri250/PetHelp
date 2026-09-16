import { AlertTriangle, Bell, BellOff, CheckCircle, Info, X } from "lucide-react";
import type { Notification } from "@/lib/types";

export function NotificationPanel({
  notifications, onRead, onReadAll, onClose
}: {
  notifications: Notification[];
  onRead: (id: string) => void;
  onReadAll: () => void;
  onClose: () => void;
}) {
  const iconMap = {
    bell: <Bell className="w-3.5 h-3.5 text-primary" />,
    check: <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />,
    alert: <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />,
    info: <Info className="w-3.5 h-3.5 text-blue-500" />,
  };
  const unread = notifications.filter(n => !n.read).length;

  return (
    <div className="absolute top-full right-0 mt-2 w-80 bg-card border border-border rounded-2xl shadow-xl z-[150] overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-foreground text-sm">Notificações</span>
          {unread > 0 && (
            <span className="bg-primary text-primary-foreground text-xs font-bold px-1.5 py-0.5 rounded-full">{unread}</span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {unread > 0 && (
            <button onClick={onReadAll} className="text-xs text-primary hover:underline font-medium">Marcar todas</button>
          )}
          <button onClick={onClose} className="ml-2 p-1 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="max-h-80 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8 text-muted-foreground">
            <BellOff className="w-8 h-8" />
            <span className="text-sm">Nenhuma notificação</span>
          </div>
        ) : (
          notifications.map(n => (
            <button
              key={n.id}
              onClick={() => onRead(n.id)}
              className={`w-full flex items-start gap-3 px-4 py-3 hover:bg-muted/60 transition-colors text-left border-b border-border/50 last:border-0 ${!n.read ? "bg-primary/5" : ""}`}
            >
              <div className={`mt-0.5 w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${!n.read ? "bg-primary/15" : "bg-muted"}`}>
                {iconMap[n.icon]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-1">
                  <p className={`text-sm leading-tight ${!n.read ? "font-semibold text-foreground" : "font-medium text-muted-foreground"}`}>{n.title}</p>
                  {!n.read && <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1" />}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{n.body}</p>
                <p className="text-xs text-muted-foreground/70 mt-1">{n.time}</p>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}

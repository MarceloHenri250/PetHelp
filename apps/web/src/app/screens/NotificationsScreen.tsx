import { useNavigate } from 'react-router';
import { ArrowLeft, Bell, Syringe, Calendar, Link as LinkIcon } from 'lucide-react';
import { useInteraction } from '../context/InteractionContext';
import { useSession } from '../context/SessionContext';
import { useAppNavigation } from '../navigation';
import { TutorShell } from '../components/layout/TutorShell';

export default function NotificationsScreen() {
  const navigate = useNavigate();
  const { user } = useSession();
  const { notifications, markNotificationAsRead } = useInteraction();
  const { goToDashboard } = useAppNavigation();

  const userNotifications = notifications.filter((n) => n.userId === user?.id);
  const unread = userNotifications.filter((n) => !n.read);
  const read = userNotifications.filter((n) => n.read);

  const getIcon = (type: string) => {
    switch (type) {
      case 'vaccine': return <Syringe className="h-5 w-5 text-primary" />;
      case 'appointment': return <Calendar className="h-5 w-5 text-primary" />;
      case 'connection': return <LinkIcon className="h-5 w-5 text-primary" />;
      default: return <Bell className="h-5 w-5 text-primary" />;
    }
  };

  return (
    <TutorShell active="home" title="Notificações" description="Alertas e histórico de mensagens do sistema.">
      {userNotifications.length === 0 ? (
        <div className="rounded-[34px] border border-border/70 bg-card p-10 text-center shadow-[0_24px_60px_-36px_rgba(127,162,106,0.18)]">
          <Bell className="mx-auto mb-4 h-16 w-16 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground">Nenhuma notificação por enquanto</p>
        </div>
      ) : (
        <div className="space-y-6">
          {unread.length > 0 && (
            <section className="rounded-[34px] border border-border/70 bg-card p-6 shadow-[0_24px_60px_-36px_rgba(127,162,106,0.18)]">
              <h2 className="mb-4 text-2xl font-medium text-foreground">Novas</h2>
              <div className="space-y-3">
                {unread.map((notification) => (
                  <button key={notification.id} onClick={() => markNotificationAsRead(notification.id)} className="w-full rounded-[24px] border border-primary/20 bg-primary/10 p-4 text-left transition-colors hover:bg-primary/15">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/20">{getIcon(notification.type)}</div>
                      <div className="flex-1">
                        <p className="mb-1 text-foreground">{notification.title}</p>
                        <p className="mb-2 text-sm text-muted-foreground">{notification.message}</p>
                        <p className="text-xs text-muted-foreground">{notification.date}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </section>
          )}

          {read.length > 0 && (
            <section className="rounded-[34px] border border-border/70 bg-card p-6 shadow-[0_24px_60px_-36px_rgba(127,162,106,0.18)]">
              <h2 className="mb-4 text-2xl font-medium text-foreground">Anteriores</h2>
              <div className="space-y-3">
                {read.map((notification) => (
                  <div key={notification.id} className="rounded-[24px] border border-border bg-muted/25 p-4 opacity-70">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-muted">{getIcon(notification.type)}</div>
                      <div className="flex-1">
                        <p className="mb-1 text-foreground">{notification.title}</p>
                        <p className="mb-2 text-sm text-muted-foreground">{notification.message}</p>
                        <p className="text-xs text-muted-foreground">{notification.date}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </TutorShell>
  );
}

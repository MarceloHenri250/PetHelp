import React from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Bell, Syringe, Calendar, Link as LinkIcon } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function NotificationsScreen() {
  const navigate = useNavigate();
  const { user, notifications, markNotificationAsRead } = useApp();

  const userNotifications = notifications.filter(n => n.userId === user?.id);
  const unread = userNotifications.filter(n => !n.read);
  const read = userNotifications.filter(n => n.read);

  const getIcon = (type: string) => {
    switch (type) {
      case 'vaccine':
        return <Syringe className="w-6 h-6 text-primary" />;
      case 'appointment':
        return <Calendar className="w-6 h-6 text-primary" />;
      case 'connection':
        return <LinkIcon className="w-6 h-6 text-primary" />;
      default:
        return <Bell className="w-6 h-6 text-primary" />;
    }
  };

  const handleNotificationClick = (id: string) => {
    markNotificationAsRead(id);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-card border-b border-border">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <button
            onClick={() => navigate('/owner-dashboard')}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Voltar</span>
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <h1 className="text-3xl text-foreground mb-8">Notificações</h1>

        {userNotifications.length === 0 ? (
          <div className="text-center py-16">
            <Bell className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">Nenhuma notificação por enquanto</p>
          </div>
        ) : (
          <>
            {unread.length > 0 && (
              <div className="bg-card rounded-3xl shadow-lg p-6 mb-6 border border-border">
                <h2 className="text-xl text-foreground mb-4">Novas</h2>
                <div className="space-y-3">
                  {unread.map(notification => (
                    <button
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification.id)}
                      className="w-full bg-primary/10 border border-primary rounded-2xl p-4 text-left transition-colors hover:bg-primary/20"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center flex-shrink-0">
                          {getIcon(notification.type)}
                        </div>
                        <div className="flex-1">
                          <p className="text-foreground mb-1">{notification.title}</p>
                          <p className="text-sm text-muted-foreground mb-2">{notification.message}</p>
                          <p className="text-xs text-muted-foreground">{notification.date}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {read.length > 0 && (
              <div className="bg-card rounded-3xl shadow-lg p-6 border border-border">
                <h2 className="text-xl text-foreground mb-4">Anteriores</h2>
                <div className="space-y-3">
                  {read.map(notification => (
                    <div
                      key={notification.id}
                      className="bg-muted rounded-2xl p-4 opacity-60"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-muted-foreground/10 rounded-xl flex items-center justify-center flex-shrink-0">
                          {getIcon(notification.type)}
                        </div>
                        <div className="flex-1">
                          <p className="text-foreground mb-1">{notification.title}</p>
                          <p className="text-sm text-muted-foreground mb-2">{notification.message}</p>
                          <p className="text-xs text-muted-foreground">{notification.date}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
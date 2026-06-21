import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import {
  CalendarDays,
  CheckCircle2,
  Copy,
  Link2,
  ShieldAlert,
  Stethoscope,
  Users,
} from 'lucide-react';
import ClinicTopBar from './ClinicTopBar';
import { useInteraction } from '../context/InteractionContext';
import { useSession } from '../context/SessionContext';
import { getApiBase, getAuthHeaders } from '../context/shared';
import { useAppNavigation, useDashboardBackLogout } from '../navigation';

type ClinicLink = {
  id: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedBy: 'clinic' | 'veterinarian';
  veterinarianName: string;
  veterinarianEmail: string;
  veterinarianCrmv: string;
  veterinarianCrmvUf: string;
};

export default function ClinicDashboardScreen() {
  const navigate = useNavigate();
  const { user } = useSession();
  const { notifications } = useInteraction();
  const { confirmAndLogout } = useAppNavigation();
  useDashboardBackLogout();

  const [links, setLinks] = useState<ClinicLink[]>([]);
  const [copyFeedback, setCopyFeedback] = useState(false);
  const API_BASE = getApiBase();

  useEffect(() => {
    let cancelled = false;

    const loadLinks = async () => {
      const resp = await fetch(`${API_BASE}/api/clinic-links/me`, {
        headers: getAuthHeaders(),
      });

      if (!resp.ok) return;

      const { data } = await resp.json();
      if (!cancelled) {
        setLinks((data ?? []) as ClinicLink[]);
      }
    };

    void loadLinks();

    return () => {
      cancelled = true;
    };
  }, [API_BASE]);

  const approvedLinks = useMemo(() => links.filter((link) => link.status === 'approved'), [links]);
  const pendingLinks = useMemo(() => links.filter((link) => link.status === 'pending'), [links]);
  const quickLinks = useMemo(() => links.slice(0, 3), [links]);
  const unreadNotifications = notifications.filter((notification) => !notification.read).length;
  const connectionCode = user?.connectionCode?.trim() ?? '';
  const clinicName = user?.clinicName || user?.name || 'Clínica';

  const handleLogout = () => {
    confirmAndLogout();
  };

  const handleCopyConnectionCode = async () => {
    if (!connectionCode) return;

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(connectionCode);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = connectionCode;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }

      setCopyFeedback(true);
      window.setTimeout(() => setCopyFeedback(false), 2000);
    } catch (error) {
      console.error('Falha ao copiar código da clínica:', error);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.10),_transparent_32%),linear-gradient(180deg,_#f8fbff_0%,_#ffffff_100%)]">
      <ClinicTopBar
        clinicName={clinicName}
        notificationsCount={unreadNotifications}
        onNotifications={() => navigate('/notifications')}
        onSettings={() => navigate('/clinic-settings')}
        onLogout={handleLogout}
      />

      <div className="max-w-4xl mx-auto px-6 py-8">
        <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-[28px] border border-border/60 bg-card p-6 shadow-lg shadow-slate-200/40">
            <div className="flex items-start gap-4">
              <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Stethoscope className="w-7 h-7 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Painel da clínica</p>
                <h2 className="text-3xl text-foreground">Gerencie a operação em um só lugar</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Organize a agenda centralizada, acompanhe vínculos e coordene os veterinários parceiros sem sair da dashboard.
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={() => navigate('/clinic-veterinarians')}
                className="inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-3 text-white shadow-sm shadow-primary/20"
              >
                <Users className="w-4 h-4" />
                Gerenciar veterinários
              </button>
              <button
                onClick={() => navigate('/clinic-settings')}
                className="inline-flex items-center gap-2 rounded-2xl border border-border bg-background px-5 py-3 text-foreground"
              >
                <ShieldAlert className="w-4 h-4" />
                Configurações da clínica
              </button>
            </div>

            <div className="mt-6 rounded-2xl border border-primary/10 bg-primary/5 px-4 py-4">
              <p className="text-sm font-medium text-foreground">Acesso rápido explicado</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Use a dashboard para ver o código de conexão, acessar vínculos pendentes e abrir a tela exclusiva de veterinários parceiros.
              </p>
            </div>
          </div>

          <div className="rounded-[28px] border border-border/60 bg-card p-6 shadow-lg shadow-slate-200/40">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-11 w-11 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Link2 className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="text-xl text-foreground">Código da clínica</h3>
                <p className="text-sm text-muted-foreground">Compartilhe com veterinários para iniciar o vínculo.</p>
              </div>
            </div>

            {connectionCode ? (
              <div className="space-y-4">
                <div className="rounded-2xl border border-dashed border-border bg-muted/20 px-4 py-5 text-center">
                  <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-2">Código ativo</p>
                  <p className="font-mono text-lg tracking-[0.35em] text-foreground break-all">{connectionCode}</p>
                </div>
                <button
                  type="button"
                  onClick={handleCopyConnectionCode}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3 text-white"
                >
                  <Copy className="w-4 h-4" />
                  {copyFeedback ? 'Copiado' : 'Copiar código'}
                </button>
              </div>
            ) : (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                <p className="text-sm text-amber-900">
                  Esta clínica ainda não exibe um código de conexão.
                </p>
              </div>
            )}
          </div>
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[28px] border border-border/60 bg-card p-6 shadow-lg shadow-slate-200/40">
            <div className="flex items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="text-xl text-foreground">Solicitações pendentes</h3>
                <p className="text-sm text-muted-foreground">Resumo rápido para acompanhar vínculos aguardando análise.</p>
              </div>
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs text-primary">
                {pendingLinks.length} pendente{pendingLinks.length === 1 ? '' : 's'}
              </span>
            </div>

            <div className="rounded-2xl border border-border bg-muted/20 p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-foreground">{approvedLinks.length} vínculo{approvedLinks.length === 1 ? '' : 's'} ativo{approvedLinks.length === 1 ? '' : 's'}</p>
                  <p className="text-sm text-muted-foreground">A base para agenda por profissional já fica organizada aqui.</p>
                </div>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              {quickLinks.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhum vínculo encontrado ainda.</p>
              ) : (
                quickLinks.map((link) => (
                  <div key={link.id} className="rounded-2xl border border-border bg-background px-4 py-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-foreground">{link.veterinarianName}</p>
                        <p className="text-xs text-muted-foreground">
                          {link.veterinarianEmail} • CRMV {link.veterinarianCrmv}/{link.veterinarianCrmvUf}
                        </p>
                      </div>
                      <span className="rounded-full bg-muted px-2.5 py-1 text-[11px] text-muted-foreground">
                        {link.status === 'approved' ? 'Ativo' : link.status === 'pending' ? 'Pendente' : 'Recusado'}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-[28px] border border-border/60 bg-card p-6 shadow-lg shadow-slate-200/40">
            <div className="flex items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="text-xl text-foreground">Atalhos de operação</h3>
                <p className="text-sm text-muted-foreground">Entradas rápidas para o fluxo da clínica.</p>
              </div>
              <CalendarDays className="w-5 h-5 text-primary" />
            </div>

            <div className="space-y-3">
              <button
                onClick={() => navigate('/clinic-veterinarians')}
                className="w-full rounded-2xl border border-border bg-primary/5 px-4 py-4 text-left transition-colors hover:bg-primary/10"
              >
                <p className="text-foreground">Abrir gerenciamento de veterinários</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Convites, vínculo ativo, especialidades e horários disponíveis.
                </p>
              </button>

              <button
                onClick={() => navigate('/appointments')}
                className="w-full rounded-2xl border border-border bg-background px-4 py-4 text-left transition-colors hover:bg-muted/60"
              >
                <p className="text-foreground">Agenda centralizada</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Planeje atendimentos com base nos horários de cada profissional.
                </p>
              </button>

              <button
                onClick={() => navigate('/notifications')}
                className="w-full rounded-2xl border border-border bg-background px-4 py-4 text-left transition-colors hover:bg-muted/60"
              >
                <p className="text-foreground">Notificações da clínica</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Acompanhe respostas, solicitações e alertas operacionais.
                </p>
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

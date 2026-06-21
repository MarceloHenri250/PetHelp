import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import {
  Bell,
  Calendar,
  CheckCircle2,
  Clock3,
  FileText,
  Link2,
  LogOut,
  MessageSquare,
  Settings,
  Star,
  Stethoscope,
  XCircle,
} from 'lucide-react';
import { useInteraction } from '../context/InteractionContext';
import { useSession } from '../context/SessionContext';
import { getApiBase, getAuthHeaders } from '../context/shared';
import { useAppNavigation, useDashboardBackLogout } from '../navigation';

type ClinicLink = {
  id: string;
  clinicId: string;
  veterinarianId: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedBy: 'clinic' | 'veterinarian';
  clinicName: string;
  veterinarianName: string;
  veterinarianEmail: string;
  veterinarianCrmv: string;
  veterinarianCrmvUf: string;
};

type Review = {
  id: string;
  appointmentId: string;
  petId: string;
  tutorId: string;
  veterinarianId: string;
  clinicName?: string;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
};

export default function VeterinarianDashboardScreen() {
  const navigate = useNavigate();
  const { user } = useSession();
  const { appointments, notifications } = useInteraction();
  const { confirmAndLogout } = useAppNavigation();
  useDashboardBackLogout();

  const [clinicCode, setClinicCode] = useState('');
  const [requesting, setRequesting] = useState(false);
  const [links, setLinks] = useState<ClinicLink[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const API_BASE = getApiBase();

  const unreadNotifications = notifications.filter((notification) => notification.userId === user?.id && !notification.read).length;
  const scheduledAppointments = appointments.filter((appointment) => appointment.status === 'scheduled').length;
  const approvedLinks = useMemo(() => links.filter((link) => link.status === 'approved'), [links]);
  const pendingLinks = useMemo(() => links.filter((link) => link.status === 'pending'), [links]);
  const averageRating = useMemo(() => {
    if (reviews.length === 0) return 0;
    return reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
  }, [reviews]);
  const recentReviews = useMemo(() => reviews.slice(0, 3), [reviews]);

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

  useEffect(() => {
    let cancelled = false;

    const loadReviews = async () => {
      const veterinarianIds = approvedLinks.map((link) => link.veterinarianId);
      if (veterinarianIds.length === 0) {
        setReviews([]);
        return;
      }

      const responses = await Promise.all(
        veterinarianIds.map((veterinarianId) => fetch(`${API_BASE}/api/reviews/veterinarian/${veterinarianId}`, { headers: getAuthHeaders() }))
      );

      if (cancelled) return;

      const collected = await Promise.all(
        responses.flatMap(async (resp) => {
          if (!resp.ok) return [];
          const { data } = await resp.json();
          return (data ?? []) as Review[];
        })
      );

      if (!cancelled) {
        setReviews(collected.flat());
      }
    };

    void loadReviews();

    return () => {
      cancelled = true;
    };
  }, [API_BASE, approvedLinks]);

  const handleLogout = () => confirmAndLogout();

  const handleRequestLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clinicCode.trim()) return;

    setRequesting(true);
    try {
      const resp = await fetch(`${API_BASE}/api/clinic-links/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify({ connectionCode: clinicCode.trim().toUpperCase() }),
      });

      if (!resp.ok) {
        throw new Error((await resp.json()).message ?? 'Request failed');
      }

      const { data } = await resp.json();
      if (data) {
        setLinks((prev) => [data as ClinicLink, ...prev.filter((link) => link.id !== data.id)]);
      }
      setClinicCode('');
    } catch (error) {
      console.error('handleRequestLink error', error);
    } finally {
      setRequesting(false);
    }
  };

  const handleResolveLink = async (linkId: string, status: 'approved' | 'rejected') => {
    const resp = await fetch(`${API_BASE}/api/clinic-links/${linkId}/${status === 'approved' ? 'accept' : 'reject'}`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });

    if (!resp.ok) {
      console.error(await resp.json());
      return;
    }

    const { data } = await resp.json();
    setLinks((prev) => prev.map((link) => (link.id === linkId ? { ...link, ...(data ?? {}) } : link)));
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.10),_transparent_32%),linear-gradient(180deg,_#f8fbff_0%,_#ffffff_100%)]">
      <div className="max-w-6xl mx-auto px-6 py-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
              <Stethoscope className="w-7 h-7 text-white" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Painel do veterinário</p>
              <h1 className="text-3xl text-foreground">{user?.name || 'Veterinário'}</h1>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button onClick={() => navigate('/veterinarian-settings')} className="inline-flex items-center gap-2 rounded-2xl border border-border bg-card px-4 py-3 text-foreground">
              <Settings className="w-4 h-4" />
              Configurações
            </button>
            <button onClick={() => navigate('/notifications')} className="inline-flex items-center gap-2 rounded-2xl border border-border bg-card px-4 py-3 text-foreground">
              <Bell className="w-4 h-4" />
              Notificações
            </button>
            <button onClick={handleLogout} className="inline-flex items-center gap-2 rounded-2xl border border-border bg-card px-4 py-3 text-foreground">
              <LogOut className="w-4 h-4" />
              Sair
            </button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-4 mb-8">
          <div className="rounded-3xl border border-border bg-card p-5 shadow-lg shadow-slate-200/50">
            <Calendar className="w-6 h-6 text-primary mb-4" />
            <p className="text-3xl text-foreground">{scheduledAppointments}</p>
            <p className="text-sm text-muted-foreground">Consultas agendadas</p>
          </div>
          <div className="rounded-3xl border border-border bg-card p-5 shadow-lg shadow-slate-200/50">
            <FileText className="w-6 h-6 text-primary mb-4" />
            <p className="text-3xl text-foreground">{approvedLinks.length}</p>
            <p className="text-sm text-muted-foreground">Clínicas aprovadas</p>
          </div>
          <div className="rounded-3xl bg-primary p-5 text-white shadow-lg shadow-primary/20">
            <Bell className="w-6 h-6 mb-4 text-white/90" />
            <p className="text-3xl">{unreadNotifications}</p>
            <p className="text-sm opacity-90">Notificações novas</p>
          </div>
          <div className="rounded-3xl border border-amber-200 bg-amber-50 p-5 shadow-lg shadow-slate-200/50">
            <Star className="w-6 h-6 text-amber-600 mb-4" />
            <p className="text-3xl text-foreground">{averageRating ? averageRating.toFixed(1) : '0.0'}</p>
            <p className="text-sm text-muted-foreground">Média das avaliações</p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
          <section className="rounded-[28px] border border-border bg-card p-6 shadow-xl shadow-slate-200/50">
            <div className="flex items-center gap-3 mb-4">
              <Link2 className="w-6 h-6 text-primary" />
              <div>
                <h2 className="text-xl text-foreground">Vínculo com clínica</h2>
                <p className="text-sm text-muted-foreground">Solicite acesso por código ou aceite convites enviados pela clínica.</p>
              </div>
            </div>

            <form onSubmit={handleRequestLink} className="flex gap-3 mb-5">
              <input
                type="text"
                value={clinicCode}
                onChange={(e) => setClinicCode(e.target.value.toUpperCase())}
                placeholder="CLINICA1234"
                className="flex-1 rounded-2xl border border-border bg-input px-4 py-3 uppercase tracking-wider text-foreground"
              />
              <button type="submit" disabled={requesting} className="rounded-2xl bg-primary px-5 py-3 text-white disabled:opacity-50">
                {requesting ? 'Solicitando...' : 'Solicitar'}
              </button>
            </form>

            <div className="space-y-3">
              {links.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhuma solicitação cadastrada.</p>
              ) : (
                links.map((link) => (
                  <div key={link.id} className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-muted/30 p-4">
                    <div>
                      <p className="text-foreground">{link.clinicName}</p>
                      <p className="text-sm text-muted-foreground">
                        {link.requestedBy === 'clinic' ? 'Convite da clínica' : 'Solicitação do veterinário'} •{' '}
                        {link.status === 'pending' ? 'pendente' : link.status === 'approved' ? 'aprovada' : 'recusada'}
                      </p>
                    </div>

                    {link.status === 'pending' && link.requestedBy === 'clinic' ? (
                      <div className="flex gap-2">
                        <button onClick={() => handleResolveLink(link.id, 'approved')} className="inline-flex items-center gap-2 rounded-2xl bg-primary px-4 py-2 text-white">
                          <CheckCircle2 className="w-4 h-4" />
                          Aceitar
                        </button>
                        <button onClick={() => handleResolveLink(link.id, 'rejected')} className="inline-flex items-center gap-2 rounded-2xl border border-border px-4 py-2 text-foreground">
                          <XCircle className="w-4 h-4" />
                          Recusar
                        </button>
                      </div>
                    ) : (
                      <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs text-primary">
                        {link.status === 'pending' ? <Clock3 className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                        {link.status}
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="rounded-[28px] border border-border bg-card p-6 shadow-xl shadow-slate-200/50">
            <div className="flex items-center justify-between gap-3 mb-4">
              <div>
                <h2 className="text-xl text-foreground">Reputação</h2>
                <p className="text-sm text-muted-foreground">Avaliações recentes e média geral.</p>
              </div>
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs text-primary">{reviews.length} avaliações</span>
            </div>

            <div className="space-y-3 mb-6">
              {recentReviews.length === 0 ? (
                <div className="rounded-2xl border border-border bg-muted/20 p-4">
                  <p className="text-sm text-muted-foreground">Ainda não há avaliações registradas.</p>
                </div>
              ) : (
                recentReviews.map((review) => (
                  <div key={review.id} className="rounded-2xl border border-border bg-muted/20 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-foreground">{review.tutorId}</p>
                        <p className="text-xs text-muted-foreground">{review.clinicName || 'Atendimento'}</p>
                      </div>
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-3 py-1 text-xs text-amber-700">
                        <Star className="w-3.5 h-3.5" />
                        {review.rating}/5
                      </span>
                    </div>
                    <p className="mt-3 text-sm text-foreground">{review.comment}</p>
                    <p className="mt-2 text-xs text-muted-foreground">{new Date(review.updatedAt).toLocaleDateString('pt-BR')}</p>
                  </div>
                ))
              )}
            </div>

            <div className="rounded-2xl border border-border bg-muted/20 p-4">
              <p className="text-sm text-muted-foreground">Acesso rápido</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button onClick={() => navigate('/medical-history')} className="rounded-full border border-border px-3 py-1 text-xs text-foreground">
                  Prontuário
                </button>
                <button onClick={() => navigate('/appointments')} className="rounded-full border border-border px-3 py-1 text-xs text-foreground">
                  Agenda
                </button>
                <button onClick={() => navigate('/exams')} className="rounded-full border border-border px-3 py-1 text-xs text-foreground">
                  Exames
                </button>
                <button onClick={() => navigate('/notifications')} className="rounded-full border border-border px-3 py-1 text-xs text-foreground">
                  Alertas
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

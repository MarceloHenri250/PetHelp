import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import {
  ArrowRight,
  Building2,
  Calendar,
  CheckCircle2,
  Clock3,
  Dog,
  LogOut,
  PawPrint,
  Plus,
  Search,
  Settings,
  Stethoscope,
  UserPlus,
  XCircle,
} from 'lucide-react';
import { useInteraction } from '../context/InteractionContext';
import { usePets } from '../context/PetsContext';
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

const defaultScheduleForm = {
  petId: '',
  veterinarianId: '',
  date: '',
  time: '',
  reason: '',
};

export default function ClinicDashboardScreen() {
  const navigate = useNavigate();
  const { user } = useSession();
  const { pets, setCurrentPet } = usePets();
  const { appointments, addAppointment, updateAppointment } = useInteraction();
  const { confirmAndLogout } = useAppNavigation();
  useDashboardBackLogout();

  const [searchQuery, setSearchQuery] = useState('');
  const [links, setLinks] = useState<ClinicLink[]>([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [loadingLinkId, setLoadingLinkId] = useState<string | null>(null);
  const [showScheduler, setShowScheduler] = useState(false);
  const [scheduleForm, setScheduleForm] = useState(defaultScheduleForm);
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
  const filteredPets = useMemo(
    () =>
      pets.filter(
        (pet) =>
          pet.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (pet.breed ?? '').toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [pets, searchQuery]
  );
  const clinicAppointments = useMemo(
    () =>
      appointments
        .filter((appointment) => appointment.clinicId === (user?.connectionCode ?? 'clinic1') || appointment.clinicName === user?.clinicName)
        .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time)),
    [appointments, user?.clinicName, user?.connectionCode]
  );
  const workingHours = user?.workingHours as Record<string, { open?: string; close?: string }> | null | undefined;

  const today = new Date().toISOString().slice(0, 10);
  const todayAppointments = clinicAppointments.filter((appointment) => appointment.status === 'scheduled' && appointment.date === today);

  const handleLogout = () => confirmAndLogout();

  const handleInviteVet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    const resp = await fetch(`${API_BASE}/api/clinic-links/request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify({ veterinarianEmail: inviteEmail.trim().toLowerCase() }),
    });

    if (resp.ok) {
      const { data } = await resp.json();
      if (data) {
        setLinks((prev) => [data as ClinicLink, ...prev.filter((item) => item.id !== data.id)]);
      }
      setInviteEmail('');
    }
  };

  const handleResolveLink = async (linkId: string, status: 'approved' | 'rejected') => {
    setLoadingLinkId(linkId);
    try {
      const resp = await fetch(`${API_BASE}/api/clinic-links/${linkId}/${status === 'approved' ? 'approve' : 'reject'}`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      if (!resp.ok) throw new Error((await resp.json()).message ?? 'Link update failed');
      const { data } = await resp.json();
      setLinks((prev) => prev.map((link) => (link.id === linkId ? { ...link, ...(data ?? {}) } : link)));
    } catch (error) {
      console.error('handleResolveLink error', error);
    } finally {
      setLoadingLinkId(null);
    }
  };

  const handleSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    const pet = pets.find((item) => item.id === scheduleForm.petId);
    const veterinarian = approvedLinks.find((item) => item.veterinarianId === scheduleForm.veterinarianId);
    if (!pet || !veterinarian || !scheduleForm.date || !scheduleForm.time || !scheduleForm.reason) return;

    addAppointment({
      petId: pet.id,
      petName: pet.name,
      clinicId: user?.connectionCode ?? 'clinic1',
      clinicName: user?.clinicName ?? 'PetHelp',
      veterinarianId: veterinarian.veterinarianId,
      veterinarianName: veterinarian.veterinarianName,
      veterinarianEmail: veterinarian.veterinarianEmail,
      date: scheduleForm.date,
      time: scheduleForm.time,
      reason: scheduleForm.reason,
      status: 'scheduled',
      ownerId: pet.currentTutorId ?? '',
    });

    setScheduleForm(defaultScheduleForm);
    setShowScheduler(false);
  };

  const handleToggleAppointment = (id: string, nextStatus: 'scheduled' | 'completed' | 'cancelled') => {
    updateAppointment(id, { status: nextStatus });
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.10),_transparent_32%),linear-gradient(180deg,_#f8fbff_0%,_#ffffff_100%)]">
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
              <Building2 className="w-7 h-7 text-white" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Painel da clÃ­nica</p>
              <h1 className="text-3xl text-foreground">{user?.clinicName || 'PetHelp ClÃ­nica'}</h1>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button onClick={() => navigate('/clinic-settings')} className="inline-flex items-center gap-2 rounded-2xl border border-border bg-card px-4 py-3 text-foreground">
              <Settings className="w-4 h-4" />
              ConfiguraÃ§Ãµes
            </button>
            <button onClick={handleLogout} className="inline-flex items-center gap-2 rounded-2xl border border-border bg-card px-4 py-3 text-foreground">
              <LogOut className="w-4 h-4" />
              Sair
            </button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] mb-8">
          <section className="rounded-[30px] border border-border/60 bg-card p-6 shadow-xl shadow-slate-200/50">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-3xl bg-primary/7 p-5 border border-primary/10">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
                  <PawPrint className="w-6 h-6 text-primary" />
                </div>
                <p className="text-3xl text-foreground">{pets.length}</p>
                <p className="text-sm text-muted-foreground">Pets vinculados</p>
              </div>

              <div className="rounded-3xl bg-sky-50 p-5 border border-sky-100">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-100">
                  <Calendar className="w-6 h-6 text-sky-600" />
                </div>
                <p className="text-3xl text-foreground">{todayAppointments.length}</p>
                <p className="text-sm text-muted-foreground">Consultas de hoje</p>
              </div>

              <div className="rounded-3xl bg-emerald-50 p-5 border border-emerald-100">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100">
                  <Stethoscope className="w-6 h-6 text-emerald-600" />
                </div>
                <p className="text-3xl text-foreground">{approvedLinks.length}</p>
                <p className="text-sm text-muted-foreground">VeterinÃ¡rios ativos</p>
              </div>
            </div>

            <div className="mt-6 rounded-[28px] border border-dashed border-border bg-gradient-to-br from-white to-slate-50 p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Clock3 className="w-4 h-4 text-primary" />
                    <h2 className="text-lg text-foreground">HorÃ¡rio de funcionamento</h2>
                  </div>
                  <p className="text-sm text-muted-foreground">Agenda respeita o horÃ¡rio cadastrado pela clÃ­nica.</p>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:w-[520px]">
                  {Object.entries(workingHours ?? {}).slice(0, 4).map(([day, value]) => (
                    <div key={day} className="rounded-2xl border border-border bg-white px-4 py-3">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">{day}</p>
                      <p className="text-sm text-foreground">{value?.open || '--:--'} - {value?.close || '--:--'}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <aside className="space-y-6">
            <section className="rounded-[28px] border border-border/60 bg-card p-6 shadow-xl shadow-slate-200/50">
              <div className="flex items-center gap-3 mb-4">
                <UserPlus className="w-5 h-5 text-primary" />
                <h2 className="text-xl text-foreground">Adicionar veterinÃ¡rio</h2>
              </div>
              <form onSubmit={handleInviteVet} className="space-y-3">
                <input value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="veterinario@exemplo.com" className="w-full rounded-2xl border border-border bg-input px-4 py-3" />
                <button className="w-full rounded-2xl bg-primary px-4 py-3 text-white">Convidar veterinÃ¡rio</button>
              </form>
            </section>

            <section className="rounded-[28px] border border-border/60 bg-card p-6 shadow-xl shadow-slate-200/50">
              <div className="flex items-center justify-between gap-3 mb-4">
                <h2 className="text-xl text-foreground">Agenda dos veterinÃ¡rios</h2>
                <button onClick={() => setShowScheduler((prev) => !prev)} className="inline-flex items-center gap-2 text-sm text-primary">
                  <Plus className="w-4 h-4" />
                  Nova
                </button>
              </div>

              {showScheduler && (
                <form onSubmit={handleSchedule} className="space-y-3 mb-4 rounded-2xl border border-border bg-muted/20 p-4">
                  <select value={scheduleForm.petId} onChange={(e) => setScheduleForm((prev) => ({ ...prev, petId: e.target.value }))} className="w-full rounded-2xl border border-border bg-background px-4 py-3">
                    <option value="">Selecionar pet</option>
                    {filteredPets.map((pet) => (
                      <option key={pet.id} value={pet.id}>{pet.name}</option>
                    ))}
                  </select>
                  <select value={scheduleForm.veterinarianId} onChange={(e) => setScheduleForm((prev) => ({ ...prev, veterinarianId: e.target.value }))} className="w-full rounded-2xl border border-border bg-background px-4 py-3">
                    <option value="">Selecionar veterinÃ¡rio</option>
                    {approvedLinks.map((link) => (
                      <option key={link.veterinarianId} value={link.veterinarianId}>{link.veterinarianName}</option>
                    ))}
                  </select>
                  <div className="grid grid-cols-2 gap-3">
                    <input type="date" value={scheduleForm.date} onChange={(e) => setScheduleForm((prev) => ({ ...prev, date: e.target.value }))} className="rounded-2xl border border-border bg-background px-4 py-3" />
                    <input type="time" value={scheduleForm.time} onChange={(e) => setScheduleForm((prev) => ({ ...prev, time: e.target.value }))} className="rounded-2xl border border-border bg-background px-4 py-3" />
                  </div>
                  <input value={scheduleForm.reason} onChange={(e) => setScheduleForm((prev) => ({ ...prev, reason: e.target.value }))} placeholder="Motivo" className="w-full rounded-2xl border border-border bg-background px-4 py-3" />
                  <button className="w-full rounded-2xl bg-primary px-4 py-3 text-white">Agendar</button>
                </form>
              )}

              <div className="space-y-3">
                {clinicAppointments.slice(0, 5).map((appointment) => (
                  <div key={appointment.id} className="rounded-2xl border border-border bg-muted/25 p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-foreground">{appointment.petName}</p>
                        <p className="text-sm text-muted-foreground">{appointment.reason}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-foreground">{appointment.date}</p>
                        <p className="text-sm text-muted-foreground">{appointment.time}</p>
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                      <span className="rounded-full border border-border bg-white px-3 py-1">
                        {appointment.veterinarianName || 'Sem veterinÃ¡rio'}
                      </span>
                      <span className="rounded-full border border-border bg-white px-3 py-1">
                        {appointment.status}
                      </span>
                      {appointment.status === 'scheduled' && (
                        <button onClick={() => handleToggleAppointment(appointment.id, 'completed')} className="ml-auto inline-flex items-center gap-2 rounded-full bg-emerald-500 px-3 py-1 text-white">
                          <CheckCircle2 className="w-3 h-3" />
                          Concluir
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                {clinicAppointments.length === 0 && <p className="text-sm text-muted-foreground">Nenhuma consulta cadastrada.</p>}
              </div>
            </section>
          </aside>
        </div>

        <section className="rounded-[30px] border border-border/60 bg-card p-6 shadow-xl shadow-slate-200/50 mb-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Search className="w-4 h-4 text-primary" />
                <h2 className="text-xl text-foreground">Registros de pacientes</h2>
              </div>
              <p className="text-sm text-muted-foreground">Somente pets vinculados ao cÃ³digo da clÃ­nica.</p>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar pet..."
              className="w-full rounded-2xl border border-border bg-input px-4 py-3 lg:w-80"
            />
          </div>

          {filteredPets.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border bg-muted/20 p-10 text-center">
              <Dog className="mx-auto mb-4 h-14 w-14 text-muted-foreground/50" />
              <p className="text-muted-foreground">Nenhum pet vinculado Ã  clÃ­nica</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filteredPets.map((pet) => (
                <button
                  key={pet.id}
                  onClick={() => {
                    const selected = pets.find((item) => item.id === pet.id);
                    if (selected) {
                      setCurrentPet(selected);
                      navigate('/pet-profile');
                    }
                  }}
                  className="group rounded-[28px] border border-border bg-gradient-to-br from-white to-slate-50 p-4 text-left transition hover:-translate-y-0.5 hover:shadow-lg"
                >
                  <div className="flex items-start gap-3">
                    {pet.photo ? (
                      <img src={pet.photo} alt={pet.name} className="h-16 w-16 rounded-2xl object-cover" />
                    ) : (
                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                        <PawPrint className="w-6 h-6 text-primary" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-lg text-foreground">{pet.name}</h3>
                      <p className="truncate text-sm text-muted-foreground">{pet.species ? `${pet.species} â€¢ ` : ''}{pet.breed || 'RaÃ§a nÃ£o informada'}</p>
                      <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                        <span className="rounded-full bg-slate-100 px-3 py-1">{pet.age || 'idade?'} </span>
                        <span className="rounded-full bg-slate-100 px-3 py-1">{pet.weight || 'peso?'} </span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-[30px] border border-border/60 bg-card p-6 shadow-xl shadow-slate-200/50">
          <div className="flex items-center justify-between gap-4 mb-4">
            <h2 className="text-xl text-foreground">VÃ­nculos de veterinÃ¡rios</h2>
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs text-primary">
              {pendingLinks.length} pendentes
            </span>
          </div>

          <div className="grid gap-3">
              {pendingLinks.map((link) => (
                <div key={link.id} className="flex flex-col gap-3 rounded-2xl border border-border bg-muted/20 p-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="text-foreground">{link.veterinarianName}</p>
                    <p className="text-sm text-muted-foreground">{link.veterinarianEmail} â€¢ CRMV {link.veterinarianCrmv}/{link.veterinarianCrmvUf}</p>
                  </div>
                  {link.requestedBy === 'veterinarian' ? (
                    <div className="flex gap-2">
                      <button onClick={() => handleResolveLink(link.id, 'approved')} disabled={loadingLinkId === link.id} className="inline-flex items-center gap-2 rounded-2xl bg-primary px-4 py-2 text-white disabled:opacity-50">
                        <CheckCircle2 className="w-4 h-4" />
                        Aprovar
                      </button>
                      <button onClick={() => handleResolveLink(link.id, 'rejected')} disabled={loadingLinkId === link.id} className="inline-flex items-center gap-2 rounded-2xl border border-border px-4 py-2 text-foreground disabled:opacity-50">
                        <XCircle className="w-4 h-4" />
                        Recusar
                      </button>
                    </div>
                  ) : (
                    <span className="inline-flex items-center gap-2 self-start rounded-full bg-amber-100 px-3 py-1 text-xs text-amber-700">
                      <Clock3 className="w-3.5 h-3.5" />
                      Aguardando resposta do veterinÃ¡rio
                    </span>
                  )}
                </div>
              ))}
            {pendingLinks.length === 0 && <p className="text-sm text-muted-foreground">Nenhuma solicitaÃ§Ã£o pendente.</p>}
          </div>
        </section>

        <section className="mt-6 rounded-[28px] border border-border/60 bg-gradient-to-r from-sky-50 to-white p-6">
          <div className="flex items-start gap-4">
            <ArrowRight className="mt-1 w-5 h-5 text-primary" />
            <div>
              <h2 className="text-xl text-foreground">Acesso rÃ¡pido</h2>
              <p className="text-sm text-muted-foreground">A agenda, os vÃ­nculos e o horÃ¡rio de funcionamento agora ficam consolidados na clÃ­nica.</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}



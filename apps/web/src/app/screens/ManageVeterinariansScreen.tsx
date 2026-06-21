import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Clock3,
  Edit3,
  Mail,
  Plus,
  Save,
  Stethoscope,
  Trash2,
  Users,
} from 'lucide-react';
import ClinicTopBar from './ClinicTopBar';
import { useInteraction } from '../context/InteractionContext';
import { useSession } from '../context/SessionContext';
import { getApiBase, getAuthHeaders } from '../context/shared';
import { useAppNavigation, useDashboardBackLogout } from '../navigation';

type ClinicLink = {
  id: string;
  clinicId?: string;
  veterinarianId: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedBy: 'clinic' | 'veterinarian';
  clinicName?: string;
  veterinarianName: string;
  veterinarianEmail: string;
  veterinarianCrmv: string;
  veterinarianCrmvUf: string;
};

type AvailabilitySlot = {
  id: string;
  day: string;
  start: string;
  end: string;
};

type VetSchedule = {
  specialty: string;
  slots: AvailabilitySlot[];
};

const days = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];

const createSlotId = () => Math.random().toString(36).slice(2, 10);

export default function ManageVeterinariansScreen() {
  const navigate = useNavigate();
  const { user } = useSession();
  const { notifications } = useInteraction();
  const { confirmAndLogout } = useAppNavigation();
  const [inviteEmail, setInviteEmail] = useState('');
  const [links, setLinks] = useState<ClinicLink[]>([]);
  const [scheduleMap, setScheduleMap] = useState<Record<string, VetSchedule>>({});
  const [selectedVetId, setSelectedVetId] = useState('');
  const [draftSpecialty, setDraftSpecialty] = useState('');
  const [draftDay, setDraftDay] = useState(days[0]);
  const [draftStart, setDraftStart] = useState('08:00');
  const [draftEnd, setDraftEnd] = useState('12:00');
  const [editingSlotId, setEditingSlotId] = useState<string | null>(null);
  const [savingInvite, setSavingInvite] = useState(false);
  const API_BASE = getApiBase();
  const storageKey = user?.id ? `clinic-vet-schedules:${user.id}` : null;

  useDashboardBackLogout();

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
    if (!storageKey) return;

    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return;
      setScheduleMap(JSON.parse(raw) as Record<string, VetSchedule>);
    } catch (error) {
      console.error('Falha ao carregar agendas dos veterinários:', error);
    }
  }, [storageKey]);

  useEffect(() => {
    if (!storageKey) return;
    localStorage.setItem(storageKey, JSON.stringify(scheduleMap));
  }, [scheduleMap, storageKey]);

  const unreadNotifications = notifications.filter((notification) => !notification.read).length;
  const clinicName = user?.clinicName || user?.name || 'Clínica';
  const approvedLinks = useMemo(() => links.filter((link) => link.status === 'approved'), [links]);
  const pendingLinks = useMemo(() => links.filter((link) => link.status === 'pending'), [links]);
  const selectedVet = approvedLinks.find((link) => link.veterinarianId === selectedVetId) ?? null;
  const currentSchedule = selectedVet ? scheduleMap[selectedVet.veterinarianId] ?? { specialty: '', slots: [] } : { specialty: '', slots: [] };

  useEffect(() => {
    if (approvedLinks.length === 0) {
      setSelectedVetId('');
      return;
    }

    if (!selectedVetId || !approvedLinks.some((link) => link.veterinarianId === selectedVetId)) {
      setSelectedVetId(approvedLinks[0].veterinarianId);
    }
  }, [approvedLinks, selectedVetId]);

  useEffect(() => {
    if (!selectedVet) return;

    const schedule = scheduleMap[selectedVet.veterinarianId];
    setDraftSpecialty(schedule?.specialty ?? '');
  }, [selectedVet, scheduleMap]);

  const handleLogout = () => {
    confirmAndLogout();
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    setSavingInvite(true);

    try {
      const resp = await fetch(`${API_BASE}/api/clinic-links/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify({ veterinarianEmail: inviteEmail.trim().toLowerCase() }),
      });

      if (!resp.ok) {
        throw new Error((await resp.json()).message ?? 'Request failed');
      }

      const { data } = await resp.json();
      if (data) {
        setLinks((prev) => [data as ClinicLink, ...prev.filter((link) => link.id !== data.id)]);
      }

      setInviteEmail('');
    } catch (error) {
      console.error('Falha ao convidar veterinário:', error);
    } finally {
      setSavingInvite(false);
    }
  };

  const persistSchedule = (vetId: string, nextSchedule: VetSchedule) => {
    setScheduleMap((prev) => ({
      ...prev,
      [vetId]: nextSchedule,
    }));
  };

  const handleSaveSpecialty = () => {
    if (!selectedVet) return;
    persistSchedule(selectedVet.veterinarianId, {
      ...currentSchedule,
      specialty: draftSpecialty.trim(),
    });
  };

  const handleAddOrUpdateSlot = () => {
    if (!selectedVet) return;
    if (!draftDay || !draftStart || !draftEnd) return;

    const nextSlot: AvailabilitySlot = {
      id: editingSlotId ?? createSlotId(),
      day: draftDay,
      start: draftStart,
      end: draftEnd,
    };

    const existingSlots = currentSchedule.slots ?? [];
    const nextSlots = editingSlotId
      ? existingSlots.map((slot) => (slot.id === editingSlotId ? nextSlot : slot))
      : [...existingSlots, nextSlot];

    persistSchedule(selectedVet.veterinarianId, {
      specialty: draftSpecialty.trim(),
      slots: nextSlots,
    });

    setEditingSlotId(null);
    setDraftDay(days[0]);
    setDraftStart('08:00');
    setDraftEnd('12:00');
  };

  const handleEditSlot = (slot: AvailabilitySlot) => {
    setEditingSlotId(slot.id);
    setDraftDay(slot.day);
    setDraftStart(slot.start);
    setDraftEnd(slot.end);
  };

  const handleDeleteSlot = (slotId: string) => {
    if (!selectedVet) return;

    persistSchedule(selectedVet.veterinarianId, {
      specialty: draftSpecialty.trim(),
      slots: currentSchedule.slots.filter((slot) => slot.id !== slotId),
    });

    if (editingSlotId === slotId) {
      setEditingSlotId(null);
    }
  };

  const selectedVetLabel = selectedVet ? `${selectedVet.veterinarianName} • CRMV ${selectedVet.veterinarianCrmv}/${selectedVet.veterinarianCrmvUf}` : 'Nenhum veterinário selecionado';

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.10),_transparent_32%),linear-gradient(180deg,_#f8fbff_0%,_#ffffff_100%)]">
      <ClinicTopBar
        clinicName={clinicName}
        notificationsCount={unreadNotifications}
        onNotifications={() => navigate('/notifications')}
        onSettings={() => navigate('/clinic-settings')}
        onLogout={handleLogout}
      />

      <div className="max-w-6xl mx-auto px-6 py-8">
        <button onClick={() => navigate('/clinic-dashboard')} className="mb-6 inline-flex items-center gap-2 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4" />
          Voltar para a dashboard
        </button>

        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <section className="rounded-[28px] border border-border/60 bg-card p-6 shadow-lg shadow-slate-200/40">
            <div className="flex items-start gap-4 mb-6">
              <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Users className="w-7 h-7 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Gestão exclusiva</p>
                <h1 className="text-3xl text-foreground">Veterinários vinculados</h1>
                <p className="mt-2 text-sm text-muted-foreground">
                  Convide profissionais, acompanhe vínculos ativos e configure disponibilidade por especialidade.
                </p>
              </div>
            </div>

            <form onSubmit={handleInvite} className="space-y-3">
              <label className="block text-sm text-foreground">Convidar por e-mail</label>
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="veterinario@exemplo.com"
                    className="w-full rounded-2xl border border-border bg-input py-3 pl-10 pr-4"
                  />
                </div>
                <button type="submit" disabled={savingInvite} className="inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-3 text-white disabled:opacity-60">
                  <Plus className="w-4 h-4" />
                  {savingInvite ? 'Enviando...' : 'Convidar'}
                </button>
              </div>
            </form>

            <div className="mt-6 rounded-2xl border border-border bg-muted/20 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-foreground">{approvedLinks.length} veterinário{approvedLinks.length === 1 ? '' : 's'} ativo{approvedLinks.length === 1 ? '' : 's'}</p>
                  <p className="text-sm text-muted-foreground">{pendingLinks.length} solicitação{pendingLinks.length === 1 ? '' : 'ões'} pendente{pendingLinks.length === 1 ? '' : 's'}</p>
                </div>
                <ClipboardList className="w-5 h-5 text-primary" />
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {approvedLinks.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border bg-background p-4">
                  <p className="text-sm text-muted-foreground">Nenhum veterinário ativo ainda.</p>
                </div>
              ) : (
                approvedLinks.map((link) => {
                  const isSelected = selectedVetId === link.veterinarianId;

                  return (
                    <button
                      key={link.id}
                      onClick={() => setSelectedVetId(link.veterinarianId)}
                      className={`w-full rounded-2xl border px-4 py-4 text-left transition-colors ${
                        isSelected ? 'border-primary/30 bg-primary/5' : 'border-border bg-background hover:bg-muted/60'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-foreground">{link.veterinarianName}</p>
                          <p className="text-sm text-muted-foreground">{link.veterinarianEmail}</p>
                          <p className="text-xs text-muted-foreground">CRMV {link.veterinarianCrmv}/{link.veterinarianCrmvUf}</p>
                        </div>
                        {isSelected && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs text-primary">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Selecionado
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </section>

          <section className="rounded-[28px] border border-border/60 bg-card p-6 shadow-lg shadow-slate-200/40">
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <p className="text-sm text-muted-foreground">Agenda por profissional</p>
                <h2 className="text-2xl text-foreground">{selectedVetLabel}</h2>
              </div>
              <div className="rounded-full bg-primary/10 px-3 py-1 text-xs text-primary">
                {selectedVet ? 'Ativo' : 'Sem seleção'}
              </div>
            </div>

            {selectedVet ? (
              <div className="space-y-6">
                <div className="rounded-2xl border border-border bg-muted/20 p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Stethoscope className="w-5 h-5 text-primary" />
                    <h3 className="text-lg text-foreground">Especialidade</h3>
                  </div>
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <input
                      value={draftSpecialty}
                      onChange={(e) => setDraftSpecialty(e.target.value)}
                      placeholder="Ex.: Dermatologia, Cardiologia, Clínica geral"
                      className="flex-1 rounded-2xl border border-border bg-background px-4 py-3"
                    />
                    <button onClick={handleSaveSpecialty} className="inline-flex items-center gap-2 rounded-2xl border border-border bg-background px-4 py-3 text-foreground">
                      <Save className="w-4 h-4" />
                      Salvar especialidade
                    </button>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Esta informação prepara a filtragem da agenda do tutor por profissional e especialidade.
                  </p>
                </div>

                <div className="rounded-2xl border border-border bg-muted/20 p-4">
                  <div className="flex items-center gap-3 mb-4">
                    <CalendarDays className="w-5 h-5 text-primary" />
                    <h3 className="text-lg text-foreground">Cadastrar horários disponíveis</h3>
                  </div>

                  <div className="grid gap-3 md:grid-cols-4">
                    <select value={draftDay} onChange={(e) => setDraftDay(e.target.value)} className="rounded-2xl border border-border bg-background px-4 py-3">
                      {days.map((day) => (
                        <option key={day} value={day}>
                          {day}
                        </option>
                      ))}
                    </select>
                    <input type="time" value={draftStart} onChange={(e) => setDraftStart(e.target.value)} className="rounded-2xl border border-border bg-background px-4 py-3" />
                    <input type="time" value={draftEnd} onChange={(e) => setDraftEnd(e.target.value)} className="rounded-2xl border border-border bg-background px-4 py-3" />
                    <button onClick={handleAddOrUpdateSlot} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3 text-white">
                      <Plus className="w-4 h-4" />
                      {editingSlotId ? 'Atualizar horário' : 'Adicionar horário'}
                    </button>
                  </div>

                  {editingSlotId && (
                    <p className="mt-3 text-xs text-muted-foreground">Você está editando um horário existente. Salve para substituir o período atual.</p>
                  )}
                </div>

                <div className="rounded-2xl border border-border bg-background p-4">
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <div>
                      <h3 className="text-lg text-foreground">Horários cadastrados</h3>
                      <p className="text-sm text-muted-foreground">
                        {currentSchedule.slots.length} intervalo{currentSchedule.slots.length === 1 ? '' : 's'} disponível{currentSchedule.slots.length === 1 ? '' : 'eis'}
                      </p>
                    </div>
                    <Clock3 className="w-5 h-5 text-primary" />
                  </div>

                  <div className="space-y-3">
                    {currentSchedule.slots.length === 0 ? (
                      <p className="text-sm text-muted-foreground">Nenhum horário cadastrado para este veterinário.</p>
                    ) : (
                      currentSchedule.slots.map((slot) => (
                        <div key={slot.id} className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-muted/20 px-4 py-3">
                          <div>
                            <p className="text-foreground">{slot.day}</p>
                            <p className="text-sm text-muted-foreground">
                              {slot.start} - {slot.end}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => handleEditSlot(slot)} className="inline-flex items-center gap-2 rounded-2xl border border-border bg-background px-3 py-2 text-sm text-foreground">
                              <Edit3 className="w-4 h-4" />
                              Editar
                            </button>
                            <button onClick={() => handleDeleteSlot(slot.id)} className="inline-flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                              <Trash2 className="w-4 h-4" />
                              Excluir
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-border bg-muted/20 p-6">
                <p className="text-sm text-muted-foreground">
                  Selecione um veterinário ativo para definir especialidade e horários.
                </p>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

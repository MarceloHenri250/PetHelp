import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Calendar, Clock, Mail, MapPin, MessageSquare, PenLine, Plus, Star, Trash2, X } from 'lucide-react';
import { useInteraction } from '../context/InteractionContext';
import { usePets } from '../context/PetsContext';
import { useReviews } from '../context/ReviewsContext';
import { useSession } from '../context/SessionContext';
import { getApiBase, getAuthHeaders, type Appointment } from '../context/shared';
import { useAppNavigation } from '../navigation';
import { TutorShell } from '../components/layout/TutorShell';
import SearchablePicker, { type SearchablePickerItem } from '../components/forms/SearchablePicker';

type CatalogEntry = SearchablePickerItem & {
  type: 'clinic' | 'veterinarian';
  name: string;
  clinicName?: string;
  connectionCode?: string | null;
  address?: string | null;
  specialty?: string | null;
  crmv?: string | null;
  crmvUf?: string | null;
  veterinarianEmail?: string | null;
  veterinarianPhone?: string | null;
};

export default function AppointmentsScreen() {
  const navigate = useNavigate();
  const { user } = useSession();
  const { currentPet } = usePets();
  const { appointments, addAppointment } = useInteraction();
  const { getReviewForAppointment, upsertReview, deleteReview } = useReviews();
  const { goToDashboard } = useAppNavigation();
  const API_BASE = getApiBase();

  const [showNewAppointment, setShowNewAppointment] = useState(false);
  const [targetType, setTargetType] = useState<'clinic' | 'veterinarian'>('clinic');
  const [catalogQuery, setCatalogQuery] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState('');
  const [catalogItems, setCatalogItems] = useState<CatalogEntry[]>([]);
  const [selectedCatalogId, setSelectedCatalogId] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [reason, setReason] = useState('');
  const [loadingCatalog, setLoadingCatalog] = useState(false);
  const [reviewAppointmentId, setReviewAppointmentId] = useState<string | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const userAppointments = useMemo(() => (user?.userType === 'owner' ? appointments.filter((a) => a.ownerId === user.id) : appointments), [appointments, user?.id, user?.userType]);
  const scheduled = userAppointments.filter((a) => a.status === 'scheduled');
  const completed = userAppointments.filter((a) => a.status === 'completed');
  const activeReviewAppointment = reviewAppointmentId ? userAppointments.find((appointment) => appointment.id === reviewAppointmentId) ?? null : null;
  const activeReview = activeReviewAppointment ? getReviewForAppointment(activeReviewAppointment.id) : null;
  const selectedCatalogItem = catalogItems.find((item) => item.id === selectedCatalogId) ?? null;

  useEffect(() => {
    if (!showNewAppointment) return;

    const controller = new AbortController();
    const loadCatalog = async () => {
      setLoadingCatalog(true);
      try {
        const params = new URLSearchParams();
        params.set('type', targetType);
        if (catalogQuery.trim()) params.set('query', catalogQuery.trim());
        if (targetType === 'veterinarian' && specialtyFilter.trim()) params.set('specialty', specialtyFilter.trim());

        const resp = await fetch(`${API_BASE}/api/users/catalog?${params.toString()}`, {
          headers: getAuthHeaders(),
          signal: controller.signal,
        });

        if (!resp.ok) {
          setCatalogItems([]);
          return;
        }

        const { data } = await resp.json();
        const items = (data ?? []).map((entry: any) => ({
          id: String(entry.id),
          type: entry.type === 'veterinarian' ? 'veterinarian' : 'clinic',
          name: entry.name,
          label: entry.type === 'veterinarian'
            ? `${entry.name}${entry.specialty ? ` • ${entry.specialty}` : ''}`
            : `${entry.name}${entry.address ? ` • ${entry.address}` : ''}`,
          description: entry.type === 'veterinarian'
            ? `${entry.crmv ? `CRMV ${entry.crmv}${entry.crmvUf ? `/${entry.crmvUf}` : ''}` : 'Veterinário cadastrado'}`
            : `${entry.connectionCode ? `Código ${entry.connectionCode}` : 'Clínica cadastrada'}`,
          clinicName: entry.clinicName,
          connectionCode: entry.connectionCode,
          address: entry.address,
          specialty: entry.specialty,
          crmv: entry.crmv,
          crmvUf: entry.crmvUf,
          veterinarianEmail: entry.veterinarianEmail,
          veterinarianPhone: entry.veterinarianPhone,
        })) as CatalogEntry[];

        setCatalogItems(items);
        setSelectedCatalogId((current) => (items.some((item) => item.id === current) ? current : ''));
      } catch (error) {
        if (!(error instanceof DOMException && error.name === 'AbortError')) {
          console.error('Falha ao carregar catálogo de agendamentos:', error);
          setCatalogItems([]);
        }
      } finally {
        setLoadingCatalog(false);
      }
    };

    void loadCatalog();

    return () => controller.abort();
  }, [API_BASE, catalogQuery, showNewAppointment, specialtyFilter, targetType]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (!currentPet) {
      setFeedback({ type: 'error', message: 'Selecione um pet antes de agendar.' });
      return;
    }

    if (!selectedCatalogItem) {
      setFeedback({ type: 'error', message: `Selecione uma ${targetType === 'clinic' ? 'clínica' : 'especialidade/profissional'} existente.` });
      return;
    }

    if (!date || !time || !reason.trim()) {
      setFeedback({ type: 'error', message: 'Preencha data, horário e motivo.' });
      return;
    }

    const appointmentPayload: Omit<Appointment, 'id'> = {
      petId: currentPet.id,
      petName: currentPet.name,
      clinicId: targetType === 'clinic' ? selectedCatalogItem.id : null,
      clinicName: targetType === 'clinic' ? selectedCatalogItem.name : null,
      veterinarianId: targetType === 'veterinarian' ? selectedCatalogItem.id : null,
      veterinarianName: targetType === 'veterinarian' ? selectedCatalogItem.name : null,
      veterinarianEmail: targetType === 'veterinarian' ? selectedCatalogItem.veterinarianEmail ?? null : null,
      veterinarianPhone: targetType === 'veterinarian' ? selectedCatalogItem.veterinarianPhone ?? null : null,
      targetType,
      date,
      time,
      reason,
      status: 'scheduled',
      ownerId: user?.id ?? '',
    };

    try {
      await addAppointment(appointmentPayload);
      setFeedback({ type: 'success', message: 'Consulta agendada com sucesso.' });
      setShowNewAppointment(false);
      setDate('');
      setTime('');
      setReason('');
      setCatalogQuery('');
      setSpecialtyFilter('');
      setSelectedCatalogId('');
    } catch (error) {
      console.error('Falha ao agendar consulta:', error);
      setFeedback({ type: 'error', message: 'Não foi possível agendar a consulta.' });
    }
  };

  const openReview = (appointmentId: string) => {
    const appointment = userAppointments.find((item) => item.id === appointmentId);
    if (!appointment || appointment.status !== 'completed') return;
    const review = getReviewForAppointment(appointmentId);
    setReviewAppointmentId(appointmentId);
    setReviewRating(review?.rating ?? 5);
    setReviewComment(review?.comment ?? '');
  };

  const closeReview = () => {
    setReviewAppointmentId(null);
    setReviewRating(5);
    setReviewComment('');
  };

  const submitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeReviewAppointment || activeReviewAppointment.status !== 'completed' || !user) return;
    upsertReview({
      id: activeReview?.id,
      tutorId: user.id,
      tutorName: user.name,
      veterinarianId: activeReviewAppointment.veterinarianId ?? activeReviewAppointment.clinicId ?? '',
      veterinarianName: activeReviewAppointment.veterinarianName || activeReviewAppointment.clinicName || '',
      clinicName: activeReviewAppointment.clinicName ?? undefined,
      appointmentId: activeReviewAppointment.id,
      petId: activeReviewAppointment.petId,
      rating: reviewRating,
      comment: reviewComment.trim() || 'Sem comentário',
    });
    closeReview();
  };

  const removeReview = () => {
    if (!activeReview) return;
    deleteReview(activeReview.id);
    closeReview();
  };

  const catalogCaption = targetType === 'clinic' ? 'Busque clínicas já cadastradas' : 'Busque veterinários e filtre por especialidade';

  return (
    <TutorShell
      active="appointments"
      title="Agenda"
      description="Agendamentos com clínica ou veterinário específico."
      actions={user?.userType === 'owner' ? <button onClick={() => setShowNewAppointment(true)} className="inline-flex items-center gap-2 rounded-[18px] bg-primary px-5 py-3 text-white transition-colors hover:bg-primary/90"><Plus className="h-5 w-5" />Nova Consulta</button> : null}
    >
      <div className="space-y-6">
        {feedback ? (
          <div className={`rounded-2xl border px-4 py-3 text-sm ${feedback.type === 'success' ? 'border-green-200 bg-green-50 text-green-700' : 'border-red-200 bg-red-50 text-red-700'}`}>
            {feedback.message}
          </div>
        ) : null}

        {showNewAppointment && (
          <section className="rounded-[34px] border border-border/70 bg-card p-6 shadow-[0_24px_60px_-36px_rgba(127,162,106,0.18)] sm:p-8">
            <div className="mb-6 flex items-center justify-between gap-3">
              <h2 className="text-2xl font-medium text-foreground">Agendar Nova Consulta</h2>
              <button onClick={() => setShowNewAppointment(false)} className="rounded-full border border-border bg-background p-2 text-muted-foreground transition-colors hover:bg-muted"><X className="h-5 w-5" /></button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-foreground">Destino do agendamento</label>
                  <select value={targetType} onChange={(event) => { setTargetType(event.target.value as 'clinic' | 'veterinarian'); setSelectedCatalogId(''); setCatalogQuery(''); }} className="w-full rounded-[18px] border border-border bg-[#efe9de] px-4 py-3 text-foreground outline-none focus:border-primary">
                    <option value="clinic">Clínica</option>
                    <option value="veterinarian">Veterinário</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-foreground">Especialidade</label>
                  <input value={specialtyFilter} onChange={(event) => setSpecialtyFilter(event.target.value)} disabled={targetType === 'clinic'} className="w-full rounded-[18px] border border-border bg-[#efe9de] px-4 py-3 text-foreground outline-none transition-colors focus:border-primary disabled:cursor-not-allowed disabled:opacity-60" placeholder="Dermatologia, ortopedia, felinos" />
                </div>
              </div>

              <SearchablePicker key={`${targetType}-${specialtyFilter}`}
                label={targetType === 'clinic' ? 'Clínica' : 'Veterinário'}
                placeholder={targetType === 'clinic' ? 'Digite o nome da clínica' : 'Digite o nome do veterinário'}
                items={catalogItems}
                selectedId={selectedCatalogId}
                onSelect={(item) => setSelectedCatalogId(item?.id ?? '')}
                emptyText={loadingCatalog ? 'Carregando opções...' : catalogCaption}
              />

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-foreground">Data</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                    <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full rounded-[18px] border border-border bg-[#efe9de] py-3 pl-12 pr-4 text-foreground outline-none transition-colors focus:border-primary" required />
                  </div>
                </div>
                <div>
                  <label className="mb-2 block text-foreground">Horário</label>
                  <div className="relative">
                    <Clock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                    <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="w-full rounded-[18px] border border-border bg-[#efe9de] py-3 pl-12 pr-4 text-foreground outline-none transition-colors focus:border-primary" required />
                  </div>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-foreground">Motivo</label>
                <textarea value={reason} onChange={(e) => setReason(e.target.value)} className="min-h-[110px] w-full rounded-[18px] border border-border bg-[#efe9de] px-4 py-3 text-foreground outline-none transition-colors focus:border-primary" rows={3} placeholder="Ex: Checkup anual, vacinação, sintomas de prostração, etc." required />
              </div>

              <button type="submit" className="inline-flex w-full items-center justify-center gap-2 rounded-[18px] bg-primary py-3 text-white transition-colors hover:bg-primary/90">
                Confirmar Agendamento
              </button>
            </form>
          </section>
        )}

        <section className="rounded-[34px] border border-border/70 bg-card p-6 shadow-[0_24px_60px_-36px_rgba(127,162,106,0.18)] sm:p-8">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-2xl font-medium text-foreground">Agendadas</h2>
            <span className="text-sm text-muted-foreground">{scheduled.length} consultas</span>
          </div>
          {scheduled.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">Nenhuma consulta agendada</p>
          ) : (
            <div className="space-y-3">
              {scheduled.map((appointment) => (
                <div key={appointment.id} className="flex items-center gap-4 rounded-[24px] border border-border/70 bg-muted/25 p-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary"><Calendar className="h-6 w-6" /></div>
                  <div className="flex-1">
                    <p className="mb-1 text-foreground">{appointment.petName}</p>
                    <p className="text-sm text-muted-foreground">{appointment.reason}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{appointment.veterinarianName || appointment.clinicName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-foreground">{appointment.date}</p>
                    <p className="text-sm text-muted-foreground">{appointment.time}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-[34px] border border-border/70 bg-card p-6 shadow-[0_24px_60px_-36px_rgba(127,162,106,0.18)] sm:p-8">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-2xl font-medium text-foreground">Concluídas</h2>
            <span className="text-sm text-muted-foreground">{completed.length} consultas</span>
          </div>
          {completed.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">Nenhuma consulta concluída</p>
          ) : (
            <div className="space-y-3">
              {completed.map((appointment) => {
                const review = getReviewForAppointment(appointment.id);
                return (
                  <div key={appointment.id} className="flex items-start gap-4 rounded-[24px] border border-border/70 bg-muted/25 p-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-muted text-muted-foreground"><Calendar className="h-6 w-6" /></div>
                    <div className="min-w-0 flex-1">
                      <p className="mb-1 text-foreground">{appointment.petName}</p>
                      <p className="text-sm text-muted-foreground">{appointment.reason}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{appointment.veterinarianName || appointment.clinicName}</p>
                      {appointment.veterinarianEmail && (
                        <a href={`mailto:${appointment.veterinarianEmail}`} className="mt-3 inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1 text-xs text-foreground transition-colors hover:bg-muted">
                          <Mail className="h-3.5 w-3.5" />Contato direto
                        </a>
                      )}
                      <div className="mt-3 flex flex-wrap gap-2 text-xs">
                        {review ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-primary"><MessageSquare className="h-3.5 w-3.5" />Avaliação registrada</span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-3 py-1 text-amber-600"><MessageSquare className="h-3.5 w-3.5" />Sem avaliação</span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2 text-right">
                      <p className="text-foreground">{appointment.date}</p>
                      <p className="text-sm text-muted-foreground">{appointment.time}</p>
                      {user?.userType === 'owner' && appointment.veterinarianId && (
                        <button onClick={() => openReview(appointment.id)} className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1 text-xs text-foreground transition-colors hover:bg-muted">
                          <PenLine className="h-3.5 w-3.5" />{review ? 'Editar avaliação' : 'Avaliar'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {activeReviewAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" role="dialog" aria-modal="true">
          <div className="w-full max-w-lg rounded-[32px] border border-border bg-card shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
              <div>
                <h3 className="text-lg text-foreground">Avaliar atendimento</h3>
                <p className="text-xs text-muted-foreground">{activeReviewAppointment.veterinarianName || activeReviewAppointment.clinicName}</p>
              </div>
              <button onClick={closeReview} className="rounded-full border border-border bg-background px-3 py-1.5 text-sm text-foreground transition-colors hover:bg-muted">Fechar</button>
            </div>
            <form onSubmit={submitReview} className="space-y-4 px-5 py-5">
              <div>
                <label className="mb-2 block text-sm text-foreground">Nota</label>
                <div className="flex flex-wrap gap-2">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button key={value} type="button" onClick={() => setReviewRating(value)} className={`inline-flex items-center gap-1 rounded-full border px-3 py-2 text-sm transition-colors ${reviewRating >= value ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-background text-foreground'}`}>
                      <Star className="h-4 w-4" />{value}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="mb-2 block text-sm text-foreground">Comentário</label>
                <textarea value={reviewComment} onChange={(event) => setReviewComment(event.target.value)} rows={4} className="w-full rounded-[18px] border border-border bg-background px-4 py-3 text-foreground" placeholder="Descreva a qualidade do atendimento..." />
              </div>
              <div className="flex items-center justify-between gap-3">
                <div>{activeReview && <button type="button" onClick={removeReview} className="inline-flex items-center gap-2 rounded-[18px] border border-rose-300 bg-rose-50 px-4 py-2 text-rose-700 transition-colors hover:bg-rose-100"><Trash2 className="h-4 w-4" />Excluir</button>}</div>
                <div className="flex gap-2">
                  <button type="button" onClick={closeReview} className="rounded-[18px] border border-border px-4 py-2 text-foreground transition-colors hover:bg-muted">Cancelar</button>
                  <button type="submit" className="rounded-[18px] bg-primary px-4 py-2 text-white transition-colors hover:bg-primary/90">Salvar avaliação</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </TutorShell>
  );
}


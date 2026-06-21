import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, CalendarDays, Clock3, Edit3, Plus, ShieldAlert, Stethoscope, Trash2, X } from 'lucide-react';
import { useInteraction } from '../context/InteractionContext';
import { useSession } from '../context/SessionContext';
import { useAppNavigation, useDashboardBackLogout } from '../navigation';
import VeterinarianTopBar from './VeterinarianTopBar';

type ScheduleStatus = 'available' | 'blocked';

type ScheduleItem = {
  id: string;
  day: string;
  start: string;
  end: string;
  title: string;
  status: ScheduleStatus;
};

const dayOrder = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];

function getStorageKey(userId?: string) {
  return userId ? `veterinarian-schedule:${userId}` : null;
}

function readSchedule(key: string | null) {
  if (!key || typeof window === 'undefined') return [] as ScheduleItem[];

  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [] as ScheduleItem[];
    const parsed = JSON.parse(raw) as ScheduleItem[];
    if (!Array.isArray(parsed)) return [] as ScheduleItem[];
    return parsed.filter((item) => typeof item?.id === 'string' && typeof item?.day === 'string');
  } catch {
    return [] as ScheduleItem[];
  }
}

function timeToMinutes(value: string) {
  const [hours, minutes] = value.split(':').map(Number);
  return Number.isFinite(hours) && Number.isFinite(minutes) ? hours * 60 + minutes : -1;
}

function sortSchedule(left: ScheduleItem, right: ScheduleItem) {
  const dayDelta = dayOrder.indexOf(left.day) - dayOrder.indexOf(right.day);
  if (dayDelta !== 0) return dayDelta;
  return timeToMinutes(left.start) - timeToMinutes(right.start);
}

function intervalsOverlap(leftStart: string, leftEnd: string, rightStart: string, rightEnd: string) {
  const leftStartMinutes = timeToMinutes(leftStart);
  const leftEndMinutes = timeToMinutes(leftEnd);
  const rightStartMinutes = timeToMinutes(rightStart);
  const rightEndMinutes = timeToMinutes(rightEnd);
  return leftStartMinutes < rightEndMinutes && rightStartMinutes < leftEndMinutes;
}

export default function VeterinarianScheduleScreen() {
  const navigate = useNavigate();
  const { user } = useSession();
  const { notifications } = useInteraction();
  const { confirmAndLogout } = useAppNavigation();
  useDashboardBackLogout();

  const [items, setItems] = useState<ScheduleItem[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [day, setDay] = useState(dayOrder[0]);
  const [start, setStart] = useState('08:00');
  const [end, setEnd] = useState('09:00');
  const [title, setTitle] = useState('Consulta disponível');
  const [status, setStatus] = useState<ScheduleStatus>('available');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const storageKey = getStorageKey(user?.id);

  useEffect(() => {
    setItems(readSchedule(storageKey));
  }, [storageKey]);

  useEffect(() => {
    if (!storageKey) return;
    localStorage.setItem(storageKey, JSON.stringify(items));
  }, [items, storageKey]);

  const unreadNotifications = notifications.filter((notification) => notification.userId === user?.id && !notification.read).length;
  const veterinarianName = user?.name ? `Dr(a). ${user.name}` : 'Dr(a). Veterinário(a)';

  const sortedItems = useMemo(() => items.slice().sort(sortSchedule), [items]);
  const availableCount = sortedItems.filter((item) => item.status === 'available').length;
  const blockedCount = sortedItems.filter((item) => item.status === 'blocked').length;

  const resetForm = () => {
    setEditingId(null);
    setDay(dayOrder[0]);
    setStart('08:00');
    setEnd('09:00');
    setTitle('Consulta disponível');
    setStatus('available');
  };

  const startEdit = (item: ScheduleItem) => {
    setEditingId(item.id);
    setDay(item.day);
    setStart(item.start);
    setEnd(item.end);
    setTitle(item.title);
    setStatus(item.status);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setFeedback(null);

    const startMinutes = timeToMinutes(start);
    const endMinutes = timeToMinutes(end);

    if (startMinutes < 0 || endMinutes < 0 || startMinutes >= endMinutes) {
      setFeedback({ type: 'error', message: 'O horário final precisa ser maior que o horário inicial.' });
      return;
    }

    const duplicateConflict = items.some((item) => item.id !== editingId && item.day === day && intervalsOverlap(item.start, item.end, start, end));
    if (duplicateConflict) {
      setFeedback({ type: 'error', message: 'Já existe um horário conflitante nesse mesmo dia da semana.' });
      return;
    }

    const nextItem: ScheduleItem = {
      id: editingId ?? `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      day,
      start,
      end,
      title: title.trim() || (status === 'blocked' ? 'Horário bloqueado' : 'Consulta disponível'),
      status,
    };

    setItems((current) => {
      const withoutCurrent = current.filter((item) => item.id !== nextItem.id);
      return [nextItem, ...withoutCurrent];
    });
    setFeedback({
      type: 'success',
      message: editingId ? 'Horário atualizado com sucesso.' : 'Horário criado com sucesso.',
    });
    resetForm();
  };

  const handleDelete = (itemId: string) => {
    if (!window.confirm('Deseja excluir este horário?')) return;
    setItems((current) => current.filter((item) => item.id !== itemId));
    if (editingId === itemId) resetForm();
  };

  const toggleStatus = (item: ScheduleItem) => {
    setItems((current) =>
      current.map((entry) =>
        entry.id === item.id
          ? { ...entry, status: entry.status === 'available' ? 'blocked' : 'available', title: entry.status === 'available' ? 'Horário bloqueado' : 'Consulta disponível' }
          : entry
      )
    );
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.10),_transparent_32%),linear-gradient(180deg,_#f8fbff_0%,_#ffffff_100%)]">
      <VeterinarianTopBar
        veterinarianName={veterinarianName}
        notificationsCount={unreadNotifications}
        onNotifications={() => navigate('/notifications')}
        onSchedule={() => navigate('/veterinarian-schedule')}
        onSettings={() => navigate('/veterinarian-settings')}
        onLogout={confirmAndLogout}
      />

      <div className="mx-auto max-w-5xl px-6 py-8">
        <button onClick={() => navigate('/veterinarian-dashboard')} className="mb-6 inline-flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground">
          <ArrowLeft className="h-5 w-5" />
          Voltar para a dashboard
        </button>

        <section className="rounded-[28px] border border-border bg-card p-8 shadow-lg">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs text-primary">
                <Stethoscope className="h-3.5 w-3.5" />
                Agenda dedicada
              </div>
              <div>
                <h1 className="text-3xl text-foreground">Gerenciamento de horários</h1>
                <p className="text-muted-foreground">Crie, edite, exclua e bloqueie horários sem misturar essa responsabilidade com o atendimento clínico.</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-2xl border border-border bg-muted/30 px-4 py-3"><p className="text-[11px] uppercase tracking-wide text-muted-foreground">Total</p><p className="mt-1 text-lg text-foreground">{sortedItems.length}</p></div>
              <div className="rounded-2xl border border-border bg-muted/30 px-4 py-3"><p className="text-[11px] uppercase tracking-wide text-muted-foreground">Livres</p><p className="mt-1 text-lg text-foreground">{availableCount}</p></div>
              <div className="rounded-2xl border border-border bg-muted/30 px-4 py-3"><p className="text-[11px] uppercase tracking-wide text-muted-foreground">Bloqueios</p><p className="mt-1 text-lg text-foreground">{blockedCount}</p></div>
              <div className="rounded-2xl border border-border bg-muted/30 px-4 py-3"><p className="text-[11px] uppercase tracking-wide text-muted-foreground">Conflito</p><p className="mt-1 text-lg text-foreground">Rígido</p></div>
            </div>
          </div>
        </section>

        {feedback && <div className={`mt-6 rounded-2xl border px-4 py-3 text-sm ${feedback.type === 'success' ? 'border-green-200 bg-green-50 text-green-700' : 'border-red-200 bg-red-50 text-red-700'}`}>{feedback.message}</div>}

        <section className="mt-6 grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
          <form onSubmit={handleSubmit} className="rounded-[28px] border border-border bg-card p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div><p className="text-sm text-muted-foreground">Novo horário</p><h2 className="text-2xl text-foreground">Cadastrar ou editar</h2></div>
              <Clock3 className="h-6 w-6 text-primary" />
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm text-foreground">Dia da semana</label>
                <select value={day} onChange={(e) => setDay(e.target.value)} className="w-full rounded-2xl border border-border bg-input px-4 py-3 text-foreground">
                  {dayOrder.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm text-foreground">Status</label>
                <select value={status} onChange={(e) => setStatus(e.target.value as ScheduleStatus)} className="w-full rounded-2xl border border-border bg-input px-4 py-3 text-foreground">
                  <option value="available">Disponível</option>
                  <option value="blocked">Bloqueado</option>
                </select>
              </div>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm text-foreground">Início</label>
                <input type="time" value={start} onChange={(e) => setStart(e.target.value)} className="w-full rounded-2xl border border-border bg-input px-4 py-3 text-foreground" />
              </div>
              <div>
                <label className="mb-2 block text-sm text-foreground">Fim</label>
                <input type="time" value={end} onChange={(e) => setEnd(e.target.value)} className="w-full rounded-2xl border border-border bg-input px-4 py-3 text-foreground" />
              </div>
            </div>

            <div className="mt-4">
              <label className="mb-2 block text-sm text-foreground">Título</label>
              <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full rounded-2xl border border-border bg-input px-4 py-3 text-foreground" placeholder="Ex.: Consulta, bloqueio, encaixe" />
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <button type="submit" className="inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-3 text-white transition-colors hover:bg-primary/90"><Plus className="h-4 w-4" />{editingId ? 'Atualizar horário' : 'Salvar horário'}</button>
              <button type="button" onClick={resetForm} className="inline-flex items-center gap-2 rounded-2xl border border-border bg-background px-5 py-3 text-foreground transition-colors hover:bg-muted"><X className="h-4 w-4" />Limpar</button>
            </div>

            <div className="mt-4 rounded-2xl border border-dashed border-border bg-muted/20 p-4 text-sm text-muted-foreground">
              Conflitos são recusados quando o mesmo dia já possui um intervalo que se sobrepõe ao novo horário.
            </div>
          </form>

          <div className="rounded-[28px] border border-border bg-card p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div><p className="text-sm text-muted-foreground">Horários cadastrados</p><h2 className="text-2xl text-foreground">Agenda atual</h2></div>
              <CalendarDays className="h-6 w-6 text-primary" />
            </div>

            <div className="mt-5 space-y-3">
              {sortedItems.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border bg-muted/20 p-4 text-sm text-muted-foreground">Nenhum horário cadastrado ainda.</div>
              ) : (
                sortedItems.map((item) => (
                  <div key={item.id} className="rounded-2xl border border-border bg-muted/20 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-foreground">{item.title}</p>
                        <p className="text-sm text-muted-foreground">{item.day} • {item.start} às {item.end}</p>
                      </div>
                      <span className={`rounded-full px-3 py-1 text-xs ${item.status === 'available' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                        {item.status === 'available' ? 'Disponível' : 'Bloqueado'}
                      </span>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <button type="button" onClick={() => startEdit(item)} className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground transition-colors hover:bg-muted"><Edit3 className="h-4 w-4" />Editar</button>
                      <button type="button" onClick={() => toggleStatus(item)} className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground transition-colors hover:bg-muted"><ShieldAlert className="h-4 w-4" />{item.status === 'available' ? 'Bloquear' : 'Desbloquear'}</button>
                      <button type="button" onClick={() => handleDelete(item.id)} className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 transition-colors hover:bg-red-100"><Trash2 className="h-4 w-4" />Excluir</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}


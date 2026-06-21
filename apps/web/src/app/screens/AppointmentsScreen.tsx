import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Calendar, Clock, Mail, MapPin, MessageSquare, PenLine, Plus, Star, Trash2, X } from 'lucide-react';
import { useInteraction } from '../context/InteractionContext';
import { usePets } from '../context/PetsContext';
import { useReviews } from '../context/ReviewsContext';
import { useSession } from '../context/SessionContext';
import { useAppNavigation } from '../navigation';

export default function AppointmentsScreen() {
  const navigate = useNavigate();
  const { user } = useSession();
  const { currentPet } = usePets();
  const { appointments, addAppointment } = useInteraction();
  const { getReviewForAppointment, upsertReview, deleteReview } = useReviews();
  const { goToDashboard } = useAppNavigation();
  const [showNewAppointment, setShowNewAppointment] = useState(false);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [reason, setReason] = useState('');
  const [clinicName, setClinicName] = useState('');
  const [reviewAppointmentId, setReviewAppointmentId] = useState<string | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  const userAppointments = useMemo(
    () => (user?.userType === 'owner' ? appointments.filter((a) => a.ownerId === user.id) : appointments),
    [appointments, user?.id, user?.userType]
  );

  const scheduled = userAppointments.filter((a) => a.status === 'scheduled');
  const completed = userAppointments.filter((a) => a.status === 'completed');
  const activeReviewAppointment = reviewAppointmentId ? userAppointments.find((appointment) => appointment.id === reviewAppointmentId) ?? null : null;
  const activeReview = activeReviewAppointment ? getReviewForAppointment(activeReviewAppointment.id) : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (user?.userType === 'owner' && currentPet) {
      addAppointment({
        petId: currentPet.id,
        petName: currentPet.name,
        clinicId: 'clinic1',
        clinicName,
        date,
        time,
        reason,
        status: 'scheduled',
        ownerId: user.id,
      });
      setShowNewAppointment(false);
      setDate('');
      setTime('');
      setReason('');
      setClinicName('');
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
      veterinarianId: activeReviewAppointment.veterinarianId ?? activeReviewAppointment.clinicId,
      veterinarianName: activeReviewAppointment.veterinarianName || activeReviewAppointment.clinicName,
      clinicName: activeReviewAppointment.clinicName,
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

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-card border-b border-border">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <button
              onClick={() => goToDashboard(user?.userType)}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Voltar</span>
            </button>
            {user?.userType === 'owner' && (
              <button
                onClick={() => setShowNewAppointment(true)}
                className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-xl transition-colors flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                <span>Nova Consulta</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <h1 className="text-3xl text-foreground mb-8">Consultas</h1>

        {showNewAppointment && (
          <div className="bg-card rounded-3xl shadow-lg p-6 mb-6 border border-border">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl text-foreground">Agendar Nova Consulta</h2>
              <button
                onClick={() => setShowNewAppointment(false)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-foreground mb-2">Nome da Clinica</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="text"
                    value={clinicName}
                    onChange={(e) => setClinicName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-input border-2 border-border rounded-xl focus:border-primary focus:outline-none transition-colors text-foreground"
                    placeholder="Clínica PetHelp"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-foreground mb-2">Data</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-input border-2 border-border rounded-xl focus:border-primary focus:outline-none transition-colors text-foreground"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-foreground mb-2">Horario</label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type="time"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-input border-2 border-border rounded-xl focus:border-primary focus:outline-none transition-colors text-foreground"
                      required
                    />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-foreground mb-2">Motivo</label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-4 py-3 bg-input border-2 border-border rounded-xl focus:border-primary focus:outline-none transition-colors text-foreground resize-none"
                  rows={3}
                  placeholder="Ex: Checkup anual, vacinação, sintomas de prostração, etc."
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-white py-3 rounded-xl transition-colors"
              >
                Confirmar Agendamento
              </button>
            </form>
          </div>
        )}

        <div className="bg-card rounded-3xl shadow-lg p-6 mb-6 border border-border">
          <h2 className="text-xl text-foreground mb-4">Agendadas</h2>
          {scheduled.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">Nenhuma consulta agendada</p>
          ) : (
            <div className="space-y-3">
              {scheduled.map((appointment) => (
                <div key={appointment.id} className="bg-muted rounded-2xl p-4 flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-foreground mb-1">{appointment.petName}</p>
                    <p className="text-sm text-muted-foreground">{appointment.reason}</p>
                    <p className="text-sm text-muted-foreground mt-1">{appointment.clinicName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-foreground">{appointment.date}</p>
                    <p className="text-sm text-muted-foreground">{appointment.time}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-card rounded-3xl shadow-lg p-6 border border-border">
          <h2 className="text-xl text-foreground mb-4">Concluidas</h2>
          {completed.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">Nenhuma consulta concluida</p>
          ) : (
            <div className="space-y-3">
              {completed.map((appointment) => {
                const review = getReviewForAppointment(appointment.id);
                return (
                  <div key={appointment.id} className="bg-muted rounded-2xl p-4 flex items-start gap-4">
                    <div className="w-12 h-12 bg-muted-foreground/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-foreground mb-1">{appointment.petName}</p>
                      <p className="text-sm text-muted-foreground">{appointment.reason}</p>
                      <p className="text-sm text-muted-foreground mt-1">{appointment.clinicName}</p>
                      {appointment.veterinarianEmail && (
                        <a href={`mailto:${appointment.veterinarianEmail}`} className="mt-3 inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1 text-xs text-foreground hover:bg-muted transition-colors">
                          <Mail className="w-3.5 h-3.5" />
                          Contato direto
                        </a>
                      )}
                      <div className="mt-3 flex flex-wrap gap-2 text-xs">
                        {review ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-3 py-1 text-emerald-600">
                            <MessageSquare className="w-3.5 h-3.5" />
                            Avaliação registrada
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-3 py-1 text-amber-600">
                            <MessageSquare className="w-3.5 h-3.5" />
                            Sem avaliação
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right flex flex-col items-end gap-2">
                      <p className="text-foreground">{appointment.date}</p>
                      <p className="text-sm text-muted-foreground">{appointment.time}</p>
                      {user?.userType === 'owner' && appointment.veterinarianId && (
                        <button
                          onClick={() => openReview(appointment.id)}
                          className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1 text-xs text-foreground hover:bg-muted transition-colors"
                        >
                          <PenLine className="w-3.5 h-3.5" />
                          {review ? 'Editar avaliação' : 'Avaliar'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {activeReviewAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" role="dialog" aria-modal="true">
          <div className="w-full max-w-lg rounded-3xl border border-border bg-card shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
              <div>
                <h3 className="text-lg text-foreground">Avaliar atendimento</h3>
                <p className="text-xs text-muted-foreground">{activeReviewAppointment.veterinarianName || activeReviewAppointment.clinicName}</p>
              </div>
              <button onClick={closeReview} className="rounded-full border border-border bg-background px-3 py-1.5 text-sm text-foreground hover:bg-muted transition-colors">
                Fechar
              </button>
            </div>

            <form onSubmit={submitReview} className="space-y-4 px-5 py-5">
              <div>
                <label className="block text-sm text-foreground mb-2">Nota</label>
                <div className="flex flex-wrap gap-2">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setReviewRating(value)}
                      className={`inline-flex items-center gap-1 rounded-full border px-3 py-2 text-sm transition-colors ${reviewRating >= value ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-background text-foreground'}`}
                    >
                      <Star className="w-4 h-4" />
                      {value}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm text-foreground mb-2">Comentário</label>
                <textarea
                  value={reviewComment}
                  onChange={(event) => setReviewComment(event.target.value)}
                  rows={4}
                  className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-foreground"
                  placeholder="Descreva a qualidade do atendimento..."
                />
              </div>

              <div className="flex items-center justify-between gap-3">
                <div className="flex gap-2">
                  {activeReview && (
                    <button type="button" onClick={removeReview} className="inline-flex items-center gap-2 rounded-2xl border border-rose-300 bg-rose-50 px-4 py-2 text-rose-700 hover:bg-rose-100 transition-colors">
                      <Trash2 className="w-4 h-4" />
                      Excluir
                    </button>
                  )}
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={closeReview} className="rounded-2xl border border-border px-4 py-2 text-foreground hover:bg-muted transition-colors">
                    Cancelar
                  </button>
                  <button type="submit" className="rounded-2xl bg-primary px-4 py-2 text-white hover:bg-primary/90 transition-colors">
                    Salvar avaliação
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


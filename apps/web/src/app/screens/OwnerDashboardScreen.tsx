import React, { useEffect } from 'react';
import { useNavigate } from 'react-router';
import {
  AlertCircle,
  Bell,
  Calendar,
  CheckCircle,
  ChevronsUpDown,
  FileText,
  Link,
  LogOut,
  PawPrint,
  Plus,
  Settings,
  Syringe,
} from 'lucide-react';
import { useHealth } from '../context/HealthContext';
import { useInteraction } from '../context/InteractionContext';
import { usePets } from '../context/PetsContext';
import { useSession } from '../context/SessionContext';
import { useAppNavigation, useDashboardBackLogout } from '../navigation';

export default function OwnerDashboardScreen() {
  const navigate = useNavigate();
  const { user } = useSession();
  const { currentPet, pets, setCurrentPet } = usePets();
  const { appointments, notifications } = useInteraction();
  const { vaccines } = useHealth();
  useDashboardBackLogout();
  const { confirmAndLogout } = useAppNavigation();

  const upcomingAppointments = appointments
    .filter((appointment) => appointment.status === 'scheduled')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3);

  const overdueVaccines = vaccines.filter((vaccine) => vaccine.status === 'late');
  const unreadNotifications = notifications.filter((notification) => !notification.read).length;

  const handleLogout = () => {
    confirmAndLogout();
  };

  useEffect(() => {
    if (!currentPet && pets.length > 0) {
      setCurrentPet(pets[0]);
    }
  }, [currentPet, pets, setCurrentPet]);

  if (!currentPet) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="text-center">
          <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <PawPrint className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl text-foreground mb-2">Nenhum pet cadastrado</h2>
          <p className="text-muted-foreground mb-6">Cadastre um pet para continuar</p>
          <button
            onClick={() => navigate('/pet-registration', { state: { mode: 'create' } })}
            className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-2xl transition-colors"
          >
            Cadastrar pet
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-card border-b border-border">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                <PawPrint className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl text-foreground">PetHelp</h1>
                <p className="text-sm text-muted-foreground">Olá, {user?.name}</p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => navigate('/pet-registration', { state: { mode: 'create' } })}
                className="p-2 hover:bg-muted rounded-xl transition-colors"
                title="Novo pet"
              >
                <Plus className="w-6 h-6 text-foreground" />
              </button>
              <button
                onClick={() => navigate('/notifications')}
                className="relative p-2 hover:bg-muted rounded-xl transition-colors"
                title="Notificações"
              >
                <Bell className="w-6 h-6 text-foreground" />
                {unreadNotifications > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-white text-xs rounded-full flex items-center justify-center">
                    {unreadNotifications}
                  </span>
                )}
              </button>
              <button
                onClick={() => navigate('/settings')}
                className="p-2 hover:bg-muted rounded-xl transition-colors"
                title="Configurações"
              >
                <Settings className="w-6 h-6 text-foreground" />
              </button>
              <button
                onClick={handleLogout}
                className="p-2 hover:bg-muted rounded-xl transition-colors"
                title="Sair"
              >
                <LogOut className="w-6 h-6 text-foreground" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-card rounded-3xl shadow-sm p-6 mb-6 border border-border">
          <div className="flex flex-col gap-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl text-foreground">Pet ativo</h2>
                <p className="text-sm text-muted-foreground">Troque o contexto sem perder o foco.</p>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs text-primary">
                <CheckCircle className="w-3.5 h-3.5" />
                Em foco
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {pets.map((pet) => {
                const isActive = currentPet?.id === pet.id;

                return (
                  <button
                    key={pet.id}
                    onClick={() => setCurrentPet(pet)}
                    className={`group flex items-center gap-3 rounded-2xl border px-4 py-3 text-left transition-all ${
                      isActive
                        ? 'border-primary/30 bg-primary/5 shadow-sm'
                        : 'border-border bg-muted/40 hover:bg-muted/70 hover:border-border/80'
                    }`}
                  >
                    <div className="relative shrink-0">
                      {pet.photo ? (
                        <img
                          src={pet.photo}
                          alt={pet.name}
                          className="w-12 h-12 rounded-2xl object-cover border border-border"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-2xl border border-border bg-background/80 flex items-center justify-center">
                          <PawPrint className="w-5 h-5 text-muted-foreground" />
                        </div>
                      )}
                      {isActive && (
                        <span className="absolute -bottom-1 -right-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-medium text-white shadow-sm">
                          ativo
                        </span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-foreground">{pet.name}</p>
                        {isActive && <span className="h-2 w-2 rounded-full bg-primary" />}
                      </div>
                      <p className="truncate text-xs text-muted-foreground">
                        {pet.species ? `${pet.species} • ` : ''}
                        {pet.breed || 'Raça não informada'}
                      </p>
                    </div>

                    <ChevronsUpDown className={`w-4 h-4 shrink-0 transition-colors ${isActive ? 'text-primary' : 'text-muted-foreground/60'}`} />
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="bg-card rounded-3xl shadow-sm p-6 mb-6 border border-border">
          <div className="flex flex-col lg:flex-row lg:items-start gap-5">
            <div className="relative shrink-0">
              {currentPet.photo ? (
                <img
                  src={currentPet.photo}
                  alt={currentPet.name}
                  className="w-24 h-24 rounded-3xl object-cover border border-border shadow-sm"
                />
              ) : (
                <div className="w-24 h-24 rounded-3xl border border-border bg-muted flex items-center justify-center shadow-sm">
                  <PawPrint className="w-8 h-8 text-muted-foreground" />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <h2 className="text-2xl text-foreground">{currentPet.name}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {currentPet.species ? `${currentPet.species} • ` : ''}
                    {currentPet.breed || 'Raça não informada'}
                  </p>
                </div>

                <button
                  onClick={() => navigate('/pet-profile')}
                  className="inline-flex items-center gap-2 self-start rounded-full border border-border bg-background px-4 py-2 text-sm text-foreground transition-colors hover:bg-muted"
                >
                  <Link className="w-4 h-4" />
                  Ver perfil
                </button>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-2xl border border-border bg-muted/30 px-4 py-3">
                  <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Idade</p>
                  <p className="mt-1 text-sm text-foreground">{currentPet.age || 'Não informada'}</p>
                </div>
                <div className="rounded-2xl border border-border bg-muted/30 px-4 py-3">
                  <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Peso</p>
                  <p className="mt-1 text-sm text-foreground">{currentPet.weight || 'Não informado'}</p>
                </div>
                <div className="rounded-2xl border border-border bg-muted/30 px-4 py-3">
                  <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Alergias</p>
                  <p className="mt-1 text-sm text-foreground">{currentPet.allergies?.length || 0}</p>
                </div>
                <div className="rounded-2xl border border-border bg-muted/30 px-4 py-3">
                  <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Condições</p>
                  <p className="mt-1 text-sm text-foreground">{currentPet.conditions?.length || 0}</p>
                </div>
              </div>

              {((currentPet.allergies && currentPet.allergies.length > 0) || (currentPet.conditions && currentPet.conditions.length > 0)) && (
                <div className="mt-5 space-y-4">
                  {currentPet.allergies && currentPet.allergies.length > 0 && (
                    <div>
                      <p className="mb-2 flex items-center gap-1 text-xs text-muted-foreground">
                        <AlertCircle className="w-3 h-3 text-primary" /> Alergias
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {currentPet.allergies.map((allergy, index) => (
                          <span key={index} className="rounded-full border border-primary/15 bg-primary/5 px-3 py-1 text-xs text-primary">
                            {allergy}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {currentPet.conditions && currentPet.conditions.length > 0 && (
                    <div>
                      <p className="mb-2 text-xs text-muted-foreground">Condições médicas</p>
                      <div className="flex flex-wrap gap-2">
                        {currentPet.conditions.map((condition, index) => (
                          <span key={index} className="rounded-full border border-border bg-background px-3 py-1 text-xs text-foreground">
                            {condition}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {overdueVaccines.length > 0 && (
          <div className="bg-primary/10 border border-primary rounded-2xl p-4 mb-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-foreground mb-1">Vacinas atrasadas</h3>
              <p className="text-sm text-muted-foreground">
                {overdueVaccines.length} vacina{overdueVaccines.length > 1 ? 's' : ''} precisa{overdueVaccines.length > 1 ? 'm' : ''} de atenção
              </p>
            </div>
            <button onClick={() => navigate('/vaccines')} className="text-sm text-primary hover:text-primary/80 transition-colors">
              Ver
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <button
            onClick={() => navigate('/vaccines')}
            className="bg-card hover:bg-muted border border-border rounded-2xl p-6 text-left transition-colors group"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <Syringe className="w-6 h-6 text-primary" />
              </div>
              {overdueVaccines.length > 0 ? (
                <span className="bg-primary text-white px-2 py-1 rounded-full text-xs">{overdueVaccines.length} atrasada(s)</span>
              ) : (
                <CheckCircle className="w-5 h-5 text-green-500" title="Em dia" />
              )}
            </div>
            <h3 className="text-lg text-foreground mb-1">Vacinas</h3>
            <p className="text-sm text-muted-foreground">Gerenciar carteira de vacinação</p>
          </button>

          <button
            onClick={() => navigate('/medical-history')}
            className="bg-card hover:bg-muted border border-border rounded-2xl p-6 text-left transition-colors group"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <FileText className="w-6 h-6 text-primary" />
              </div>
            </div>
            <h3 className="text-lg text-foreground mb-1">Histórico Médico</h3>
            <p className="text-sm text-muted-foreground">Ver prontuário e registros clínicos</p>
          </button>

          <button
            onClick={() => navigate('/appointments')}
            className="bg-card hover:bg-muted border border-border rounded-2xl p-6 text-left transition-colors group"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <Calendar className="w-6 h-6 text-primary" />
              </div>
              {upcomingAppointments.length > 0 && (
                <span className="bg-primary text-white px-2 py-1 rounded-full text-xs">{upcomingAppointments.length}</span>
              )}
            </div>
            <h3 className="text-lg text-foreground mb-1">Consultas (Em desenvolvimento)</h3>
            <p className="text-sm text-muted-foreground">Agendar e gerenciar visitas médicas</p>
          </button>

          <button
            onClick={() => navigate('/connection')}
            className="bg-card hover:bg-muted border border-border rounded-2xl p-6 text-left transition-colors group"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <Link className="w-6 h-6 text-primary" />
              </div>
            </div>
            <h3 className="text-lg text-foreground mb-1">Conectar à Clínica (Em desenvolvimento)</h3>
            <p className="text-sm text-muted-foreground">Vincular pet a um estabelecimento veterinário</p>
          </button>
        </div>

        {upcomingAppointments.length > 0 && (
          <div className="bg-card rounded-3xl shadow-lg p-6 border border-border">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl text-foreground">Próximas consultas</h3>
              <button onClick={() => navigate('/appointments')} className="text-sm text-primary hover:text-primary/80 transition-colors">
                Ver todas
              </button>
            </div>
            <div className="space-y-3">
              {upcomingAppointments.map((appointment) => (
                <div key={appointment.id} className="bg-muted rounded-2xl p-4 flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-foreground mb-1">{appointment.reason}</p>
                    <p className="text-sm text-muted-foreground">{appointment.clinicName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-foreground">{appointment.date}</p>
                    <p className="text-sm text-muted-foreground">{appointment.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

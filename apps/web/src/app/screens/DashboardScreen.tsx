import { useNavigate } from 'react-router';
import { Syringe, FileText, Calendar, User, LogOut, PawPrint } from 'lucide-react';
import { getDashboardRouteForUserType } from '../context/shared';
import { usePets } from '../context/PetsContext';
import { useSession } from '../context/SessionContext';
import { useAppNavigation, useDashboardBackLogout } from '../navigation';
import { ScreenFrame, ScreenHeader, ScreenPanel, ScreenStat } from '../components/layout/ScreenFrame';

export default function DashboardScreen() {
  const navigate = useNavigate();
  const { currentPet } = usePets();
  const { user } = useSession();
  useDashboardBackLogout();
  const { confirmAndLogout } = useAppNavigation();

  const handleLogout = () => {
    confirmAndLogout();
  };

  if (!currentPet) {
    return (
      <ScreenFrame>
        <div className="app-page-shell flex items-center justify-center py-20">
          <ScreenPanel className="max-w-xl px-8 py-10 text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-primary/10 text-primary">
              <PawPrint className="h-8 w-8" />
            </div>
            <h2 className="text-2xl font-medium text-foreground">Nenhum pet cadastrado ainda</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Cadastre um pet para acessar vacinação, histórico médico e consultas.
            </p>
            <button onClick={() => navigate('/pet-registration')} className="app-button-primary mt-8">
              Adicionar seu pet
            </button>
          </ScreenPanel>
        </div>
      </ScreenFrame>
    );
  }

  const menuItems = [
    { icon: Syringe, label: 'Vacinas', path: '/vaccines' },
    { icon: FileText, label: 'Histórico Médico', path: '/medical-history' },
    { icon: Calendar, label: 'Consultas', path: '/appointments' },
    {
      icon: User,
      label: user?.userType === 'owner' ? 'Configurações' : 'Perfil',
      path: user?.userType === 'owner' ? '/settings' : getDashboardRouteForUserType(user?.userType),
    },
  ];

  return (
    <ScreenFrame>
      <div className="app-page-shell space-y-6">
        <ScreenHeader
          eyebrow="Painel do tutor"
          title={`Olá, ${user?.name ?? 'usuário'}`}
          description="Centralize pet, vacinação, histórico e consultas em uma experiência mais limpa e sofisticada."
          icon={<PawPrint className="h-5 w-5" />}
          actions={
            <button onClick={handleLogout} className="app-button-secondary" title="Sair">
              <LogOut className="h-4 w-4" />
              Sair
            </button>
          }
        />

        <ScreenPanel className="p-6 sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
            <div className="relative shrink-0">
              {currentPet.photo ? (
                <img src={currentPet.photo} alt={currentPet.name} className="h-28 w-28 rounded-[28px] object-cover border border-border" />
              ) : (
                <div className="flex h-28 w-28 items-center justify-center rounded-[28px] border border-border bg-muted/40">
                  <PawPrint className="h-12 w-12 text-muted-foreground" />
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <h2 className="text-2xl font-medium text-foreground">{currentPet.name}</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {currentPet.species ? `${currentPet.species} • ` : ''}
                {currentPet.breed || 'Raça não informada'}
              </p>

              <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <ScreenStat label="Raça">{currentPet.breed || 'Não informada'}</ScreenStat>
                <ScreenStat label="Idade">{currentPet.age || 'Não informada'}</ScreenStat>
                <ScreenStat label="Peso">{currentPet.weight || 'Não informado'}</ScreenStat>
              </div>
            </div>
          </div>
        </ScreenPanel>

        <section className="space-y-4">
          <div>
            <h3 className="text-xl font-medium text-foreground">Acesso rápido</h3>
            <p className="mt-1 text-sm text-muted-foreground">Atalhos diretos para as funções mais usadas.</p>
          </div>

          <div className="app-grid-tiles">
            {menuItems.map((item) => (
              <button
                key={item.label}
                onClick={() => navigate(item.path)}
                className="group rounded-[28px] border border-border/80 bg-card p-6 text-left shadow-[0_18px_50px_-36px_rgba(127,162,106,0.24)] transition-all hover:-translate-y-0.5 hover:shadow-[0_22px_56px_-38px_rgba(127,162,106,0.28)]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="app-icon-badge">
                    <item.icon className="h-6 w-6" />
                  </div>
                  <span className="rounded-full bg-muted/70 px-3 py-1 text-xs text-muted-foreground">Abrir</span>
                </div>
                <p className="mt-5 text-lg font-medium text-foreground">{item.label}</p>
                <p className="mt-1 text-sm text-muted-foreground">Ir para essa área do sistema.</p>
              </button>
            ))}
          </div>
        </section>
      </div>
    </ScreenFrame>
  );
}

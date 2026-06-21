import { useNavigate } from 'react-router';
import { Syringe, FileText, Calendar, User, LogOut, PawPrint } from 'lucide-react';
import { getDashboardRouteForUserType } from '../context/shared';
import { usePets } from '../context/PetsContext';
import { useSession } from '../context/SessionContext';
import { useAppNavigation, useDashboardBackLogout } from '../navigation';

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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Nenhum pet cadastrado ainda</p>
          <button
            onClick={() => navigate('/pet-registration')}
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-2xl transition-colors"
          >
            Adicionar Seu Pet
          </button>
        </div>
      </div>
    );
  }

  const menuItems = [
    {
      icon: Syringe,
      label: 'Vacinas',
      path: '/vaccines',
      color: 'bg-blue-500',
    },
    {
      icon: FileText,
      label: 'Histórico Médico',
      path: '/medical-history',
      color: 'bg-purple-500',
    },
    {
      icon: Calendar,
      label: 'Consultas',
      path: '/appointments',
      color: 'bg-orange-500',
    },
    {
      icon: User,
      label: user?.userType === 'owner' ? 'Configurações' : 'Perfil',
      path: user?.userType === 'owner' ? '/settings' : getDashboardRouteForUserType(user?.userType),
      color: 'bg-green-500',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white pb-6">
      <div className="bg-green-500 rounded-b-[40px] px-6 pt-12 pb-8 shadow-lg">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-white/80">Bem-vindo de volta,</h2>
            <h1 className="text-white text-2xl">{user?.name}</h1>
          </div>
          <button
            onClick={handleLogout}
            className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
            title="Sair"
          >
            <LogOut className="w-5 h-5 text-white" />
          </button>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-xl">
          <div className="flex items-center gap-4">
            {currentPet.photo ? (
              <img src={currentPet.photo} alt={currentPet.name} className="w-24 h-24 rounded-full object-cover" />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center">
                <PawPrint className="w-10 h-10 text-gray-400" />
              </div>
            )}
            <div className="flex-1">
              <h2 className="text-2xl text-gray-800 mb-2">{currentPet.name}</h2>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-gray-500">Raça</p>
                  <p className="text-gray-800">{currentPet.breed || 'Não informada'}</p>
                </div>
                <div>
                  <p className="text-gray-500">Idade</p>
                  <p className="text-gray-800">{currentPet.age || 'Não informada'}</p>
                </div>
                <div>
                  <p className="text-gray-500">Peso</p>
                  <p className="text-gray-800">{currentPet.weight || 'Não informado'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 mt-8">
        <h3 className="text-gray-700 text-lg mb-4">Acesso Rápido</h3>
        <div className="grid grid-cols-2 gap-4">
          {menuItems.map((item) => (
            <button
              key={item.label}
              onClick={() => navigate(item.path)}
              className="bg-white rounded-3xl p-6 shadow-lg hover:shadow-xl transition-shadow flex flex-col items-center gap-3"
            >
              <div className={`${item.color} w-14 h-14 rounded-full flex items-center justify-center`}>
                <item.icon className="w-7 h-7 text-white" />
              </div>
              <span className="text-gray-800">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { Mail, User, PawPrint, Building2, Phone, MapPin, Stethoscope } from 'lucide-react';
import { getDashboardRouteForUserType, type UserType } from '../context/shared';
import { useSession } from '../context/SessionContext';
import { PasswordInput } from '../components/ui/password-input';

export default function RegisterScreen() {
  const navigate = useNavigate();
  const { register } = useSession();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [userType, setUserType] = useState<UserType>('owner');
  const [clinicName, setClinicName] = useState('');
  const [phone, setPhone] = useState('');
  const [cpf, setCpf] = useState('');
  const [address, setAddress] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [services, setServices] = useState('');
  const [crmv, setCrmv] = useState('');
  const [crmvUf, setCrmvUf] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert('As senhas não coincidem!');
      return;
    }

    setLoading(true);
    try {
      const resolvedUserType = await register({
        name: userType === 'clinic' ? undefined : name,
        email,
        password,
        userType,
        cpf: userType === 'owner' ? cpf : undefined,
        clinicName: userType === 'clinic' ? clinicName : undefined,
        tradeName: userType === 'clinic' ? clinicName : undefined,
        cnpj: userType === 'clinic' ? cnpj : undefined,
        phone: userType === 'clinic' ? phone : undefined,
        address: userType === 'clinic' ? address : undefined,
        services: userType === 'clinic'
          ? services.split(',').map((service) => service.trim()).filter(Boolean)
          : undefined,
        crmv: userType === 'veterinarian' ? crmv : undefined,
        crmvUf: userType === 'veterinarian' ? crmvUf : undefined,
      });

      navigate(getDashboardRouteForUserType(resolvedUserType), { replace: true });
    } catch (error) {
      console.error('Falha ao cadastrar:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-10">
          <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mb-4">
            <PawPrint className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl text-foreground mb-2">PetHelp</h1>
          <p className="text-muted-foreground">Crie sua conta</p>
        </div>

        <form onSubmit={handleRegister} className="bg-card rounded-3xl shadow-lg p-8 border border-border">
          <h2 className="text-2xl text-foreground mb-6">Cadastrar</h2>

          <div className="mb-6">
            <label className="block text-foreground mb-3">
              Cadastrar como <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setUserType('owner')}
                className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                  userType === 'owner'
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border text-muted-foreground hover:border-primary/50'
                }`}
              >
                <User className="w-6 h-6" />
                <span className="text-sm">Tutor</span>
              </button>
              <button
                type="button"
                onClick={() => setUserType('veterinarian')}
                className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                  userType === 'veterinarian'
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border text-muted-foreground hover:border-primary/50'
                }`}
              >
                <Stethoscope className="w-6 h-6" />
                <span className="text-sm">Veterinário</span>
              </button>
              <button
                type="button"
                onClick={() => setUserType('clinic')}
                className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                  userType === 'clinic'
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border text-muted-foreground hover:border-primary/50'
                }`}
              >
                <Building2 className="w-6 h-6" />
                <span className="text-sm">Clí­nica</span>
              </button>
            </div>
          </div>

          {userType !== 'clinic' && (
            <div className="mb-4">
              <label htmlFor="name" className="block text-foreground mb-2">
                {userType === 'veterinarian' ? 'Nome completo' : 'Nome completo'}{' '}
                <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-input border-2 border-border rounded-2xl focus:border-primary focus:outline-none transition-colors text-foreground"
                  placeholder={userType === 'veterinarian' ? 'Dr. JoÃ£o Silva' : 'JoÃ£o Silva'}
                  required
                />
              </div>
            </div>
          )}

          {userType === 'owner' && (
            <div className="mb-4">
              <label htmlFor="cpf" className="block text-foreground mb-2">
                CPF
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  id="cpf"
                  value={cpf}
                  onChange={(e) => setCpf(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-input border-2 border-border rounded-2xl focus:border-primary focus:outline-none transition-colors text-foreground"
                  placeholder="000.000.000-00"
                />
              </div>
            </div>
          )}

          {userType === 'clinic' && (
            <>
              <div className="mb-4">
                <label htmlFor="clinicName" className="block text-foreground mb-2">
                  Nome da clÃ­nica <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="text"
                    id="clinicName"
                    value={clinicName}
                    onChange={(e) => setClinicName(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-input border-2 border-border rounded-2xl focus:border-primary focus:outline-none transition-colors text-foreground"
                    placeholder="ClÃ­nica PetHelp"
                    required
                  />
                </div>
              </div>

              <div className="mb-4">
                <label htmlFor="phone" className="block text-foreground mb-2">
                  Telefone
                </label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="tel"
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-input border-2 border-border rounded-2xl focus:border-primary focus:outline-none transition-colors text-foreground"
                    placeholder="(11) 99999-9999"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label htmlFor="cnpj" className="block text-foreground mb-2">
                  CNPJ
                </label>
                <input
                  type="text"
                  id="cnpj"
                  value={cnpj}
                  onChange={(e) => setCnpj(e.target.value)}
                  className="w-full px-4 py-3 bg-input border-2 border-border rounded-2xl focus:border-primary focus:outline-none transition-colors text-foreground"
                  placeholder="00.000.000/0000-00"
                />
              </div>

              <div className="mb-4">
                <label htmlFor="address" className="block text-foreground mb-2">
                  EndereÃ§o <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="text"
                    id="address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-input border-2 border-border rounded-2xl focus:border-primary focus:outline-none transition-colors text-foreground"
                    placeholder="Rua Principal, 123 - Cidade"
                    required
                  />
                </div>
              </div>

              <div className="mb-4">
                <label htmlFor="services" className="block text-foreground mb-2">
                  Catálogo de serviços
                </label>
                <textarea
                  id="services"
                  value={services}
                  onChange={(e) => setServices(e.target.value)}
                  className="w-full px-4 py-3 bg-input border-2 border-border rounded-2xl focus:border-primary focus:outline-none transition-colors text-foreground min-h-28"
                  placeholder="Consultas, vacinação, exames, cirurgias"
                />
                <p className="mt-2 text-xs text-muted-foreground">Separe os serviços por vírgula para salvar a lista na clínica.</p>
              </div>
            </>
          )}

          {userType === 'veterinarian' && (
            <>
              <div className="mb-4">
                <label htmlFor="crmv" className="block text-foreground mb-2">
                  CRMV <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="crmv"
                  value={crmv}
                  onChange={(e) => setCrmv(e.target.value)}
                  className="w-full px-4 py-3 bg-input border-2 border-border rounded-2xl focus:border-primary focus:outline-none transition-colors text-foreground"
                  placeholder="12345"
                  required
                />
              </div>

              <div className="mb-4">
                <label htmlFor="crmvUf" className="block text-foreground mb-2">
                  UF <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="crmvUf"
                  value={crmvUf}
                  onChange={(e) => setCrmvUf(e.target.value.toUpperCase())}
                  className="w-full px-4 py-3 bg-input border-2 border-border rounded-2xl focus:border-primary focus:outline-none transition-colors text-foreground uppercase"
                  placeholder="SP"
                  maxLength={2}
                  required
                />
              </div>
            </>
          )}

          <div className="mb-4">
            <label htmlFor="email" className="block text-foreground mb-2">
              E-mail <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-input border-2 border-border rounded-2xl focus:border-primary focus:outline-none transition-colors text-foreground"
                placeholder="seu@email.com"
                required
              />
            </div>
          </div>

          <div className="mb-4">
            <label htmlFor="password" className="block text-foreground mb-2">
              Senha <span className="text-red-500">*</span>
            </label>
            <PasswordInput
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          <div className="mb-6">
            <label htmlFor="confirmPassword" className="block text-foreground mb-2">
              Confirmar senha <span className="text-red-500">*</span>
            </label>
            <PasswordInput
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary/90 text-white py-4 rounded-2xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-4"
          >
            {loading ? 'Criando conta...' : 'Cadastrar'}
          </button>

          <div className="text-center">
            <p className="text-muted-foreground">
              JÃ¡ tem uma conta?{' '}
              <button
                type="button"
                onClick={() => navigate('/')}
                className="text-primary hover:text-primary/80 transition-colors"
              >
                Entrar
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}







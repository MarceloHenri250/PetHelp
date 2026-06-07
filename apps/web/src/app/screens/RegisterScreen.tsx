import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { Mail, Lock, User, PawPrint, Building2, Phone, MapPin } from 'lucide-react';
import { useApp, UserType } from '../context/AppContext';

export default function RegisterScreen() {
  const navigate = useNavigate();
  const { register } = useApp();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [userType, setUserType] = useState<UserType>('owner');
  const [clinicName, setClinicName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert('As senhas não coincidem!');
      return;
    }

    setLoading(true);
    try {
      await register(name, email, password, userType, clinicName);
      if (userType === 'owner') {
        navigate('/pet-registration');
      } else {
        navigate('/clinic-dashboard');
      }
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
            <label className="block text-foreground mb-3">Cadastrar como</label>
            <div className="grid grid-cols-2 gap-3">
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
                onClick={() => setUserType('clinic')}
                className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                  userType === 'clinic'
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border text-muted-foreground hover:border-primary/50'
                }`}
              >
                <Building2 className="w-6 h-6" />
                <span className="text-sm">Clínica</span>
              </button>
            </div>
          </div>

          <div className="mb-4">
            <label htmlFor="name" className="block text-foreground mb-2">
              {userType === 'clinic' ? 'Nome de contato' : 'Nome completo'}
            </label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-input border-2 border-border rounded-2xl focus:border-primary focus:outline-none transition-colors text-foreground"
                placeholder={userType === 'clinic' ? 'Dr. John Doe' : 'John Doe'}
                required
              />
            </div>
          </div>

          {userType === 'clinic' && (
            <>
              <div className="mb-4">
                <label htmlFor="clinicName" className="block text-foreground mb-2">
                  Nome da clínica
                </label>
                <div className="relative">
                  <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="text"
                    id="clinicName"
                    value={clinicName}
                    onChange={(e) => setClinicName(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-input border-2 border-border rounded-2xl focus:border-primary focus:outline-none transition-colors text-foreground"
                    placeholder="PetHelp Clinic"
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
                    placeholder="(555) 123-4567"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label htmlFor="address" className="block text-foreground mb-2">
                  Endereço
                </label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="text"
                    id="address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-input border-2 border-border rounded-2xl focus:border-primary focus:outline-none transition-colors text-foreground"
                    placeholder="123 Main St, City"
                  />
                </div>
              </div>
            </>
          )}

          <div className="mb-4">
            <label htmlFor="email" className="block text-foreground mb-2">
              E-mail
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-input border-2 border-border rounded-2xl focus:border-primary focus:outline-none transition-colors text-foreground"
                placeholder="your@email.com"
                required
              />
            </div>
          </div>

          <div className="mb-4">
            <label htmlFor="password" className="block text-foreground mb-2">
              Senha
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-input border-2 border-border rounded-2xl focus:border-primary focus:outline-none transition-colors text-foreground"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <div className="mb-6">
            <label htmlFor="confirmPassword" className="block text-foreground mb-2">
              Confirmar senha
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-input border-2 border-border rounded-2xl focus:border-primary focus:outline-none transition-colors text-foreground"
                placeholder="••••••••"
                required
              />
            </div>
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
              Já tem uma conta?{' '}
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
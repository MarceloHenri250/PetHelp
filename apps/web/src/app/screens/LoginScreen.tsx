import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { Mail, Lock, PawPrint, Building2, User } from 'lucide-react';
import { useApp, UserType } from '../context/AppContext';

export default function LoginScreen() {
  const navigate = useNavigate();
  const { login } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState<UserType>('owner');
  const [loading, setLoading] = useState(false);
  const [showPasswordRecovery, setShowPasswordRecovery] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password, userType);
      navigate(userType === 'owner' ? '/owner-dashboard' : '/clinic-dashboard');
    } catch (error) {
      console.error('Falha ao realizar login:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordRecovery = (e: React.FormEvent) => {
    e.preventDefault();
    alert('O link de recuperação de senha foi enviado para o email:' + email);
    setShowPasswordRecovery(false);
  };

  if (showPasswordRecovery) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
        <div className="w-full max-w-md">
          <div className="flex flex-col items-center mb-10">
            <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mb-4">
              <PawPrint className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl text-foreground mb-2">Recuperação de Senha</h1>
            <p className="text-muted-foreground">Insira seu email para alterar a senha</p>
          </div>

          <form onSubmit={handlePasswordRecovery} className="bg-card rounded-3xl shadow-lg p-8 border border-border">
            <div className="mb-6">
              <label htmlFor="recovery-email" className="block text-foreground mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="email"
                  id="recovery-email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-input border-2 border-border rounded-2xl focus:border-primary focus:outline-none transition-colors text-foreground"
                  placeholder="seu@email.com"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-white py-4 rounded-2xl transition-colors mb-4"
            >
              Enviar link de recuperação
            </button>

            <button
              type="button"
              onClick={() => setShowPasswordRecovery(false)}
              className="w-full text-muted-foreground hover:text-foreground transition-colors"
            >
              Voltar para o Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-10">
          <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mb-4">
            <PawPrint className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl text-foreground mb-2">Pet Help</h1>
          <p className="text-muted-foreground">Gerenciamento completo de cuidados com pets</p>
        </div>

        <form onSubmit={handleLogin} className="bg-card rounded-3xl shadow-lg p-8 border border-border">
          <h2 className="text-2xl text-foreground mb-6">Bem-vindo de volta</h2>

          <div className="mb-6">
            <label className="block text-foreground mb-3">Entrar como</label>
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
            <label htmlFor="email" className="block text-foreground mb-2">
              Email
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

          <div className="mb-6">
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
            <button
              type="button"
              onClick={() => setShowPasswordRecovery(true)}
              className="text-sm text-primary hover:text-primary/80 mt-2 transition-colors"
            >
              Esqueceu a senha?
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary/90 text-white py-4 rounded-2xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-4"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>

          <div className="text-center">
            <p className="text-muted-foreground">
              Não tem uma conta?{' '}
              <button
                type="button"
                onClick={() => navigate('/register')}
                className="text-primary hover:text-primary/80 transition-colors"
              >
                Cadastre-se
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

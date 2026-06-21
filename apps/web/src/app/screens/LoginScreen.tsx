import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { Mail, Lock, PawPrint, Building2, User, Stethoscope, ShieldAlert, KeyRound } from 'lucide-react';
import { getDashboardRouteForUserType, type UserType } from '../context/shared';
import { useSession } from '../context/SessionContext';
import { PasswordInput } from '../components/ui/password-input';

type RecoveryStep = 'request' | 'confirm';

export default function LoginScreen() {
  const navigate = useNavigate();
  const { login } = useSession();
  const API_BASE = (import.meta.env.VITE_API_URL as string) ?? 'http://localhost:3333';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState<UserType>('owner');
  const [loading, setLoading] = useState(false);
  const [loginMessage, setLoginMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [showPasswordRecovery, setShowPasswordRecovery] = useState(false);
  const [recoveryStep, setRecoveryStep] = useState<RecoveryStep>('request');
  const [recoveryLoading, setRecoveryLoading] = useState(false);
  const [recoveryMessage, setRecoveryMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoveryCode, setRecoveryCode] = useState('');
  const [recoveryCodeInput, setRecoveryCodeInput] = useState('');
  const [recoveryNewPassword, setRecoveryNewPassword] = useState('');
  const [recoveryConfirmPassword, setRecoveryConfirmPassword] = useState('');

  const resetRecoveryState = () => {
    setRecoveryStep('request');
    setRecoveryLoading(false);
    setRecoveryMessage(null);
    setRecoveryEmail('');
    setRecoveryCode('');
    setRecoveryCodeInput('');
    setRecoveryNewPassword('');
    setRecoveryConfirmPassword('');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setLoginMessage(null);

    try {
      const resolvedUserType = await login(email, password, userType);
      navigate(getDashboardRouteForUserType(resolvedUserType), { replace: true });
    } catch (error) {
      console.error('Falha ao realizar login:', error);
      setLoginMessage({
        type: 'error',
        text: 'Nao foi possivel entrar. Confira seu e-mail e senha.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordRecoveryRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setRecoveryLoading(true);
    setRecoveryMessage(null);

    try {
      const resp = await fetch(`${API_BASE}/api/auth/password-recovery/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: recoveryEmail.trim() }),
      });

      if (!resp.ok) {
        const error = await resp.json();
        throw new Error(error.message ?? 'Recovery request failed');
      }

      const data = await resp.json();
      setRecoveryCode(data.code);
      setRecoveryStep('confirm');
      setRecoveryMessage({
        type: 'success',
        text: 'Codigo gerado no sistema. Use-o na proxima etapa para criar uma nova senha.',
      });
    } catch (error) {
      console.error('Falha ao solicitar recuperacao de senha:', error);
      setRecoveryMessage({
        type: 'error',
        text: 'Nao foi possivel gerar o codigo de recuperacao.',
      });
    } finally {
      setRecoveryLoading(false);
    }
  };

  const handlePasswordRecoveryConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    setRecoveryLoading(true);
    setRecoveryMessage(null);

    if (recoveryNewPassword !== recoveryConfirmPassword) {
      setRecoveryMessage({
        type: 'error',
        text: 'As senhas nao coincidem.',
      });
      setRecoveryLoading(false);
      return;
    }

    try {
      const resp = await fetch(`${API_BASE}/api/auth/password-recovery/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: recoveryEmail.trim(),
          code: recoveryCodeInput.trim(),
          newPassword: recoveryNewPassword,
        }),
      });

      if (!resp.ok) {
        const error = await resp.json();
        throw new Error(error.message ?? 'Password recovery confirmation failed');
      }

      setLoginMessage({
        type: 'success',
        text: 'Senha atualizada com sucesso. Entre novamente com a nova senha.',
      });
      setPassword('');
      setShowPasswordRecovery(false);
      resetRecoveryState();
    } catch (error) {
      console.error('Falha ao confirmar nova senha:', error);
      setRecoveryMessage({
        type: 'error',
        text: 'Nao foi possivel alterar a senha. Verifique o codigo e tente novamente.',
      });
    } finally {
      setRecoveryLoading(false);
    }
  };

  const renderRecovery = () => (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-10">
          <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mb-4">
            <PawPrint className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl text-foreground mb-2">Recuperacao de senha</h1>
          <p className="text-muted-foreground">O codigo de confirmacao aparece dentro do proprio sistema.</p>
        </div>

        <div className="bg-card rounded-3xl shadow-lg p-8 border border-border space-y-5">
          {recoveryMessage && (
            <div
              className={`rounded-2xl border px-4 py-3 text-sm ${
                recoveryMessage.type === 'success'
                  ? 'border-green-200 bg-green-50 text-green-700'
                  : 'border-red-200 bg-red-50 text-red-700'
              }`}
            >
              {recoveryMessage.text}
            </div>
          )}

          {recoveryStep === 'request' ? (
            <form onSubmit={handlePasswordRecoveryRequest} className="space-y-5">
              <div>
                <label htmlFor="recovery-email" className="block text-foreground mb-2">
                  E-mail <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="email"
                    id="recovery-email"
                    value={recoveryEmail}
                    onChange={(e) => setRecoveryEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-input border-2 border-border rounded-2xl focus:border-primary focus:outline-none transition-colors text-foreground"
                    placeholder="seu@email.com"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={recoveryLoading}
                className="w-full inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white py-4 rounded-2xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <KeyRound className="w-4 h-4" />
                {recoveryLoading ? 'Gerando codigo...' : 'Gerar codigo de recuperacao'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowPasswordRecovery(false);
                  resetRecoveryState();
                }}
                className="w-full text-muted-foreground hover:text-foreground transition-colors"
              >
                Voltar para o login
              </button>
            </form>
          ) : (
            <form onSubmit={handlePasswordRecoveryConfirm} className="space-y-5">
              <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
                <div className="flex items-start gap-3">
                  <ShieldAlert className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-foreground mb-1">Codigo de recuperacao</p>
                    <p className="text-sm text-muted-foreground">Ele foi gerado no sistema para a conta {recoveryEmail}.</p>
                    <p className="mt-2 text-lg tracking-[0.35em] text-primary">{recoveryCode}</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-foreground mb-2">Codigo recebido</label>
                <input
                  type="text"
                  value={recoveryCodeInput}
                  onChange={(e) => setRecoveryCodeInput(e.target.value)}
                  className="w-full px-4 py-3 bg-input border-2 border-border rounded-2xl focus:border-primary focus:outline-none transition-colors text-foreground tracking-[0.35em]"
                  placeholder="000000"
                  maxLength={6}
                  required
                />
              </div>

              <div>
                <label className="block text-foreground mb-2">Nova senha</label>
                <PasswordInput
                  value={recoveryNewPassword}
                  onChange={(e) => setRecoveryNewPassword(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-foreground mb-2">Confirmar nova senha</label>
                <PasswordInput
                  value={recoveryConfirmPassword}
                  onChange={(e) => setRecoveryConfirmPassword(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={recoveryLoading}
                className="w-full inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white py-4 rounded-2xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Lock className="w-4 h-4" />
                {recoveryLoading ? 'Confirmando...' : 'Confirmar nova senha'}
              </button>

              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => setRecoveryStep('request')}
                  className="w-full text-sm text-primary hover:text-primary/80 transition-colors"
                >
                  Alterar e-mail ou gerar novo codigo
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordRecovery(false);
                    resetRecoveryState();
                  }}
                  className="w-full text-muted-foreground hover:text-foreground transition-colors"
                >
                  Voltar para o login
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );

  if (showPasswordRecovery) {
    return renderRecovery();
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-10">
          <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mb-4">
            <PawPrint className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl text-foreground mb-2">PetHelp</h1>
          <p className="text-muted-foreground">Gerenciamento completo de cuidados com pets</p>
        </div>

        <form onSubmit={handleLogin} className="bg-card rounded-3xl shadow-lg p-8 border border-border">
          <h2 className="text-2xl text-foreground mb-6">Bem-vindo de volta</h2>

          {loginMessage && (
            <div
              className={`mb-5 rounded-2xl border px-4 py-3 text-sm ${
                loginMessage.type === 'success'
                  ? 'border-green-200 bg-green-50 text-green-700'
                  : 'border-red-200 bg-red-50 text-red-700'
              }`}
            >
              {loginMessage.text}
            </div>
          )}

          <div className="mb-6">
            <label className="block text-foreground mb-3">
              Entrar como <span className="text-red-500">*</span>
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
                <span className="text-sm">Veterinario</span>
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
                <span className="text-sm">Clinica</span>
              </button>
            </div>
          </div>

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

          <div className="mb-6">
            <label htmlFor="password" className="block text-foreground mb-2">
              Senha <span className="text-red-500">*</span>
            </label>
            <PasswordInput
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Digite sua senha"
              required
            />
            <button
              type="button"
              onClick={() => {
                setRecoveryEmail(email);
                setShowPasswordRecovery(true);
                setRecoveryStep('request');
                setRecoveryMessage(null);
              }}
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
              Nao tem uma conta?{' '}
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







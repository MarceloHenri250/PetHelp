import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import {
  ArrowLeft,
  ChevronRight,
  IdCard,
  Languages,
  Mail,
  Phone,
  Save,
  ShieldAlert,
  Stethoscope,
  Trash2,
  User,
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../components/ui/alert-dialog';
import { useInteraction } from '../context/InteractionContext';
import { useSession } from '../context/SessionContext';
import { useAppNavigation, useDashboardBackLogout } from '../navigation';
import VeterinarianTopBar from './VeterinarianTopBar';

function digitsOnly(value: string) {
  return value.replace(/\D/g, '');
}

function formatPhone(value: string) {
  const digits = digitsOnly(value).slice(0, 11);

  if (digits.length <= 2) {
    return digits.length ? `(${digits}` : '';
  }

  const area = digits.slice(0, 2);
  const rest = digits.slice(2);

  if (rest.length <= 4) {
    return `(${area}) ${rest}`;
  }

  if (digits.length <= 10) {
    return `(${area}) ${rest.slice(0, 4)}-${rest.slice(4)}`;
  }

  return `(${area}) ${rest.slice(0, 5)}-${rest.slice(5)}`;
}

function formatCrmvUf(value: string) {
  return value.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 2);
}

export default function VeterinarianSettingsScreen() {
  const navigate = useNavigate();
  const { notifications } = useInteraction();
  const { user, updateVeterinarianProfile, deleteCurrentUserAccount } = useSession();
  const { goToDashboard, goToLogin, confirmAndLogout } = useAppNavigation();
  useDashboardBackLogout();

  const [name, setName] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [crmv, setCrmv] = useState('');
  const [crmvUf, setCrmvUf] = useState('');
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);
  const [dangerBusy, setDangerBusy] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    setName(user?.name ?? '');
    setSpecialty(user?.specialty ?? '');
    setCrmv(user?.crmv ?? '');
    setCrmvUf(user?.crmvUf ?? '');
    setPhone(formatPhone(user?.phone ?? ''));
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);

    try {
      await updateVeterinarianProfile({
        name: name.trim(),
        specialty: specialty.trim(),
        crmv: crmv.trim(),
        crmvUf: crmvUf.trim().toUpperCase(),
        phone: phone.trim() || null,
      });

      setFeedback({
        type: 'success',
        message: 'Configurações salvas com sucesso.',
      });
    } catch (error) {
      console.error('Falha ao atualizar perfil do veterinário:', error);
      setFeedback({
        type: 'error',
        message: 'Não foi possível atualizar as configurações.',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (deleteConfirmation.trim().toUpperCase() !== 'EXCLUIR') {
      setFeedback({
        type: 'error',
        message: 'Digite EXCLUIR para confirmar a remoção da conta.',
      });
      return;
    }

    setDangerBusy(true);
    setFeedback(null);

    try {
      await deleteCurrentUserAccount();
      goToLogin();
    } catch (error) {
      console.error('Falha ao excluir conta do veterinário:', error);
      setFeedback({
        type: 'error',
        message: 'Não foi possível excluir a conta. Verifique se existem vínculos pendentes.',
      });
    } finally {
      setDangerBusy(false);
      setDeleteDialogOpen(false);
      setDeleteConfirmation('');
    }
  };

  const unreadNotifications = notifications.filter((notification) => notification.userId === user?.id && !notification.read).length;
  const veterinarianName = user?.name || 'Veterinário';

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
        <button
          onClick={() => goToDashboard('veterinarian')}
          className="mb-6 inline-flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-5 w-5" />
          Voltar para a dashboard
        </button>

        <section className="rounded-[28px] border border-border/60 bg-card p-8 shadow-lg">
          <div className="mb-8 flex items-start gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
              <Stethoscope className="h-7 w-7 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl text-foreground">Configurações do veterinário</h1>
              <p className="text-muted-foreground">Dados profissionais, idioma e segurança da conta.</p>
            </div>
          </div>

          {feedback && (
            <div
              className={`mb-6 rounded-2xl border px-4 py-3 text-sm ${
                feedback.type === 'success'
                  ? 'border-green-200 bg-green-50 text-green-700'
                  : 'border-red-200 bg-red-50 text-red-700'
              }`}
            >
              {feedback.message}
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-5">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm text-foreground">Nome completo</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-2xl border-2 border-border bg-input py-3 pl-12 pr-4 text-foreground transition-colors focus:border-primary focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm text-foreground">Especialidade *</label>
                <input
                  type="text"
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value)}
                  className="w-full rounded-2xl border-2 border-border bg-input px-4 py-3 text-foreground transition-colors focus:border-primary focus:outline-none"
                  placeholder="Ex.: Clínica geral, dermatologia, felinos"
                  required
                />
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between gap-3">
                <label className="block text-foreground">E-mail</label>
                <span className="rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">Bloqueado</span>
              </div>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="email"
                  value={user?.email ?? ''}
                  disabled
                  aria-readonly="true"
                  className="w-full cursor-not-allowed rounded-2xl border-2 border-border bg-muted py-3 pl-12 pr-4 text-muted-foreground"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm text-foreground">Telefone</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(formatPhone(e.target.value))}
                    className="w-full rounded-2xl border-2 border-border bg-input py-3 pl-12 pr-4 text-foreground transition-colors focus:border-primary focus:outline-none"
                    placeholder="(11) 99999-9999"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm text-foreground">CRMV</label>
                <div className="relative">
                  <IdCard className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    value={crmv}
                    onChange={(e) => setCrmv(e.target.value)}
                    className="w-full rounded-2xl border-2 border-border bg-input py-3 pl-12 pr-4 text-foreground transition-colors focus:border-primary focus:outline-none"
                    placeholder="00000"
                  />
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-[1fr_180px]">
              <div>
                <label className="mb-2 block text-sm text-foreground">UF do CRMV</label>
                <input
                  type="text"
                  value={crmvUf}
                  onChange={(e) => setCrmvUf(formatCrmvUf(e.target.value))}
                  className="w-full rounded-2xl border-2 border-border bg-input px-4 py-3 uppercase text-foreground transition-colors focus:border-primary focus:outline-none"
                  placeholder="SP"
                  maxLength={2}
                />
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={saving || dangerBusy || !specialty.trim()}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3 text-white transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  {saving ? 'Salvando...' : 'Salvar configurações'}
                </button>
              </div>
            </div>
          </form>
        </section>

        <section className="mt-6 rounded-[28px] border border-border bg-card p-8 shadow-lg">
          <div className="mb-6 flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
              <Languages className="h-7 w-7 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl text-foreground">Idioma do sistema</h2>
              <p className="text-muted-foreground">A personalização de idioma será liberada em breve.</p>
            </div>
          </div>

          <div className="rounded-2xl border border-dashed border-border bg-muted/40 p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="mb-1 text-foreground">Português (Brasil)</p>
                <p className="text-sm text-muted-foreground">Em breve você poderá alternar entre os idiomas disponíveis.</p>
              </div>
              <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs text-primary">
                Em breve
              </span>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {['Português (Brasil)', 'English', 'Espanhol'].map((language, index) => (
                <button
                  key={language}
                  type="button"
                  disabled
                  className={`flex cursor-not-allowed items-center justify-between rounded-2xl border px-4 py-3 text-left opacity-90 transition-colors ${
                    index === 0
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border bg-background text-muted-foreground'
                  }`}
                >
                  <span>{language}</span>
                  {index === 0 ? <ChevronRight className="h-4 w-4" /> : null}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-[28px] border border-red-200 bg-red-50/70 p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100">
              <ShieldAlert className="h-7 w-7 text-red-600" />
            </div>
            <div>
              <h2 className="text-2xl text-red-700">Zona de perigo</h2>
              <p className="text-red-600/80">A exclusão da conta remove permanentemente seus dados de acesso.</p>
            </div>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="mb-1 text-red-700">Excluir conta</p>
              <p className="text-sm text-red-600/80">
                Digite EXCLUIR para confirmar. A exclusão é bloqueada se houver vínculos dependentes.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setDeleteDialogOpen(true)}
              disabled={saving || dangerBusy}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-red-600 px-5 py-3 text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Trash2 className="h-4 w-4" />
              {dangerBusy ? 'Excluindo...' : 'Excluir conta'}
            </button>
          </div>
        </section>
      </div>

      <AlertDialog
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          setDeleteDialogOpen(open);
          if (!open) {
            setDeleteConfirmation('');
          }
        }}
      >
        <AlertDialogContent className="max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão da conta</AlertDialogTitle>
            <AlertDialogDescription>
              Digite EXCLUIR para confirmar. Essa ação remove o acesso do veterinário e pode ser bloqueada por dependências ativas.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-2">
            <label className="block text-sm text-foreground">Confirme digitando EXCLUIR</label>
            <input
              type="text"
              value={deleteConfirmation}
              onChange={(e) => setDeleteConfirmation(e.target.value)}
              className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-foreground outline-none focus:border-red-400"
              placeholder="EXCLUIR"
            />
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={dangerBusy}>Cancelar</AlertDialogCancel>
            <button
              type="button"
              onClick={handleDelete}
              disabled={dangerBusy || deleteConfirmation.trim().toUpperCase() !== 'EXCLUIR'}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Trash2 className="h-4 w-4" />
              {dangerBusy ? 'Excluindo...' : 'Excluir conta'}
            </button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

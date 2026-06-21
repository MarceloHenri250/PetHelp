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
  Settings,
  ShieldAlert,
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
import { useSession } from '../context/SessionContext';
import { useAppNavigation } from '../navigation';

function digitsOnly(value: string) {
  return value.replace(/\D/g, '');
}

function formatCpf(value: string) {
  const digits = digitsOnly(value).slice(0, 11);

  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9, 11)}`;
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

export default function OwnerProfileScreen() {
  const navigate = useNavigate();
  const { user, updateCurrentUserProfile, deleteCurrentUserAccount } = useSession();
  const { goToDashboard } = useAppNavigation();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [cpf, setCpf] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    setName(user?.name ?? '');
    setPhone(formatPhone(user?.phone ?? ''));
    setCpf(formatCpf(user?.cpf ?? ''));
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);

    try {
      await updateCurrentUserProfile({
        name: name.trim(),
        phone: phone.trim() || null,
        cpf: cpf.trim() || null,
      });

      setFeedback({
        type: 'success',
        message: 'Configuracoes salvas com sucesso.',
      });
    } catch (error) {
      console.error('Falha ao atualizar perfil:', error);
      setFeedback({
        type: 'error',
        message: 'Nao foi possivel atualizar as configuracoes.',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (deleteConfirmation.trim().toUpperCase() !== 'EXCLUIR') {
      setFeedback({
        type: 'error',
        message: 'Digite EXCLUIR para confirmar a remocao da conta.',
      });
      return;
    }

    setDeleting(true);
    setFeedback(null);

    try {
      await deleteCurrentUserAccount();
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Falha ao excluir conta:', error);
      setFeedback({
        type: 'error',
        message: 'Nao foi possivel excluir a conta. Verifique se existem registros vinculados.',
      });
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
      setDeleteConfirmation('');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-card border-b border-border">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <button
            onClick={() => goToDashboard('owner')}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Voltar</span>
          </button>

          <div className="text-right">
            <p className="text-sm text-muted-foreground">Configuracoes do tutor</p>
            <p className="text-foreground">{user?.name || 'Conta do tutor'}</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        <section className="bg-card rounded-3xl shadow-lg p-8 border border-border">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center">
              <Settings className="w-7 h-7 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl text-foreground">Configuracoes da conta</h1>
              <p className="text-muted-foreground">Edite seus dados e gerencie sua experiencia no sistema.</p>
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
            <div>
              <label className="block text-foreground mb-2">Nome completo</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-input border-2 border-border rounded-2xl focus:border-primary focus:outline-none transition-colors text-foreground"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between gap-3 mb-2">
                <label className="block text-foreground">E-mail</label>
                <span className="text-xs rounded-full bg-muted px-2.5 py-1 text-muted-foreground">Bloqueado</span>
              </div>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="email"
                  value={user?.email ?? ''}
                  disabled
                  aria-readonly="true"
                  className="w-full pl-12 pr-4 py-3 bg-muted border-2 border-border rounded-2xl text-muted-foreground cursor-not-allowed"
                />
              </div>
              <p className="mt-2 text-xs text-muted-foreground">O e-mail não pode ser alterado nesta conta.</p>
            </div>

            <div>
              <label className="block text-foreground mb-2">Telefone</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(formatPhone(e.target.value))}
                  className="w-full pl-12 pr-4 py-3 bg-input border-2 border-border rounded-2xl focus:border-primary focus:outline-none transition-colors text-foreground"
                  placeholder="(11) 99999-9999"
                />
              </div>
            </div>

            <div>
              <label className="block text-foreground mb-2">CPF</label>
              <div className="relative">
                <IdCard className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  value={cpf}
                  onChange={(e) => setCpf(formatCpf(e.target.value))}
                  className="w-full pl-12 pr-4 py-3 bg-input border-2 border-border rounded-2xl focus:border-primary focus:outline-none transition-colors text-foreground"
                  placeholder="000.000.000-00"
                />
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={saving || deleting}
                className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white px-5 py-3 rounded-2xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Salvando...' : 'Salvar configuracoes'}
              </button>
            </div>
          </form>
        </section>

        <section className="bg-card rounded-3xl shadow-lg p-8 border border-border">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center">
              <Languages className="w-7 h-7 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl text-foreground">Idioma do sistema</h2>
              <p className="text-muted-foreground">A personalizacao de idioma sera liberada em breve.</p>
            </div>
          </div>

          <div className="rounded-2xl border border-dashed border-border bg-muted/40 p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-foreground mb-1">Portuguese (Brasil)</p>
                <p className="text-sm text-muted-foreground">Em breve voce podera alternar entre os idiomas disponiveis.</p>
              </div>
              <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs text-primary">
                Em breve
              </span>
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
              {['Portuguese (Brasil)', 'English', 'Espanol'].map((language, index) => (
                <button
                  key={language}
                  type="button"
                  disabled
                  className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-left transition-colors ${
                    index === 0
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border bg-background text-muted-foreground'
                  } cursor-not-allowed opacity-90`}
                >
                  <span>{language}</span>
                  {index === 0 ? <ChevronRight className="w-4 h-4" /> : null}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-red-50 rounded-3xl shadow-lg p-8 border border-red-200">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center">
              <ShieldAlert className="w-7 h-7 text-red-600" />
            </div>
            <div>
              <h2 className="text-2xl text-red-700">Zona de perigo</h2>
              <p className="text-red-600/80">A exclusao da conta remove permanentemente seus dados de acesso.</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-red-700 mb-1">Excluir conta</p>
              <p className="text-sm text-red-600/80">
                Seus pets vinculados permanecem no sistema sem tutor. Se houver registros dependentes, a exclusao pode ser bloqueada.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setDeleteDialogOpen(true)}
              disabled={saving || deleting}
              className="inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-5 py-3 rounded-2xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Trash2 className="w-4 h-4" />
              {deleting ? 'Excluindo...' : 'Excluir conta'}
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
            <AlertDialogTitle>Confirmar exclusao da conta</AlertDialogTitle>
            <AlertDialogDescription>
              Digite EXCLUIR para confirmar. Seus pets continuarao no sistema sem tutor, e quaisquer dependencias podem impedir a exclusao.
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
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting || deleteConfirmation.trim().toUpperCase() !== 'EXCLUIR'}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
              {deleting ? 'Excluindo...' : 'Excluir conta'}
            </button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}







import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, ArrowLeftRight, Mail, ShieldAlert, Sparkles, User } from 'lucide-react';
import { getDashboardRouteForUserType } from '../context/shared';
import { usePets } from '../context/PetsContext';
import { useSession } from '../context/SessionContext';
import { useAppNavigation } from '../navigation';

export default function PetTransferScreen() {
  const navigate = useNavigate();
  const { user } = useSession();
  const { currentPet, transferPetOwnership } = usePets();
  const { goToDashboard } = useAppNavigation();
  const [targetTutorEmail, setTargetTutorEmail] = useState('');
  const [securityConfirmation, setSecurityConfirmation] = useState('');
  const [petNameConfirmation, setPetNameConfirmation] = useState('');
  const [transferring, setTransferring] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    setTargetTutorEmail('');
    setSecurityConfirmation('');
    setPetNameConfirmation('');
    setFeedback(null);
  }, [currentPet?.id]);

  if (!currentPet) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <div className="text-center">
          <p className="text-foreground mb-4">Nenhum pet selecionado</p>
          <button onClick={() => goToDashboard(user?.userType)} className="bg-primary text-white px-6 py-3 rounded-2xl">
            Voltar
          </button>
        </div>
      </div>
    );
  }

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (securityConfirmation.trim().toUpperCase() !== 'TRANSFERIR') {
      setFeedback({
        type: 'error',
        message: 'Digite TRANSFERIR para confirmar a operação.',
      });
      return;
    }

    if (petNameConfirmation.trim() !== currentPet.name) {
      setFeedback({
        type: 'error',
        message: `Digite exatamente ${currentPet.name} para validar a transferência.`,
      });
      return;
    }

    setTransferring(true);

    try {
      await transferPetOwnership(currentPet.id, {
        targetTutorEmail: targetTutorEmail.trim(),
        securityConfirmation,
        petNameConfirmation,
      });

      setFeedback({
        type: 'success',
        message: 'Pet transferido com sucesso.',
      });
      navigate(getDashboardRouteForUserType(user?.userType), { replace: true });
    } catch (error) {
      console.error('Falha ao transferir pet:', error);
      setFeedback({
        type: 'error',
        message: 'Não foi possível transferir a titularidade deste pet.',
      });
    } finally {
      setTransferring(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-card border-b border-border">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <button
            onClick={() => navigate('/pet-profile')}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Voltar</span>
          </button>

          <div className="text-right">
            <p className="text-sm text-muted-foreground">Transferência de pet</p>
            <p className="text-foreground">{currentPet.name}</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        <section className="bg-card rounded-3xl shadow-lg p-8 border border-border">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center">
              <ArrowLeftRight className="w-7 h-7 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl text-foreground">Transferir titularidade</h1>
              <p className="text-muted-foreground">Defina para quem o pet será transferido e confirme a operação.</p>
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

          <div className="rounded-2xl border border-border bg-muted/40 p-5 mb-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-foreground mb-1">{currentPet.name}</p>
                <p className="text-sm text-muted-foreground">
                  {currentPet.species ? `${currentPet.species} - ` : ''}
                  {currentPet.breed || 'Raça não informada'}
                </p>
              </div>
              <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs text-primary">
                Pronto para transferência
              </span>
            </div>
          </div>

          <form onSubmit={handleTransfer} className="space-y-5">
            <div>
              <label className="block text-foreground mb-2">E-mail do novo tutor</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="email"
                  value={targetTutorEmail}
                  onChange={(e) => setTargetTutorEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-input border-2 border-border rounded-2xl focus:border-primary focus:outline-none transition-colors text-foreground"
                  placeholder="novo.tutor@email.com"
                  required
                />
              </div>
              <p className="mt-2 text-xs text-muted-foreground">O e-mail deve pertencer a uma conta de tutor já cadastrada.</p>
            </div>

            <div>
              <label className="block text-foreground mb-2">Confirmação de segurança</label>
              <div className="relative">
                <ShieldAlert className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  value={securityConfirmation}
                  onChange={(e) => setSecurityConfirmation(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-input border-2 border-border rounded-2xl focus:border-primary focus:outline-none transition-colors text-foreground uppercase"
                  placeholder="TRANSFERIR"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-foreground mb-2">Digite o nome do pet para confirmar</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  value={petNameConfirmation}
                  onChange={(e) => setPetNameConfirmation(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-input border-2 border-border rounded-2xl focus:border-primary focus:outline-none transition-colors text-foreground"
                  placeholder={currentPet.name}
                  required
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={transferring}
                className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white px-5 py-3 rounded-2xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowLeftRight className="w-4 h-4" />
                {transferring ? 'Transferindo...' : 'Transferir pet'}
              </button>
            </div>
          </form>
        </section>

        <section className="bg-red-50 rounded-3xl shadow-lg p-8 border border-red-200">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center">
              <ShieldAlert className="w-7 h-7 text-red-600" />
            </div>
            <div>
              <h2 className="text-2xl text-red-700">Atenção</h2>
              <p className="text-red-600/80">Após a transferência, o novo tutor passa a ser o responsável principal por este pet.</p>
            </div>
          </div>

          <div className="rounded-2xl border border-dashed border-red-200 bg-card/60 p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-red-700 mb-1">Confirmação irreversível</p>
                <p className="text-sm text-red-600/80">
                  Garanta que o e-mail informado pertence ao tutor correto antes de concluir a operação.
                </p>
              </div>
              <span className="inline-flex items-center rounded-full bg-red-100 px-3 py-1 text-xs text-red-700">
                Transferência
              </span>
            </div>
          </div>

          <div className="mt-6 flex items-center gap-3 text-sm text-red-700">
            <Sparkles className="w-4 h-4" />
            <span>O histórico do pet permanece no sistema após a transferência.</span>
          </div>
        </section>
      </div>
    </div>
  );
}




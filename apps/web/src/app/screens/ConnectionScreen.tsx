import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Link as LinkIcon, QrCode, Check } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function ConnectionScreen() {
  const navigate = useNavigate();
  const { currentPet, linkPetToClinic } = useApp();
  const [clinicCode, setClinicCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPet) return;

    setLoading(true);
    try {
      await linkPetToClinic(currentPet.id, clinicCode);
      setSuccess(true);
      setTimeout(() => {
        navigate('/owner-dashboard');
      }, 2000);
    } catch (error) {
      console.error('Falha na conexão:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-card border-b border-border">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <button
            onClick={() => navigate('/owner-dashboard')}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Voltar</span>
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-8">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <LinkIcon className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-3xl text-foreground mb-2">Vincular à Clínica</h1>
          <p className="text-muted-foreground">
            Conecte {currentPet?.name || 'seu pet'} a uma clínica parceira
          </p>
        </div>

        {success ? (
          <div className="bg-card rounded-3xl shadow-lg p-8 border border-border text-center">
            <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-10 h-10 text-green-500" />
            </div>
            <h2 className="text-2xl text-foreground mb-2">Conectado com Sucesso!</h2>
            <p className="text-muted-foreground">
              Seu pet agora está vinculado à clínica. Redirecionando...
            </p>
          </div>
        ) : (
          <div className="bg-card rounded-3xl shadow-lg p-8 border border-border">
            <div className="mb-6">
              <h2 className="text-xl text-foreground mb-4">Como funciona</h2>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-primary">1</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-foreground">Obtenha o código da clínica</p>
                    <p className="text-sm text-muted-foreground">
                      Peça à clínica veterinária parceira o seu código de conexão exclusivo
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-primary">2</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-foreground">Insira o código</p>
                    <p className="text-sm text-muted-foreground">
                      Digite o código recebido no campo abaixo para estabelecer a conexão
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-primary">3</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-foreground">Pronto para partilhar</p>
                    <p className="text-sm text-muted-foreground">
                      A partir de agora, os profissionais autorizados da clínica poderão visualizar o histórico do seu pet
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-border pt-6">
              <form onSubmit={handleConnect}>
                <label className="block text-foreground mb-3">Código de Conexão da Clínica</label>
                <div className="relative mb-6">
                  <QrCode className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="text"
                    value={clinicCode}
                    onChange={(e) => setClinicCode(e.target.value.toUpperCase())}
                    className="w-full pl-12 pr-4 py-4 bg-input border-2 border-border rounded-2xl focus:border-primary focus:outline-none transition-colors text-foreground text-center text-lg tracking-wider uppercase"
                    placeholder="CLINICA1234"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading || !currentPet}
                  className="w-full bg-primary hover:bg-primary/90 text-white py-4 rounded-2xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Conectando...' : 'Vincular Clínica'}
                </button>
              </form>
            </div>
          </div>
        )}

        {currentPet?.linkedClinicId && (
          <div className="bg-card rounded-2xl p-6 mt-6 border border-border">
            <h3 className="text-foreground mb-2">Vinculado Atualmente</h3>
            <p className="text-sm text-muted-foreground">
              Este pet já possui um vínculo ativo com um estabelecimento
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
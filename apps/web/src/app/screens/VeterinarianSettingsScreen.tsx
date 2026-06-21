import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Bell, Save, ShieldAlert, Stethoscope, Phone, IdCard } from 'lucide-react';
import { useSession } from '../context/SessionContext';
import { useAppNavigation } from '../navigation';

export default function VeterinarianSettingsScreen() {
  const navigate = useNavigate();
  const { user, updateVeterinarianProfile } = useSession();
  const { goToDashboard } = useAppNavigation();
  const [name, setName] = useState('');
  const [crmv, setCrmv] = useState('');
  const [crmvUf, setCrmvUf] = useState('');
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setName(user?.name ?? '');
    setCrmv(user?.crmv ?? '');
    setCrmvUf(user?.crmvUf ?? '');
    setPhone(user?.phone ?? '');
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateVeterinarianProfile({
        name: name.trim(),
        crmv: crmv.trim(),
        crmvUf: crmvUf.trim().toUpperCase(),
        phone: phone.trim() || null,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(17,24,39,0.04),_transparent_34%),linear-gradient(180deg,_#f8fafc_0%,_#ffffff_100%)]">
      <div className="max-w-4xl mx-auto px-6 py-6">
        <button onClick={() => goToDashboard('veterinarian')} className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-5 h-5" />
          Voltar
        </button>

        <div className="rounded-[28px] border border-border/60 bg-card p-8 shadow-lg">
          <div className="flex items-start gap-4 mb-8">
            <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Stethoscope className="w-7 h-7 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl text-foreground">Configurações do veterinário</h1>
              <p className="text-muted-foreground">Dados profissionais, vínculo e notificações.</p>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-5">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm text-foreground mb-2">Nome</label>
                <input value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-2xl border border-border bg-input px-4 py-3" />
              </div>
              <div>
                <label className="block text-sm text-foreground mb-2">Telefone</label>
                <input value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full rounded-2xl border border-border bg-input px-4 py-3" />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm text-foreground mb-2">CRMV</label>
                <div className="relative">
                  <IdCard className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input value={crmv} onChange={(e) => setCrmv(e.target.value)} className="w-full rounded-2xl border border-border bg-input px-4 py-3 pl-12" />
                </div>
              </div>
              <div>
                <label className="block text-sm text-foreground mb-2">UF</label>
                <input value={crmvUf} onChange={(e) => setCrmvUf(e.target.value.toUpperCase())} maxLength={2} className="w-full rounded-2xl border border-border bg-input px-4 py-3 uppercase" />
              </div>
            </div>

            <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-3 text-white">
              <Save className="w-4 h-4" />
              {saving ? 'Salvando...' : 'Salvar configurações'}
            </button>
          </form>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <section className="rounded-[28px] border border-border/60 bg-card p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-3">
              <Bell className="w-5 h-5 text-primary" />
              <h2 className="text-xl text-foreground">Notificações</h2>
            </div>
            <p className="text-sm text-muted-foreground">As notificações da conta continuam acessíveis em uma tela dedicada, igual ao tutor.</p>
            <button onClick={() => navigate('/notifications')} className="mt-4 rounded-2xl border border-border px-4 py-2 text-foreground">
              Abrir notificações
            </button>
          </section>

          <section className="rounded-[28px] border border-amber-200 bg-amber-50 p-6">
            <div className="flex items-center gap-3 mb-3">
              <ShieldAlert className="w-5 h-5 text-amber-700" />
              <h2 className="text-xl text-amber-800">Acesso profissional</h2>
            </div>
            <p className="text-sm text-amber-800/80">
              Aqui ficam as informações do profissional. O acesso aos pacientes vinculados depende dos convênios e aprovações da clínica.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

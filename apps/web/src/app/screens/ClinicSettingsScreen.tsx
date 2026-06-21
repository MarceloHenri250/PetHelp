import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  Languages,
  Save,
  ShieldAlert,
  Stethoscope,
  Trash2,
} from 'lucide-react';
import ClinicTopBar from './ClinicTopBar';
import { useSession } from '../context/SessionContext';
import { useAppNavigation, useDashboardBackLogout } from '../navigation';

const days = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

function createDefaultWorkingHours() {
  return {
    Seg: { open: '08:00', close: '18:00' },
    Ter: { open: '08:00', close: '18:00' },
    Qua: { open: '08:00', close: '18:00' },
    Qui: { open: '08:00', close: '18:00' },
    Sex: { open: '08:00', close: '18:00' },
    Sáb: { open: '08:00', close: '12:00' },
    Dom: { open: '', close: '' },
  };
}

export default function ClinicSettingsScreen() {
  const navigate = useNavigate();
  const { user, updateClinicProfile, deleteCurrentUserAccount } = useSession();
  const { goToDashboard, goToLogin, confirmAndLogout } = useAppNavigation();
  useDashboardBackLogout();

  const [tradeName, setTradeName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [services, setServices] = useState('');
  const [language, setLanguage] = useState('pt-BR');
  const [workingHours, setWorkingHours] = useState<Record<string, { open: string; close: string }>>(createDefaultWorkingHours());
  const [saving, setSaving] = useState(false);
  const [dangerBusy, setDangerBusy] = useState(false);

  useEffect(() => {
    setTradeName(user?.clinicName ?? '');
    setPhone(user?.phone ?? '');
    setAddress(user?.address ?? '');
    setCnpj(user?.cnpj ?? '');
    setServices(user?.services?.join(', ') ?? '');
    setLanguage(user?.language ?? 'pt-BR');
    setWorkingHours((user?.workingHours as Record<string, { open: string; close: string }>) ?? createDefaultWorkingHours());
  }, [user]);

  const clinicName = user?.clinicName || user?.name || 'Clínica';

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      await updateClinicProfile({
        tradeName: tradeName.trim(),
        phone: phone.trim() || null,
        address: address.trim(),
        cnpj: cnpj.trim() || null,
        services: services.split(',').map((item) => item.trim()).filter(Boolean),
        workingHours,
        language,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleWorkingHoursChange = (day: string, field: 'open' | 'close', value: string) => {
    setWorkingHours((prev) => ({
      ...prev,
      [day]: {
        open: field === 'open' ? value : (prev[day]?.open ?? ''),
        close: field === 'close' ? value : (prev[day]?.close ?? ''),
      },
    }));
  };

  const handleDeactivateAccount = async () => {
    if (!confirm('Desativar a conta da clínica é uma ação irreversível. Continuar?')) return;

    setDangerBusy(true);
    try {
      await deleteCurrentUserAccount();
      goToLogin();
    } finally {
      setDangerBusy(false);
    }
  };

  const handleResetForm = () => {
    setTradeName(user?.clinicName ?? '');
    setPhone(user?.phone ?? '');
    setAddress(user?.address ?? '');
    setCnpj(user?.cnpj ?? '');
    setServices(user?.services?.join(', ') ?? '');
    setLanguage(user?.language ?? 'pt-BR');
    setWorkingHours((user?.workingHours as Record<string, { open: string; close: string }>) ?? createDefaultWorkingHours());
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(17,24,39,0.04),_transparent_34%),linear-gradient(180deg,_#f8fafc_0%,_#ffffff_100%)]">
      <ClinicTopBar
        clinicName={clinicName}
        onNotifications={() => navigate('/notifications')}
        onSettings={() => navigate('/clinic-settings')}
        onLogout={confirmAndLogout}
      />

      <div className="max-w-4xl mx-auto px-6 py-8">
        <button onClick={() => goToDashboard('clinic')} className="mb-6 inline-flex items-center gap-2 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-5 h-5" />
          Voltar
        </button>

        <div className="rounded-[28px] border border-border/60 bg-card p-8 shadow-lg">
          <div className="flex items-start gap-4 mb-8">
            <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Stethoscope className="w-7 h-7 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl text-foreground">Configurações da clínica</h1>
              <p className="text-muted-foreground">Dados cadastrais, idioma do painel e horários operacionais.</p>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm text-foreground mb-2">Nome fantasia</label>
                <input value={tradeName} onChange={(e) => setTradeName(e.target.value)} className="w-full rounded-2xl border border-border bg-input px-4 py-3" />
              </div>
              <div>
                <label className="block text-sm text-foreground mb-2">CNPJ</label>
                <input value={cnpj} onChange={(e) => setCnpj(e.target.value)} className="w-full rounded-2xl border border-border bg-input px-4 py-3" />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm text-foreground mb-2">Telefone</label>
                <input value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full rounded-2xl border border-border bg-input px-4 py-3" />
              </div>
              <div>
                <label className="block text-sm text-foreground mb-2">Endereço</label>
                <input value={address} onChange={(e) => setAddress(e.target.value)} className="w-full rounded-2xl border border-border bg-input px-4 py-3" />
              </div>
            </div>

            <div>
              <label className="block text-sm text-foreground mb-2">Catálogo de serviços</label>
              <textarea value={services} onChange={(e) => setServices(e.target.value)} className="w-full rounded-2xl border border-border bg-input px-4 py-3 min-h-28" />
              <p className="mt-2 text-xs text-muted-foreground">Separe os serviços por vírgula para facilitar a organização do catálogo.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-[1fr_0.8fr]">
              <div className="rounded-2xl border border-border bg-muted/30 p-4">
                <div className="mb-3 flex items-center gap-2">
                  <Languages className="w-4 h-4 text-primary" />
                  <h2 className="text-lg text-foreground">Idioma do painel</h2>
                </div>
                <select value={language} onChange={(e) => setLanguage(e.target.value)} className="w-full rounded-2xl border border-border bg-background px-4 py-3">
                  <option value="pt-BR">Português</option>
                  <option value="en">Inglês</option>
                  <option value="es">Espanhol</option>
                </select>
              </div>

              <div className="rounded-2xl border border-border bg-muted/30 p-4">
                <div className="mb-3 flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-primary" />
                  <h2 className="text-lg text-foreground">Acesso a veterinários</h2>
                </div>
                <p className="text-sm text-muted-foreground">
                  O código da clínica e o gerenciamento de profissionais agora ficam centralizados na dashboard e na tela dedicada de veterinários.
                </p>
                <button
                  type="button"
                  onClick={() => navigate('/clinic-veterinarians')}
                  className="mt-4 inline-flex items-center gap-2 rounded-2xl border border-border bg-background px-4 py-3 text-foreground"
                >
                  <CalendarDays className="w-4 h-4" />
                  Abrir gerenciamento
                </button>
              </div>
            </div>

            <div>
              <div className="mb-3 flex items-center gap-2">
                <Clock3 className="w-4 h-4 text-primary" />
                <h2 className="text-lg text-foreground">Horário de funcionamento</h2>
              </div>
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {days.map((day) => (
                  <div key={day} className="rounded-2xl border border-border bg-muted/30 p-4">
                    <p className="mb-3 text-sm text-foreground">{day}</p>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="time"
                        value={workingHours[day]?.open ?? ''}
                        onChange={(e) => handleWorkingHoursChange(day, 'open', e.target.value)}
                        className="rounded-xl border border-border bg-background px-3 py-2"
                      />
                      <input
                        type="time"
                        value={workingHours[day]?.close ?? ''}
                        onChange={(e) => handleWorkingHoursChange(day, 'close', e.target.value)}
                        className="rounded-xl border border-border bg-background px-3 py-2"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-3 text-white disabled:opacity-60">
                <Save className="w-4 h-4" />
                {saving ? 'Salvando...' : 'Salvar configurações'}
              </button>
              <button type="button" onClick={handleResetForm} className="inline-flex items-center gap-2 rounded-2xl border border-border bg-background px-5 py-3 text-foreground">
                <Trash2 className="w-4 h-4" />
                Limpar dados do formulário
              </button>
            </div>
          </form>
        </div>

        <section className="mt-6 rounded-[28px] border border-red-200 bg-red-50/70 p-6">
          <div className="flex items-start gap-3">
            <div className="rounded-2xl bg-red-100 p-3">
              <ShieldAlert className="w-5 h-5 text-red-700" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl text-red-900">Zona de perigo</h2>
              <p className="mt-1 text-sm text-red-800/90">
                Ações destrutivas ficam concentradas aqui para evitar alterações acidentais.
              </p>

              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handleDeactivateAccount}
                  disabled={dangerBusy}
                  className="inline-flex items-center gap-2 rounded-2xl bg-red-600 px-5 py-3 text-white disabled:opacity-60"
                >
                  <ShieldAlert className="w-4 h-4" />
                  {dangerBusy ? 'Processando...' : 'Desativar conta da clínica'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!confirm('Isso vai apenas limpar os campos do formulário nesta tela. Continuar?')) return;
                    handleResetForm();
                  }}
                  className="inline-flex items-center gap-2 rounded-2xl border border-red-200 bg-card px-5 py-3 text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                  Limpar dados locais
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}





import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  Mail,
  MapPin,
  Phone,
  Save,
  ShieldAlert,
  Stethoscope,
  UserPlus,
} from 'lucide-react';
import { useSession } from '../context/SessionContext';
import { getApiBase, getAuthHeaders } from '../context/shared';
import { useAppNavigation } from '../navigation';

type ClinicLink = {
  id: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedBy: 'clinic' | 'veterinarian';
  veterinarianName: string;
  veterinarianEmail: string;
  veterinarianCrmv: string;
  veterinarianCrmvUf: string;
};

const days = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

function formatWorkingHours(open: string, close: string) {
  return { open, close };
}

export default function ClinicSettingsScreen() {
  const navigate = useNavigate();
  const { user, updateClinicProfile } = useSession();
  const { goToDashboard } = useAppNavigation();
  const [tradeName, setTradeName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [services, setServices] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [workingHours, setWorkingHours] = useState<Record<string, { open: string; close: string }>>({});
  const [links, setLinks] = useState<ClinicLink[]>([]);
  const [saving, setSaving] = useState(false);
  const API_BASE = getApiBase();

  useEffect(() => {
    setTradeName(user?.clinicName ?? '');
    setPhone(user?.phone ?? '');
    setAddress(user?.address ?? '');
    setCnpj(user?.cnpj ?? '');
    setServices(user?.services?.join(', ') ?? '');
    setWorkingHours((user?.workingHours as Record<string, { open: string; close: string }>) ?? {
      Seg: { open: '08:00', close: '18:00' },
      Ter: { open: '08:00', close: '18:00' },
      Qua: { open: '08:00', close: '18:00' },
      Qui: { open: '08:00', close: '18:00' },
      Sex: { open: '08:00', close: '18:00' },
      Sáb: { open: '08:00', close: '12:00' },
      Dom: { open: '', close: '' },
    });
  }, [user]);

  useEffect(() => {
    let cancelled = false;
    const loadLinks = async () => {
      const resp = await fetch(`${API_BASE}/api/clinic-links/me`, {
        headers: getAuthHeaders(),
      });
      if (!resp.ok) return;
      const { data } = await resp.json();
      if (!cancelled) setLinks((data ?? []) as ClinicLink[]);
    };
    void loadLinks();
    return () => {
      cancelled = true;
    };
  }, [API_BASE]);

  const approvedLinks = links.filter((link) => link.status === 'approved');
  const pendingLinks = links.filter((link) => link.status === 'pending');

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
      });
    } finally {
      setSaving(false);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    const resp = await fetch(`${API_BASE}/api/clinic-links/request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify({ veterinarianEmail: inviteEmail.trim().toLowerCase() }),
    });

    if (!resp.ok) {
      console.error(await resp.json());
      return;
    }

    const { data } = await resp.json();
    if (data) {
      setLinks((prev) => [data as ClinicLink, ...prev.filter((link) => link.id !== data.id)]);
    }
    setInviteEmail('');
  };

  const handleWorkingHoursChange = (day: string, field: 'open' | 'close', value: string) => {
    setWorkingHours((prev) => ({
      ...prev,
      [day]: formatWorkingHours(field === 'open' ? value : (prev[day]?.open ?? ''), field === 'close' ? value : (prev[day]?.close ?? '')),
    }));
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(17,24,39,0.04),_transparent_34%),linear-gradient(180deg,_#f8fafc_0%,_#ffffff_100%)]">
      <div className="max-w-6xl mx-auto px-6 py-6">
        <button onClick={() => goToDashboard('clinic')} className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-5 h-5" />
          Voltar
        </button>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="rounded-[28px] border border-border/60 bg-card p-8 shadow-lg">
            <div className="flex items-start gap-4 mb-8">
              <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Stethoscope className="w-7 h-7 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl text-foreground">Configurações da clínica</h1>
                <p className="text-muted-foreground">Dados básicos, serviços e horário de funcionamento.</p>
              </div>
            </div>

            <form onSubmit={handleSave} className="space-y-5">
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
              </div>

              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Clock3 className="w-4 h-4 text-primary" />
                  <h2 className="text-lg text-foreground">Horário de funcionamento</h2>
                </div>
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {days.map((day) => (
                    <div key={day} className="rounded-2xl border border-border bg-muted/30 p-4">
                      <p className="mb-3 text-sm text-foreground">{day}</p>
                      <div className="grid grid-cols-2 gap-2">
                        <input type="time" value={workingHours[day]?.open ?? ''} onChange={(e) => handleWorkingHoursChange(day, 'open', e.target.value)} className="rounded-xl border border-border bg-background px-3 py-2" />
                        <input type="time" value={workingHours[day]?.close ?? ''} onChange={(e) => handleWorkingHoursChange(day, 'close', e.target.value)} className="rounded-xl border border-border bg-background px-3 py-2" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-3 text-white">
                <Save className="w-4 h-4" />
                {saving ? 'Salvando...' : 'Salvar configurações'}
              </button>
            </form>
          </section>

          <aside className="space-y-6">
            <section className="rounded-[28px] border border-border/60 bg-card p-6 shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <UserPlus className="w-5 h-5 text-primary" />
                <h2 className="text-xl text-foreground">Adicionar veterinário</h2>
              </div>
              <form onSubmit={handleInvite} className="space-y-3">
                <input value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="email@vet.com" className="w-full rounded-2xl border border-border bg-input px-4 py-3" />
                <button className="w-full rounded-2xl bg-primary px-4 py-3 text-white">Convidar por e-mail</button>
              </form>
            </section>

            <section className="rounded-[28px] border border-border/60 bg-card p-6 shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <Mail className="w-5 h-5 text-primary" />
                <h2 className="text-xl text-foreground">Veterinários</h2>
              </div>
              <div className="space-y-3">
                {approvedLinks.map((link) => (
                  <div key={link.id} className="rounded-2xl border border-border bg-muted/30 p-4">
                    <p className="text-foreground">{link.veterinarianName}</p>
                    <p className="text-sm text-muted-foreground">CRMV {link.veterinarianCrmv}/{link.veterinarianCrmvUf}</p>
                  </div>
                ))}
                {pendingLinks.map((link) => (
                  <div key={link.id} className="rounded-2xl border border-dashed border-border bg-background p-4">
                    <p className="text-foreground">{link.veterinarianName}</p>
                    <p className="text-sm text-muted-foreground">Pendente de aprovação</p>
                  </div>
                ))}
                {links.length === 0 && <p className="text-sm text-muted-foreground">Nenhum veterinário vinculado.</p>}
              </div>
            </section>

            <section className="rounded-[28px] border border-amber-200 bg-amber-50 p-6">
              <div className="flex items-center gap-3 mb-3">
                <ShieldAlert className="w-5 h-5 text-amber-700" />
                <h2 className="text-xl text-amber-800">Agenda da clínica</h2>
              </div>
              <p className="text-sm text-amber-800/80">
                O painel principal da clínica passa a permitir o agendamento e a redistribuição por veterinário vinculado, respeitando o horário cadastrado aqui.
              </p>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}

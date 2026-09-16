import { useEffect, useState } from "react";
import { Calendar, ClipboardList, FileText, Home, Settings, Stethoscope, Syringe } from "lucide-react";
import type { Notification, Role, Tab } from "@/lib/types";
import { initialNotifications } from "@/lib/mock-data";
import { useToast } from "@/hooks/use-toast";
import { ToastContainer } from "@/components/common/ToastContainer";
import { WhatsAppButton } from "@/components/common/WhatsAppButton";
import { TopBar } from "@/components/layout/TopBar";
import { Sidebar } from "@/components/layout/Sidebar";
import { NavBar } from "@/components/layout/NavBar";
import { Layout } from "@/components/layout/Layout";
import { AuthScreen } from "@/screens/auth/AuthScreen";
import { TutorAgendamentos, TutorConfig, TutorDashboard, TutorExames, TutorProntuario, TutorVacinas } from "@/screens/tutor";
import { VetAgenda, VetConfig, VetDashboard } from "@/screens/vet";
import { ClinicAgenda, ClinicConfig, ClinicDashboard, ClinicVets } from "@/screens/clinic";

export default function App() {
  const [role, setRole] = useState<Role | null>(null);
  const [screen, setScreen] = useState("home");
  const [darkMode, setDarkMode] = useState(false);
  const { toasts, show: toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  const handleReadNotif = (id: string) => {
    setNotifications(p => p.map(n => n.id === id ? { ...n, read: true } : n));
  };
  const handleReadAllNotifs = () => {
    setNotifications(p => p.map(n => ({ ...n, read: true })));
    toast("Todas as notificações marcadas como lidas");
  };

  const tutorTabs: Tab[] = [
    { id: "home", label: "Início", icon: Home },
    { id: "prontuario", label: "Prontuário", icon: ClipboardList },
    { id: "vacinas", label: "Vacinas", icon: Syringe },
    { id: "exames", label: "Exames", icon: FileText },
    { id: "agendamentos", label: "Agenda", icon: Calendar },
    { id: "config", label: "Config.", icon: Settings },
  ];
  const vetTabs: Tab[] = [
    { id: "home", label: "Dashboard", icon: Home },
    { id: "agenda", label: "Agenda", icon: Calendar },
    { id: "config", label: "Config.", icon: Settings },
  ];
  const clinicTabs: Tab[] = [
    { id: "home", label: "Dashboard", icon: Home },
    { id: "vets", label: "Veterinários", icon: Stethoscope },
    { id: "agenda", label: "Agenda", icon: Calendar },
    { id: "config", label: "Config.", icon: Settings },
  ];

  const tabs = role === "tutor" ? tutorTabs : role === "vet" ? vetTabs : clinicTabs;
  const userName = role === "tutor" ? "Ana Souza" : role === "vet" ? "Dr. Lucas Ferreira" : "Clínica PetVida";
  const showWhatsApp = role === "vet" || role === "clinic";

  const handleOpenSettings = () => {
    setScreen("config");
    toast("Configurações abertas");
  };

  if (!role) {
    return (
      <>
        <AuthScreen onLogin={r => { setRole(r); setScreen("home"); }} toast={toast} />
        <ToastContainer toasts={toasts} />
      </>
    );
  }

  const renderScreen = () => {
    if (role === "tutor") {
      if (screen === "home") return <TutorDashboard onScreenChange={setScreen} />;
      if (screen === "prontuario") return <TutorProntuario />;
      if (screen === "vacinas") return <TutorVacinas />;
      if (screen === "exames") return <TutorExames toast={toast} />;
      if (screen === "agendamentos") return <TutorAgendamentos toast={toast} />;
      if (screen === "config") return <TutorConfig toast={toast} />;
    }
    if (role === "vet") {
      if (screen === "home") return <VetDashboard toast={toast} />;
      if (screen === "agenda") return <VetAgenda toast={toast} />;
      if (screen === "config") return <VetConfig toast={toast} />;
    }
    if (role === "clinic") {
      if (screen === "home") return <ClinicDashboard toast={toast} />;
      if (screen === "vets") return <ClinicVets toast={toast} />;
      if (screen === "agenda") return <ClinicAgenda toast={toast} />;
      if (screen === "config") return <ClinicConfig toast={toast} />;
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-background" style={{ fontFamily: "var(--font-sans, 'DM Sans', system-ui, sans-serif)" }}>
      <TopBar
        userName={userName}
        onLogout={() => { setRole(null); setScreen("home"); toast("Sessão encerrada.", "info"); }}
        darkMode={darkMode}
        onToggleDark={() => setDarkMode(p => !p)}
        onOpenSettings={handleOpenSettings}
        notifications={notifications}
        onReadNotif={handleReadNotif}
        onReadAllNotifs={handleReadAllNotifs}
      />
      <Sidebar tabs={tabs} active={screen} onChange={setScreen} />
      <NavBar tabs={tabs} active={screen} onChange={setScreen} />
      <Layout>{renderScreen()}</Layout>
      {showWhatsApp && <WhatsAppButton />}
      <ToastContainer toasts={toasts} />
    </div>
  );
}

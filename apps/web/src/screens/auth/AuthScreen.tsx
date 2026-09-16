import { useState } from "react";
import { Building2, Heart, Lock, Mail, Phone, Stethoscope, User } from "lucide-react";
import type { Role, ToastFn } from "@/lib/types";
import { Logo } from "@/components/common/Logo";
import { Card } from "@/components/common/Card";
import { InputField } from "@/components/common/InputField";
import { Button } from "@/components/common/Button";
import { ForgotPasswordModal } from "./ForgotPasswordModal";

export function AuthScreen({ onLogin, toast }: { onLogin: (role: Role) => void; toast: ToastFn }) {
  const [tab, setTab] = useState<"login" | "register">("login");
  const [role, setRole] = useState<Role>("tutor");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [showForgot, setShowForgot] = useState(false);

  const handleLogin = () => {
    if (!email || !password) { toast("Preencha todos os campos obrigatórios", "error"); return; }
    toast("Login realizado com sucesso!");
    onLogin(role);
  };
  const handleRegister = () => {
    if (!name || !email || !phone || !password) { toast("Preencha todos os campos obrigatórios", "error"); return; }
    toast("Conta criada! Verifique seu e-mail.");
    onLogin(role);
  };

  const roles = [
    { id: "tutor", label: "Tutor", icon: Heart },
    { id: "vet", label: "Veterinário", icon: Stethoscope },
    { id: "clinic", label: "Clínica", icon: Building2 },
  ] as const;

  return (
    <>
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4"><Logo size="lg" /></div>
            <p className="text-muted-foreground text-sm">Cuidado veterinário conectado</p>
          </div>

          <Card className="p-6">
            <div className="flex gap-2 mb-6">
              {roles.map(r => (
                <button
                  key={r.id}
                  onClick={() => setRole(r.id)}
                  className={`flex-1 flex flex-col items-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold border transition-all ${role === r.id ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/40"}`}
                >
                  <r.icon className="w-4 h-4" />
                  {r.label}
                </button>
              ))}
            </div>

            <div className="flex border-b border-border mb-5">
              {(["login", "register"] as const).map(t => (
                <button key={t} onClick={() => setTab(t)} className={`flex-1 py-2 text-sm font-semibold transition-colors ${tab === t ? "text-primary border-b-2 border-primary" : "text-muted-foreground"}`}>
                  {t === "login" ? "Entrar" : "Cadastrar"}
                </button>
              ))}
            </div>

            <div className="flex flex-col gap-4">
              {tab === "register" && (
                <>
                  <InputField label="Nome completo" placeholder="Ana Souza" value={name} onChange={setName} icon={User} required />
                  <InputField label="Telefone" placeholder="(11) 99999-9999" value={phone} onChange={setPhone} icon={Phone} required />
                </>
              )}
              <InputField label="E-mail" type="email" placeholder="ana@email.com" value={email} onChange={setEmail} icon={Mail} required />
              <InputField label="Senha" type="password" placeholder="••••••••" value={password} onChange={setPassword} icon={Lock} required />

              {tab === "login" && (
                <button onClick={() => setShowForgot(true)} className="text-xs text-primary text-right hover:underline">
                  Esqueci minha senha
                </button>
              )}

              <Button onClick={tab === "login" ? handleLogin : handleRegister} size="lg" className="w-full justify-center mt-1">
                {tab === "login" ? "Entrar" : "Criar conta"}
              </Button>
            </div>
          </Card>
        </div>
      </div>
      {showForgot && <ForgotPasswordModal onClose={() => setShowForgot(false)} toast={toast} />}
    </>
  );
}

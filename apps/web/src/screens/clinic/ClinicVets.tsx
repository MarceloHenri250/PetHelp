import { useState } from "react";
import { Mail, Stethoscope, Trash2 } from "lucide-react";
import type { ToastFn } from "@/lib/types";
import { Card } from "@/components/common/Card";
import { Badge } from "@/components/common/Badge";
import { SectionTitle } from "@/components/common/SectionTitle";
import { InputField } from "@/components/common/InputField";
import { Button } from "@/components/common/Button";
import { mockVets } from "@/lib/mock-data";

export function ClinicVets({ toast }: { toast: ToastFn }) {
  const [inviteEmail, setInviteEmail] = useState("");
  const handleInvite = () => {
    if (!inviteEmail.includes("@")) { toast("E-mail inválido", "error"); return; }
    toast(`Convite enviado para ${inviteEmail}!`);
    setInviteEmail("");
  };

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display font-bold text-2xl text-foreground">Gerenciar Veterinários</h1>
      <Card className="p-5">
        <p className="font-semibold text-foreground mb-3">Convidar novo veterinário</p>
        <div className="flex flex-col gap-3">
          <InputField label="E-mail do veterinário" type="email" placeholder="veterinario@email.com" value={inviteEmail} onChange={setInviteEmail} icon={Mail} required />
          <Button icon={Mail} onClick={handleInvite} className="self-start">Enviar convite</Button>
        </div>
      </Card>
      <div>
        <SectionTitle>Profissionais</SectionTitle>
        <div className="flex flex-col gap-3">
          {mockVets.map(v => (
            <Card key={v.name} className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Stethoscope className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-foreground">{v.name}</p>
                    <Badge color={v.status === "active" ? "success" : "muted"}>{v.status === "active" ? "Ativo" : "Pendente"}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{v.email}</p>
                  <p className="text-xs text-muted-foreground font-mono mt-0.5">{v.crmv} · {v.specialty}</p>
                </div>
                <button onClick={() => toast("Veterinário removido", "info")} className="text-muted-foreground hover:text-destructive transition-colors p-1">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

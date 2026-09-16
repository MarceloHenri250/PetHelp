import { useState } from "react";
import { Calendar, Check, ClipboardList, Copy, Shield, Star, Stethoscope } from "lucide-react";
import type { ToastFn } from "@/lib/types";
import { Card } from "@/components/common/Card";
import { Badge } from "@/components/common/Badge";
import { SectionTitle } from "@/components/common/SectionTitle";
import { mockVets } from "@/lib/mock-data";

export function ClinicDashboard({ toast }: { toast: ToastFn }) {
  const [copied, setCopied] = useState(false);
  const code = "CL-8X4F2K";

  const handleCopy = () => {
    setCopied(true);
    toast("Código copiado!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display font-bold text-2xl text-foreground">Dashboard da Clínica</h1>
        <p className="text-muted-foreground text-sm mt-1">Clínica PetVida · CNPJ 12.345.678/0001-90</p>
      </div>
      <Card className="p-5 bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-7 h-7 rounded-lg bg-primary/20 flex items-center justify-center">
            <Shield className="w-3.5 h-3.5 text-primary" />
          </div>
          <p className="font-display font-bold text-foreground">Código de conexão</p>
        </div>
        <p className="text-xs text-muted-foreground mb-3">
          Compartilhe este código com veterinários para que eles vinculem sua clínica à agenda deles e você possa gerenciar os horários de forma centralizada.
        </p>
        <div className="flex items-center gap-3">
          <div className="flex-1 bg-card rounded-xl border border-border px-4 py-3 font-mono font-bold text-2xl text-foreground tracking-widest text-center">
            {code}
          </div>
          <button
            onClick={handleCopy}
            className={`w-12 h-12 rounded-xl border flex items-center justify-center transition-all ${copied ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-300 text-emerald-600" : "bg-card border-border hover:border-primary/40 text-muted-foreground hover:text-primary"}`}
            aria-label="Copiar código"
          >
            {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
          </button>
        </div>
      </Card>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Veterinários", value: "3", icon: Stethoscope, color: "text-primary bg-primary/10" },
          { label: "Consultas hoje", value: "8", icon: Calendar, color: "text-accent bg-accent/15" },
          { label: "Esta semana", value: "34", icon: ClipboardList, color: "text-purple-600 bg-purple-50 dark:bg-purple-900/20" },
          { label: "Avaliação média", value: "4.8★", icon: Star, color: "text-amber-600 bg-amber-50 dark:bg-amber-900/20" },
        ].map(s => (
          <Card key={s.label} className="p-4">
            <div className={`w-9 h-9 rounded-xl ${s.color} flex items-center justify-center mb-2`}><s.icon className="w-4 h-4" /></div>
            <div className="text-2xl font-display font-bold text-foreground">{s.value}</div>
            <div className="text-xs text-muted-foreground">{s.label}</div>
          </Card>
        ))}
      </div>
      <div>
        <SectionTitle>Veterinários ativos hoje</SectionTitle>
        <div className="flex flex-col gap-2">
          {mockVets.filter(v => v.status === "active").map(v => (
            <Card key={v.name} className="p-3 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Stethoscope className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">{v.name}</p>
                <p className="text-xs text-muted-foreground">{v.crmv} · {v.specialty}</p>
              </div>
              <Badge color="success">Ativo</Badge>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

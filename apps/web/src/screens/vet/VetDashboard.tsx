import { useState } from "react";
import { CheckCircle, Clock, Plus, Shield, Unlock } from "lucide-react";
import type { ToastFn } from "@/lib/types";
import { Card } from "@/components/common/Card";
import { SectionTitle } from "@/components/common/SectionTitle";
import { Button } from "@/components/common/Button";
import { Switch } from "@/components/common/Switch";
import { mockConsultas, mockVetPatients } from "@/lib/mock-data";

export function VetDashboard({ toast }: { toast: ToastFn }) {
  const [urgency, setUrgency] = useState(false);
  const [agendaMode, setAgendaMode] = useState<"autonoma" | "clinica">("autonoma");
  const [vetPass, setVetPass] = useState("");
  const [passEntered, setPassEntered] = useState(false);

  const handleVetPass = () => {
    if (vetPass.length < 6) { toast("Código inválido", "error"); return; }
    setPassEntered(true);
    toast("Acesso liberado! Prontuário carregado.");
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="font-display font-bold text-2xl text-foreground">Dashboard Veterinário</h1>
          <p className="text-muted-foreground text-sm mt-1">Dr. Lucas Ferreira · CRMV-SP 12345</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <Switch checked={urgency} onChange={v => { setUrgency(v); toast(v ? "Urgência ativada!" : "Urgência desativada", v ? "success" : "info"); }} />
          <span className={`text-xs font-semibold ${urgency ? "text-destructive" : "text-muted-foreground"}`}>
            {urgency ? "🚨 Urgência ATIVA" : "Urgência inativa"}
          </span>
        </div>
      </div>

      <Card className="p-3">
        <p className="text-xs text-muted-foreground mb-2 font-semibold">Modo de agenda</p>
        <div className="flex gap-2">
          {(["autonoma", "clinica"] as const).map(m => (
            <button key={m} onClick={() => setAgendaMode(m)} className={`flex-1 py-2 rounded-xl text-sm font-semibold border transition-all ${agendaMode === m ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground"}`}>
              {m === "autonoma" ? "Autônoma" : "Clínica vinculada"}
            </button>
          ))}
        </div>
      </Card>

      <Card className="p-4 bg-primary/5 border-primary/20">
        <div className="flex items-center gap-2 mb-3">
          <Shield className="w-4 h-4 text-primary" />
          <p className="font-semibold text-foreground text-sm">Vet-Pass</p>
        </div>
        {!passEntered ? (
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Código do tutor"
              value={vetPass}
              onChange={e => setVetPass(e.target.value.toUpperCase())}
              className="flex-1 bg-input-background rounded-xl border border-border px-3 py-2.5 text-sm font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-ring"
              maxLength={8}
            />
            <Button onClick={handleVetPass} icon={Unlock}>Acessar</Button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 text-emerald-600 text-sm font-semibold">
              <CheckCircle className="w-4 h-4" />
              Prontuário de Bolinha (Tutor: Ana Souza)
            </div>
            {mockConsultas.map(c => (
              <div key={c.id} className="bg-card rounded-xl p-3 border border-border">
                <div className="flex justify-between">
                  <p className="text-sm font-semibold text-foreground">{c.diagnosis}</p>
                  <span className="text-xs font-mono text-muted-foreground">{c.date}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{c.treatment}</p>
              </div>
            ))}
            <Button variant="secondary" size="sm" icon={Plus}>Registrar nova consulta</Button>
            <Button variant="ghost" size="sm" onClick={() => { setPassEntered(false); setVetPass(""); }}>Encerrar sessão</Button>
          </div>
        )}
      </Card>

      <div>
        <SectionTitle>Agenda de hoje</SectionTitle>
        <div className="flex flex-col gap-3">
          {mockVetPatients.filter(p => p.date === "28/06/2025").map((p, i) => (
            <Card key={i} className="p-3 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Clock className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground text-sm">{p.name} <span className="text-muted-foreground font-normal">· {p.owner}</span></p>
                <p className="text-xs text-muted-foreground">{p.species} · {p.breed}</p>
              </div>
              <span className="font-mono text-sm text-foreground">{p.time}</span>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

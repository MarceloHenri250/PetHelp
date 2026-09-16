import { useState } from "react";
import { AlertTriangle, Building2, CheckCircle, Mail, MapPin, Phone, Shield, Trash2, X, Zap } from "lucide-react";
import type { ToastFn } from "@/lib/types";
import { Card } from "@/components/common/Card";
import { InputField } from "@/components/common/InputField";
import { Button } from "@/components/common/Button";
import { LanguageTab } from "@/components/common/LanguageTab";

export function ClinicConfig({ toast }: { toast: ToastFn }) {
  const [tab, setTab] = useState<"info" | "lang" | "services" | "danger">("info");
  const [services, setServices] = useState(["Consulta clínica", "Vacinação", "Cirurgia", "Internação", "Banho e tosa"]);
  const [newService, setNewService] = useState("");
  const [fantasia, setFantasia] = useState("Clínica PetVida");
  const [telefone, setTelefone] = useState("(11) 3456-7890");
  const [endereco, setEndereco] = useState("Rua das Palmeiras, 123 — São Paulo, SP");

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display font-bold text-2xl text-foreground">Configurações da Clínica</h1>
      <div className="flex gap-1 flex-wrap border-b border-border pb-0">
        {([["info", "Informações"], ["lang", "Idioma"], ["services", "Serviços"], ["danger", "Zona de Risco"]] as const).map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)} className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors -mb-px ${tab === id ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
            {label}
          </button>
        ))}
      </div>

      {tab === "info" && (
        <Card className="p-5 flex flex-col gap-4">
          <InputField label="Nome Fantasia" placeholder="Clínica PetVida" value={fantasia} onChange={setFantasia} icon={Building2} required />
          <InputField label="CNPJ" value="12.345.678/0001-90" icon={Shield} readOnly hint="O CNPJ não pode ser alterado após o cadastro." />
          <InputField label="E-mail institucional" type="email" value="contato@petvida.com.br" icon={Mail} readOnly hint="O e-mail não pode ser alterado. Entre em contato com o suporte se necessário." />
          <InputField label="Telefone" placeholder="(11) 3456-7890" value={telefone} onChange={setTelefone} icon={Phone} required />
          <InputField label="Endereço" placeholder="Rua, número, cidade, estado" value={endereco} onChange={setEndereco} icon={MapPin} required />
          <Button onClick={() => toast("Dados atualizados!")} className="self-start">Salvar alterações</Button>
        </Card>
      )}

      {tab === "lang" && <LanguageTab />}

      {tab === "services" && (
        <Card className="p-5 flex flex-col gap-4">
          <p className="font-semibold text-foreground">Catálogo de Serviços</p>
          <div className="flex flex-col gap-2">
            {services.map(s => (
              <div key={s} className="flex items-center gap-2 p-2.5 rounded-xl bg-muted">
                <CheckCircle className="w-4 h-4 text-primary shrink-0" />
                <span className="flex-1 text-sm text-foreground">{s}</span>
                <button onClick={() => setServices(p => p.filter(x => x !== s))} className="text-muted-foreground hover:text-destructive">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              className="flex-1 bg-input-background rounded-xl border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Novo serviço..."
              value={newService}
              onChange={e => setNewService(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && newService) { setServices(p => [...p, newService]); setNewService(""); } }}
            />
            <Button size="sm" variant="secondary" onClick={() => { if (newService) { setServices(p => [...p, newService]); setNewService(""); toast("Serviço adicionado!"); } }}>Adicionar</Button>
          </div>
        </Card>
      )}

      {tab === "danger" && (
        <Card className="p-5 border-destructive/50 bg-destructive/5 flex flex-col gap-4">
          <div className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="w-5 h-5" />
            <p className="font-display font-bold text-lg">Zona de Risco</p>
          </div>
          <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20">
            <p className="text-sm text-destructive font-semibold mb-1">⚠ Atenção</p>
            <p className="text-sm text-muted-foreground">Desativar a conta encerrará todos os vínculos com veterinários, cancelará consultas agendadas e tornará o perfil invisível para tutores.</p>
          </div>
          <Button variant="danger" icon={Zap} onClick={() => toast("Conta desativada. Entre em contato com o suporte para reativar.", "warning")}>
            Desativar conta da clínica
          </Button>
          <Button variant="danger" icon={Trash2} onClick={() => toast("Solicitação de exclusão enviada.", "info")}>
            Solicitar exclusão permanente
          </Button>
        </Card>
      )}
    </div>
  );
}

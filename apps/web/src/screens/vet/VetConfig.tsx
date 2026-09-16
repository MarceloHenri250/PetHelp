import { useState } from "react";
import { AlertTriangle, Building2, Mail, Tag, Trash2, User, X } from "lucide-react";
import type { ToastFn } from "@/lib/types";
import { Card } from "@/components/common/Card";
import { InputField } from "@/components/common/InputField";
import { Button } from "@/components/common/Button";
import { LanguageTab } from "@/components/common/LanguageTab";

export function VetConfig({ toast }: { toast: ToastFn }) {
  const [deleteWord, setDeleteWord] = useState("");
  const [tab, setTab] = useState<"profile" | "lang" | "clinics" | "danger">("profile");
  const [tags, setTags] = useState(["Clínica Geral", "Dermatologia"]);
  const [newTag, setNewTag] = useState("");
  const [vetName, setVetName] = useState("Dr. Lucas Ferreira");
  const [crmv, setCrmv] = useState("12345");
  const [uf, setUf] = useState("SP");
  const [bio, setBio] = useState("");

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display font-bold text-2xl text-foreground">Configurações</h1>
      <div className="flex gap-1 flex-wrap border-b border-border pb-0">
        {([["profile", "Perfil"], ["lang", "Idioma"], ["clinics", "Clínicas"], ["danger", "Zona de Perigo"]] as const).map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)} className={`px-3 py-2 text-sm font-semibold border-b-2 transition-colors -mb-px ${tab === id ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
            {label}
          </button>
        ))}
      </div>

      {tab === "profile" && (
        <Card className="p-5 flex flex-col gap-4">
          <InputField label="Nome completo" placeholder="Dr. Lucas Ferreira" value={vetName} onChange={setVetName} icon={User} required />
          <InputField label="E-mail" type="email" value="lucas.ferreira@email.com" icon={Mail} readOnly hint="O e-mail não pode ser alterado. Entre em contato com o suporte se necessário." />
          <div className="grid sm:grid-cols-2 gap-4">
            <InputField label="CRMV" placeholder="12345" value={crmv} onChange={setCrmv} required />
            <InputField label="UF" placeholder="SP" value={uf} onChange={setUf} required />
          </div>
          <div>
            <label className="text-sm font-semibold text-foreground block mb-1.5">
              Especialidades<span className="text-destructive ml-0.5">*</span>
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map(t => (
                <span key={t} className="flex items-center gap-1 bg-primary/10 text-primary rounded-lg px-2.5 py-1 text-xs font-semibold">
                  <Tag className="w-3 h-3" />{t}
                  <button onClick={() => setTags(p => p.filter(x => x !== t))} className="ml-0.5 hover:text-destructive"><X className="w-3 h-3" /></button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                className="flex-1 bg-input-background rounded-xl border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Adicionar especialidade..."
                value={newTag}
                onChange={e => setNewTag(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && newTag) { setTags(p => [...p, newTag]); setNewTag(""); } }}
              />
              <Button size="sm" variant="secondary" onClick={() => { if (newTag) { setTags(p => [...p, newTag]); setNewTag(""); } }}>Adicionar</Button>
            </div>
          </div>
          <div>
            <label className="text-sm font-semibold text-foreground block mb-1.5">Biografia</label>
            <textarea
              className="w-full bg-input-background rounded-xl border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              rows={3}
              placeholder="Especialista em clínica médica com 10 anos de experiência..."
              value={bio}
              onChange={e => setBio(e.target.value)}
            />
          </div>
          <Button onClick={() => toast("Perfil atualizado!")} className="self-start">Salvar alterações</Button>
        </Card>
      )}

      {tab === "lang" && <LanguageTab />}

      {tab === "clinics" && (
        <Card className="p-5 flex flex-col gap-4">
          <p className="text-sm font-semibold text-foreground">Clínicas vinculadas</p>
          {[{ name: "Clínica PetVida", cnpj: "12.345.678/0001-90" }, { name: "Hospital Pet Center", cnpj: "98.765.432/0001-10" }].map(c => (
            <div key={c.name} className="flex items-center gap-3 p-3 rounded-xl border border-border">
              <Building2 className="w-4 h-4 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">{c.name}</p>
                <p className="text-xs text-muted-foreground font-mono">{c.cnpj}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => toast("Solicitação de desvínculo enviada", "info")}>Desvincular</Button>
            </div>
          ))}
        </Card>
      )}

      {tab === "danger" && (
        <Card className="p-5 border-destructive/30 bg-destructive/5 flex flex-col gap-4">
          <div className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="w-5 h-5" />
            <p className="font-display font-bold">Zona de Perigo</p>
          </div>
          <p className="text-sm text-muted-foreground">Todos os seus dados, histórico e agenda serão permanentemente excluídos.</p>
          <InputField label='Digite "EXCLUIR" para confirmar' placeholder="EXCLUIR" value={deleteWord} onChange={setDeleteWord} icon={Trash2} required />
          <Button variant="danger" disabled={deleteWord !== "EXCLUIR"} onClick={() => toast("Conta excluída.", "info")} icon={Trash2}>
            Excluir conta permanentemente
          </Button>
        </Card>
      )}
    </div>
  );
}

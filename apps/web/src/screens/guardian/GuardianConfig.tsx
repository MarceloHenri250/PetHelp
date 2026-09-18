import { useState } from "react";
import { AlertTriangle, Mail, Phone, Trash2, User } from "lucide-react";
import type { ToastFn } from "@/lib/types";
import { Card } from "@/components/common/Card";
import { InputField } from "@/components/common/InputField";
import { Button } from "@/components/common/Button";
import { LanguageTab } from "@/components/common/LanguageTab";

export function TutorConfig({ toast }: { toast: ToastFn }) {
  const [deleteWord, setDeleteWord] = useState("");
  const [tab, setTab] = useState<"profile" | "lang" | "danger">("profile");
  const [name, setName] = useState("Ana Souza");
  const [phone, setPhone] = useState("(11) 98765-4321");

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display font-bold text-2xl text-foreground">Configurações</h1>
      <div className="flex gap-2 border-b border-border pb-0">
        {([["profile", "Perfil"], ["lang", "Idioma"], ["danger", "Zona de Perigo"]] as const).map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)} className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors -mb-px ${tab === id ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
            {label}
          </button>
        ))}
      </div>

      {tab === "profile" && (
        <Card className="p-5 flex flex-col gap-4">
          <InputField label="Nome completo" placeholder="Ana Souza" value={name} onChange={setName} icon={User} required />
          <InputField label="E-mail" type="email" value="ana.souza@email.com" icon={Mail} readOnly hint="O e-mail não pode ser alterado. Entre em contato com o suporte se necessário." />
          <InputField label="Telefone" placeholder="(11) 99999-9999" value={phone} onChange={setPhone} icon={Phone} required />
          <Button onClick={() => toast("Perfil atualizado!")} className="self-start">Salvar alterações</Button>
        </Card>
      )}

      {tab === "lang" && <LanguageTab />}

      {tab === "danger" && (
        <Card className="p-5 border-destructive/30 bg-destructive/5 flex flex-col gap-4">
          <div className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="w-5 h-5" />
            <p className="font-display font-bold">Zona de Perigo</p>
          </div>
          <p className="text-sm text-muted-foreground">Esta ação é <strong>permanente e irreversível</strong>. Todos os dados dos seus pets serão removidos.</p>
          <InputField label='Digite "EXCLUIR" para confirmar' placeholder="EXCLUIR" value={deleteWord} onChange={setDeleteWord} icon={Trash2} required />
          <Button variant="danger" disabled={deleteWord !== "EXCLUIR"} onClick={() => toast("Conta excluída. Até logo!", "info")} icon={Trash2}>
            Excluir minha conta permanentemente
          </Button>
        </Card>
      )}
    </div>
  );
}

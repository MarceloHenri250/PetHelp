import { useState } from "react";
import { Lock, Mail, X } from "lucide-react";
import type { ToastFn } from "@/lib/types";
import { Card } from "@/components/common/Card";
import { InputField } from "@/components/common/InputField";
import { Button } from "@/components/common/Button";

export function ForgotPasswordModal({ onClose, toast }: { onClose: () => void; toast: ToastFn }) {
  const [step, setStep] = useState<"email" | "code" | "newpw">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");

  const handleSend = () => {
    if (!email.includes("@")) { toast("E-mail inválido", "error"); return; }
    toast("Código enviado para seu e-mail!");
    setStep("code");
  };
  const handleVerify = () => {
    if (code.length < 6) { toast("Código inválido", "error"); return; }
    setStep("newpw");
  };
  const handleReset = () => {
    if (!newPw || newPw.length < 8) { toast("A senha deve ter pelo menos 8 caracteres", "error"); return; }
    if (newPw !== confirmPw) { toast("As senhas não coincidem", "error"); return; }
    toast("Senha redefinida com sucesso!");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[160] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <Card className="relative w-full max-w-sm p-6 z-10">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="font-display font-bold text-foreground">Recuperar senha</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {step === "email" && "Informe seu e-mail cadastrado"}
              {step === "code" && "Digite o código recebido"}
              {step === "newpw" && "Crie uma nova senha"}
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Progress dots */}
        <div className="flex gap-1.5 mb-5">
          {(["email", "code", "newpw"] as const).map((s, i) => (
            <div key={s} className={`h-1.5 flex-1 rounded-full transition-colors ${
              s === step ? "bg-primary" :
              (step === "code" && i === 0) || step === "newpw" ? "bg-primary/40" : "bg-muted"
            }`} />
          ))}
        </div>

        <div className="flex flex-col gap-4">
          {step === "email" && (
            <>
              <InputField label="E-mail cadastrado" type="email" placeholder="seu@email.com" value={email} onChange={setEmail} icon={Mail} required />
              <Button onClick={handleSend} className="w-full justify-center">Enviar código</Button>
            </>
          )}
          {step === "code" && (
            <>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-foreground">Código de verificação<span className="text-destructive ml-0.5">*</span></label>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="• • • • • •"
                  value={code}
                  onChange={e => setCode(e.target.value.replace(/\D/g, ""))}
                  className="bg-input-background rounded-xl border border-border px-3 py-3 text-center font-mono text-xl tracking-[0.5em] focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <p className="text-xs text-muted-foreground text-center">Código enviado para <strong>{email}</strong></p>
              </div>
              <Button onClick={handleVerify} className="w-full justify-center">Verificar código</Button>
              <button onClick={() => toast("Novo código enviado!")} className="text-xs text-primary hover:underline text-center">Reenviar código</button>
            </>
          )}
          {step === "newpw" && (
            <>
              <InputField label="Nova senha" type="password" placeholder="Mínimo 8 caracteres" value={newPw} onChange={setNewPw} icon={Lock} required hint="Use letras, números e símbolos para uma senha forte." />
              <InputField label="Confirmar nova senha" type="password" placeholder="Repita a senha" value={confirmPw} onChange={setConfirmPw} icon={Lock} required />
              <Button onClick={handleReset} className="w-full justify-center">Redefinir senha</Button>
            </>
          )}
        </div>
      </Card>
    </div>
  );
}

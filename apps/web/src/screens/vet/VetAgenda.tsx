import { useState } from "react";
import { Lock, Plus, X } from "lucide-react";
import type { ToastFn } from "@/lib/types";
import { Card } from "@/components/common/Card";
import { InputField } from "@/components/common/InputField";
import { Button } from "@/components/common/Button";
import { mockVetPatients } from "@/lib/mock-data";

export function VetAgenda({ toast }: { toast: ToastFn }) {
  const [showAdd, setShowAdd] = useState(false);
  const days = ["Seg 23/06", "Ter 24/06", "Qua 25/06", "Qui 26/06", "Sex 27/06", "Sáb 28/06"];
  const times = ["08:00", "09:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00"];
  const blocked = ["09:00-Qua 25/06", "14:00-Sex 27/06"];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display font-bold text-2xl text-foreground">Agenda</h1>
        <Button icon={Plus} onClick={() => setShowAdd(true)}>Novo horário</Button>
      </div>
      {showAdd && (
        <Card className="p-5 border-primary/20 bg-primary/5">
          <div className="flex items-center justify-between mb-4">
            <p className="font-semibold text-foreground">Adicionar horário</p>
            <button onClick={() => setShowAdd(false)} className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <InputField label="Data" type="date" required />
            <InputField label="Hora" type="time" required />
            <InputField label="Tipo de atendimento" placeholder="Consulta, Retorno..." required />
            <InputField label="Duração (min)" placeholder="30" />
          </div>
          <div className="flex gap-2 mt-4">
            <Button onClick={() => { setShowAdd(false); toast("Horário adicionado!"); }}>Salvar</Button>
            <Button variant="ghost" onClick={() => setShowAdd(false)}>Cancelar</Button>
          </div>
        </Card>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-xs min-w-[480px]">
          <thead>
            <tr>
              <th className="w-16 text-left py-2 text-muted-foreground font-mono pr-3">Hora</th>
              {days.map(d => <th key={d} className="text-center py-2 font-semibold text-foreground px-1">{d}</th>)}
            </tr>
          </thead>
          <tbody>
            {times.map(time => (
              <tr key={time} className="border-t border-border">
                <td className="py-2 text-muted-foreground font-mono pr-3">{time}</td>
                {days.map(day => {
                  const key = `${time}-${day}`;
                  const isBlocked = blocked.includes(key);
                  const hasPatient = mockVetPatients.some(p => p.time === time && day === "Sáb 28/06");
                  return (
                    <td key={day} className="px-1 py-1.5">
                      {hasPatient ? (
                        <div className="bg-primary/15 border border-primary/30 rounded-lg px-2 py-1 text-primary font-semibold text-center cursor-pointer hover:bg-primary/25">Bolinha</div>
                      ) : isBlocked ? (
                        <div className="bg-muted border border-border rounded-lg px-2 py-1 text-muted-foreground text-center" title="Bloqueado"><Lock className="w-3 h-3 mx-auto" /></div>
                      ) : (
                        <button onClick={() => toast("Horário selecionado")} className="w-full h-7 rounded-lg border border-dashed border-border hover:border-primary/40 hover:bg-primary/5 transition-colors" />
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

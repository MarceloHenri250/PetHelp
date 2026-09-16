import { useState } from "react";
import { Calendar, Edit3, Plus, Trash2 } from "lucide-react";
import type { ToastFn } from "@/lib/types";
import { Card } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { mockVets } from "@/lib/mock-data";

export function ClinicAgenda({ toast }: { toast: ToastFn }) {
  const [selectedVet, setSelectedVet] = useState(mockVets[0].name);
  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display font-bold text-2xl text-foreground">Agenda da Clínica</h1>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {mockVets.filter(v => v.status === "active").map(v => (
          <button key={v.name} onClick={() => setSelectedVet(v.name)} className={`shrink-0 px-3 py-2 rounded-xl border text-sm font-medium transition-all ${selectedVet === v.name ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/40"}`}>
            {v.name.split(" ").slice(0, 2).join(" ")}
          </button>
        ))}
      </div>
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <p className="font-semibold text-foreground">{selectedVet}</p>
          <Button size="sm" icon={Plus} onClick={() => toast("Horário adicionado!")}>Adicionar horário</Button>
        </div>
        <div className="flex flex-col gap-2">
          {[
            { day: "Segunda e Quarta", time: "08:00 – 12:00", slots: 4 },
            { day: "Terça e Quinta", time: "14:00 – 18:00", slots: 4 },
            { day: "Sábado", time: "08:00 – 12:00", slots: 3 },
          ].map(s => (
            <div key={s.day} className="flex items-center gap-3 p-3 rounded-xl bg-muted">
              <Calendar className="w-4 h-4 text-muted-foreground shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">{s.day}</p>
                <p className="text-xs text-muted-foreground">{s.time} · {s.slots} vagas</p>
              </div>
              <div className="flex gap-1">
                <button className="p-1.5 rounded-lg hover:bg-background text-muted-foreground hover:text-foreground transition-colors"><Edit3 className="w-3.5 h-3.5" /></button>
                <button onClick={() => toast("Horário removido", "info")} className="p-1.5 rounded-lg hover:bg-background text-muted-foreground hover:text-destructive transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

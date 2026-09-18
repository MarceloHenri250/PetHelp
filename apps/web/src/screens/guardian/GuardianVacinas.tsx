import { Syringe } from "lucide-react";
import { Card } from "@/components/common/Card";
import { Badge } from "@/components/common/Badge";
import { mockVaccines } from "@/lib/mock-data";

export function TutorVacinas() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display font-bold text-2xl text-foreground">Carteira de Vacinação</h1>
      <div className="grid sm:grid-cols-2 gap-3">
        {mockVaccines.map(v => (
          <Card key={v.name} className={`p-4 ${v.status === "overdue" ? "border-destructive/30 bg-destructive/5" : ""}`}>
            <div className="flex items-start gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${v.status === "ok" ? "bg-emerald-50 dark:bg-emerald-900/20" : "bg-destructive/10"}`}>
                <Syringe className={`w-4 h-4 ${v.status === "ok" ? "text-emerald-600" : "text-destructive"}`} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-semibold text-foreground text-sm">{v.name}</p>
                  <Badge color={v.status === "ok" ? "success" : "danger"}>{v.status === "ok" ? "Em dia" : "Vencida"}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">Aplicada: <span className="font-mono">{v.date}</span></p>
                <p className="text-xs text-muted-foreground">Reforço: <span className="font-mono font-semibold">{v.nextDue}</span></p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

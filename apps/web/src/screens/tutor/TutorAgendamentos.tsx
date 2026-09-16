import { useState } from "react";
import { CheckCircle } from "lucide-react";
import type { ToastFn } from "@/lib/types";
import { Card } from "@/components/common/Card";
import { Badge } from "@/components/common/Badge";
import { StarRating } from "@/components/common/StarRating";
import { Button } from "@/components/common/Button";
import { mockAgendamentos } from "@/lib/mock-data";

export function TutorAgendamentos({ toast }: { toast: ToastFn }) {
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [comments, setComments] = useState<Record<string, string>>({});
  const [reviewed, setReviewed] = useState<Record<string, boolean>>({});

  const handleReview = (id: string) => {
    if (!ratings[id]) { toast("Selecione uma avaliação de 1 a 5 estrelas", "error"); return; }
    setReviewed(p => ({ ...p, [id]: true }));
    toast("Avaliação enviada! Obrigado.");
  };

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display font-bold text-2xl text-foreground">Agendamentos</h1>
      <div className="flex flex-col gap-4">
        {mockAgendamentos.map(a => (
          <Card key={a.id} className="p-4">
            <div className="flex items-start justify-between gap-2 mb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-semibold text-foreground">{a.type}</p>
                  <Badge color={a.date > "25/06/2025" ? "primary" : "success"}>
                    {a.date > "25/06/2025" ? "Agendado" : "Realizado"}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{a.vet} · {a.clinic}</p>
                <p className="text-sm text-muted-foreground">{a.pet}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="font-mono text-sm font-semibold text-foreground">{a.date}</p>
                <p className="font-mono text-xs text-muted-foreground">{a.time}</p>
              </div>
            </div>
            {a.date <= "25/06/2025" && !reviewed[a.id] && (
              <div className="border-t border-border pt-3">
                <p className="text-sm font-semibold text-foreground mb-2">Avaliar atendimento</p>
                <StarRating value={ratings[a.id] || 0} onChange={v => setRatings(p => ({ ...p, [a.id]: v }))} />
                <textarea
                  className="w-full mt-2 bg-input-background rounded-xl border border-border px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                  rows={2}
                  placeholder="Conte como foi a consulta..."
                  value={comments[a.id] || ""}
                  onChange={e => setComments(p => ({ ...p, [a.id]: e.target.value }))}
                />
                <Button size="sm" className="mt-2" onClick={() => handleReview(a.id)}>Enviar avaliação</Button>
              </div>
            )}
            {reviewed[a.id] && (
              <div className="border-t border-border pt-3 flex items-center gap-2 text-sm text-emerald-600">
                <CheckCircle className="w-4 h-4" />
                Avaliação enviada — obrigado!
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}

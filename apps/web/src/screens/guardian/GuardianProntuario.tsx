import { useState } from "react";
import { Card } from "@/components/common/Card";
import { mockConsultas, mockPets } from "@/lib/mock-data";

export function TutorProntuario() {
  const [selectedPet, setSelectedPet] = useState(mockPets[0]);
  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display font-bold text-2xl text-foreground">Prontuário</h1>
      <div className="flex gap-2">
        {mockPets.map(p => (
          <button key={p.id} onClick={() => setSelectedPet(p)} className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-medium transition-all ${selectedPet.id === p.id ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/40"}`}>
            <div className="w-6 h-6 rounded-full overflow-hidden bg-muted">
              <img src={`https://images.unsplash.com/${p.photo}?w=48&h=48&fit=crop&auto=format`} alt={p.name} className="w-full h-full object-cover" />
            </div>
            {p.name}
          </button>
        ))}
      </div>
      <div className="flex flex-col gap-4">
        {mockConsultas.map((c, i) => (
          <Card key={c.id} className="p-4">
            <div className="flex items-start gap-3">
              <div className="flex flex-col items-center">
                <div className="w-2 h-2 rounded-full bg-primary mt-1" />
                {i < mockConsultas.length - 1 && <div className="w-0.5 h-16 bg-border mt-1" />}
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-foreground">{c.diagnosis}</p>
                    <p className="text-sm text-muted-foreground">{c.vet} · {c.clinic}</p>
                  </div>
                  <span className="text-xs text-muted-foreground font-mono shrink-0">{c.date}</span>
                </div>
                <div className="mt-2 p-2.5 bg-muted rounded-xl">
                  <p className="text-xs text-muted-foreground font-semibold mb-0.5">Tratamento</p>
                  <p className="text-sm text-foreground">{c.treatment}</p>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

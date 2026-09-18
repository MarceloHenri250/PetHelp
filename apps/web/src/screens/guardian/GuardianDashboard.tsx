import { Calendar, ChevronRight, ClipboardList, FileText, PawPrint, Plus, Stethoscope, Syringe } from "lucide-react";
import { Card } from "@/components/common/Card";
import { Badge } from "@/components/common/Badge";
import { SectionTitle } from "@/components/common/SectionTitle";
import { Button } from "@/components/common/Button";
import { mockAgendamentos, mockPets } from "@/lib/mock-data";

export function TutorDashboard({ onScreenChange }: { onScreenChange: (s: string) => void }) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display font-bold text-2xl text-foreground">Meus Pets</h1>
        <p className="text-muted-foreground text-sm mt-1">Gerencie a saúde dos seus companheiros</p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Pets", value: "2", icon: PawPrint, color: "text-primary bg-primary/10" },
          { label: "Consultas", value: "8", icon: Stethoscope, color: "text-accent bg-accent/15" },
          { label: "Vacinas", value: "4", icon: Syringe, color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20" },
          { label: "Exames", value: "3", icon: FileText, color: "text-purple-600 bg-purple-50 dark:bg-purple-900/20" },
        ].map(s => (
          <Card key={s.label} className="p-4">
            <div className={`w-9 h-9 rounded-xl ${s.color} flex items-center justify-center mb-2`}><s.icon className="w-4 h-4" /></div>
            <div className="text-2xl font-display font-bold text-foreground">{s.value}</div>
            <div className="text-xs text-muted-foreground">{s.label}</div>
          </Card>
        ))}
      </div>
      <div>
        <SectionTitle action={<Button variant="primary" size="sm" icon={Plus}>Adicionar pet</Button>}>
          Seus pets
        </SectionTitle>
        <div className="grid sm:grid-cols-2 gap-4">
          {mockPets.map(pet => (
            <Card key={pet.id} className="p-4 hover:border-primary/40 transition-colors cursor-pointer" onClick={() => onScreenChange("prontuario")}>
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 rounded-2xl overflow-hidden bg-muted shrink-0">
                  <img src={`https://images.unsplash.com/${pet.photo}?w=128&h=128&fit=crop&auto=format`} alt={pet.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-display font-bold text-foreground">{pet.name}</h3>
                    <Badge color="primary">{pet.species}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{pet.breed}</p>
                  <div className="flex gap-3 mt-1">
                    <span className="text-xs text-muted-foreground">{pet.age} anos</span>
                    <span className="text-xs text-muted-foreground">{pet.weight}</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="mt-3 flex gap-2">
                <Button variant="ghost" size="sm" icon={ClipboardList} onClick={(e) => { e?.stopPropagation(); onScreenChange("prontuario"); }}>Prontuário</Button>
                <Button variant="ghost" size="sm" icon={Syringe} onClick={(e) => { e?.stopPropagation(); onScreenChange("vacinas"); }}>Vacinas</Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
      <div>
        <SectionTitle>Próxima consulta</SectionTitle>
        <Card className="p-4 bg-primary/5 border-primary/20">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
              <Calendar className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-foreground">{mockAgendamentos[0].type}</p>
              <p className="text-sm text-muted-foreground">{mockAgendamentos[0].vet} · {mockAgendamentos[0].clinic}</p>
              <p className="text-sm font-semibold text-primary mt-1">{mockAgendamentos[0].date} às {mockAgendamentos[0].time}</p>
            </div>
            <Badge color="success">Confirmado</Badge>
          </div>
        </Card>
      </div>
    </div>
  );
}

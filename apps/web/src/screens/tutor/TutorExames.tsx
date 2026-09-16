import { FileText, Upload } from "lucide-react";
import type { ToastFn } from "@/lib/types";
import { Card } from "@/components/common/Card";
import { Badge } from "@/components/common/Badge";
import { Button } from "@/components/common/Button";
import { mockExams } from "@/lib/mock-data";

export function TutorExames({ toast }: { toast: ToastFn }) {
  const handleUpload = () => toast("Exame enviado com sucesso!");
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display font-bold text-2xl text-foreground">Exames</h1>
        <Button icon={Upload} onClick={handleUpload}>Enviar exame</Button>
      </div>
      <Card className="p-6 border-dashed border-2 flex flex-col items-center gap-3 cursor-pointer hover:border-primary/60 transition-colors" onClick={handleUpload}>
        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
          <Upload className="w-5 h-5 text-primary" />
        </div>
        <div className="text-center">
          <p className="font-semibold text-foreground">Arraste o arquivo ou clique para selecionar</p>
          <p className="text-sm text-muted-foreground">PDF, JPG, PNG — até 20MB</p>
        </div>
      </Card>
      <div className="flex flex-col gap-3">
        {mockExams.map(e => (
          <Card key={e.id} className="p-4 flex items-center gap-3 hover:border-primary/40 transition-colors">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${e.type === "PDF" ? "bg-red-50 dark:bg-red-900/20" : "bg-blue-50 dark:bg-blue-900/20"}`}>
              <FileText className={`w-4 h-4 ${e.type === "PDF" ? "text-red-600" : "text-blue-600"}`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-foreground text-sm truncate">{e.name}</p>
              <p className="text-xs text-muted-foreground">{e.pet} · {e.date}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge color="muted">{e.type}</Badge>
              <Button variant="ghost" size="sm">Ver</Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

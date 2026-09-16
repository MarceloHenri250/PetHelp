import { BookOpen } from "lucide-react";
import { Card } from "./Card";
import { Badge } from "./Badge";

export function LanguageTab() {
  const languages = [
    { code: "pt-BR", name: "Português (Brasil)", flag: "🇧🇷", active: true },
    { code: "en-US", name: "English (US)", flag: "🇺🇸", active: false },
    { code: "es-ES", name: "Español", flag: "🇪🇸", active: false },
    { code: "fr-FR", name: "Français", flag: "🇫🇷", active: false },
  ];
  return (
    <Card className="p-5 flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <BookOpen className="w-5 h-5 text-muted-foreground" />
        <div>
          <p className="font-semibold text-foreground">Idioma do aplicativo</p>
          <p className="text-xs text-muted-foreground">Somente Português (Brasil) está disponível no momento</p>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        {languages.map(l => (
          <div
            key={l.code}
            className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${l.active ? "border-primary bg-primary/5" : "border-border opacity-50 cursor-not-allowed"}`}
          >
            <span className="text-xl">{l.flag}</span>
            <div className="flex-1">
              <p className={`text-sm font-medium ${l.active ? "text-foreground" : "text-muted-foreground"}`}>{l.name}</p>
            </div>
            {l.active ? (
              <Badge color="success">Ativo</Badge>
            ) : (
              <Badge color="muted">Em breve</Badge>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}

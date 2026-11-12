import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, ChevronDown, ChevronUp, Copy, Wand2, Send, TrendingUp } from "lucide-react";
import { demoFitZoneAiOps } from "@/lib/demo-data";

export const Route = createFileRoute("/demo/aigrowth")({ component: AIGrowth, head: () => ({ meta: [{"title": "AI Growth · Demo | Gym Spotter"}, {"name": "description", "content": "AI Growth — Gym Spotter, gestão de academias."}, {"property": "og:title", "content": "AI Growth · Demo | Gym Spotter"}, {"property": "og:description", "content": "AI Growth — Gym Spotter, gestão de academias."}, {"property": "og:type", "content": "website"}, {"name": "twitter:card", "content": "summary"}] }) });

const severityClass = (color: string) => ({
  red:    "bg-destructive/15 text-destructive border-destructive/30",
  amber:  "bg-warning/15 text-warning border-warning/30",
  orange: "bg-primary/15 text-primary border-primary/30",
  purple: "bg-chart-5/15 text-chart-5 border-chart-5/30",
  blue:   "bg-info/15 text-info border-info/30",
}[color] ?? "bg-muted text-muted-foreground");

function AIGrowth() {
  const [open, setOpen] = useState<string | null>(demoFitZoneAiOps[0].id);

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-black tracking-normal text-foreground">AI Growth Engine</h1>
            <Badge className="bg-gradient-to-r from-primary to-primary text-foreground border-0 font-bold">BETA</Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">IA que detecta queda de frequência, vencimentos e oportunidades de receita.</p>
        </div>
      </div>

      {/* Receita potencial */}
      <Card className="border-0 bg-gradient-to-br from-background via-background to-background text-foreground overflow-hidden">
        <CardContent className="p-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary to-primary flex items-center justify-center">
                <TrendingUp className="h-7 w-7 text-foreground" />
              </div>
              <div>
                <div className="text-xs uppercase tracking-widest text-primary font-bold">RECEITA POTENCIAL</div>
                <h3 className="text-3xl font-black">R$ 14.200 recuperáveis</h3>
                <p className="text-sm text-foreground/60 mt-1">Distribuídos em 5 oportunidades. Execute em 1 clique.</p>
              </div>
            </div>
            <Button className="bg-gradient-to-r from-primary to-primary text-foreground border-0 hover:opacity-90 h-11 px-6 font-bold">
              <Send className="h-4 w-4 mr-2" /> Executar todas
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Oportunidades */}
      <div className="space-y-3">
        {demoFitZoneAiOps.map(op => {
          const isOpen = open === op.id;
          return (
            <Card key={op.id} className="border-border shadow-sm overflow-hidden">
              <button onClick={() => setOpen(isOpen ? null : op.id)} className="w-full text-left">
                <CardContent className="p-5 flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary/10 to-primary/10 flex items-center justify-center">
                    <Sparkles className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-foreground">{op.title}</h3>
                      <Badge className={`${severityClass(op.color)} border font-bold text-[10px]`}>{op.severity}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{op.descricao}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-success">{op.impacto}</div>
                    <div className="text-xs text-muted-foreground">{op.targets.length} alunos</div>
                  </div>
                  {isOpen ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                </CardContent>
              </button>

              {isOpen && (
                <div className="border-t border-border bg-muted/50 p-5 space-y-4">
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Alunos identificados</div>
                    <div className="space-y-1.5">
                      {op.targets.map((t, i) => (
                        <div key={i} className="flex items-center justify-between bg-card rounded-lg px-3 py-2 border border-border">
                          <div>
                            <div className="font-semibold text-sm text-muted-foreground">{t.name}</div>
                            <div className="text-xs text-muted-foreground">{t.phone} · {t.info}</div>
                          </div>
                          {t.valor > 0 && <Badge variant="outline" className="border-success/30 text-success">R$ {t.valor.toFixed(2)}</Badge>}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Mensagem WhatsApp pronta</div>
                    <div className="bg-success/15 border border-success/30 rounded-lg p-3 text-sm text-muted-foreground italic">
                      "{op.template}"
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" variant="outline" className="border-border"><Copy className="h-3.5 w-3.5 mr-1.5" /> Copiar</Button>
                    <Button size="sm" variant="outline" className="border-border"><Wand2 className="h-3.5 w-3.5 mr-1.5" /> Gerar com IA</Button>
                    <Button size="sm" className="bg-gradient-to-r from-primary to-primary text-foreground border-0 hover:opacity-90">
                      <Send className="h-3.5 w-3.5 mr-1.5" /> Disparar para {op.targets.length} alunos
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}

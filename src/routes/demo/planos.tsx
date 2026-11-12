import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Check, Users, Crown } from "lucide-react";
import { demoFitZonePlans } from "@/lib/demo-data";

export const Route = createFileRoute("/demo/planos")({ component: Planos, head: () => ({ meta: [{"title": "Planos · Demo | Gym Spotter"}, {"name": "description", "content": "Planos — Gym Spotter, gestão de academias."}, {"property": "og:title", "content": "Planos · Demo | Gym Spotter"}, {"property": "og:description", "content": "Planos — Gym Spotter, gestão de academias."}, {"property": "og:type", "content": "website"}, {"name": "twitter:card", "content": "summary"}] }) });

const fmtBRL = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

function Planos() {
  const totalAlunos = demoFitZonePlans.reduce((s, p) => s + p.alunos, 0);
  const mrr = demoFitZonePlans.reduce((s, p) => s + (p.alunos * (p.duration === "Anual" ? p.price/12 : p.duration === "Trimestral" ? p.price/3 : p.duration === "Semestral" ? p.price/6 : p.price)), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-black tracking-normal text-foreground">Planos</h1>
          <p className="text-sm text-muted-foreground mt-1">{demoFitZonePlans.length} planos ativos · {totalAlunos} alunos vinculados · MRR {fmtBRL(mrr)}</p>
        </div>
        <Button className="bg-gradient-to-r from-primary to-primary text-foreground border-0 hover:opacity-90 h-10 px-5 font-bold"><Plus className="h-4 w-4 mr-1.5" /> Novo plano</Button>
      </div>

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {demoFitZonePlans.map(p => (
          <Card key={p.id} className={`border-border shadow-sm hover:shadow-md transition relative overflow-hidden ${p.featured ? "ring-2 ring-primary ring-offset-2" : ""}`}>
            {p.featured && <div className="absolute top-0 right-0 bg-gradient-to-r from-primary to-primary text-foreground text-[10px] font-bold px-3 py-1 rounded-bl-lg flex items-center gap-1"><Crown className="h-3 w-3" />DESTAQUE</div>}
            <CardContent className="p-6">
              <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{p.duration}</div>
              <h3 className="text-xl font-black text-foreground mt-1">{p.name}</h3>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="text-4xl font-black bg-gradient-to-r from-primary to-primary bg-clip-text text-transparent">{fmtBRL(p.price)}</span>
              </div>
              <ul className="mt-5 space-y-2">
                {p.features.map(f => <li key={f} className="flex items-start gap-2 text-sm"><Check className="h-4 w-4 text-success mt-0.5" /><span className="text-muted-foreground">{f}</span></li>)}
              </ul>
              <div className="mt-5 pt-4 border-t border-border flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground"><Users className="h-4 w-4" /><span className="font-bold text-muted-foreground">{p.alunos}</span> alunos</div>
                <Badge className="bg-success/15 text-success border-0">Ativo</Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts";
import { Crown } from "lucide-react";
import { demoFitZoneMrrEvolution, demoFitZonePlans, demoFitZoneTopProfessores, demoFitZoneTopModalidades, demoFitZoneKpis as K } from "@/lib/demo-data";

export const Route = createFileRoute("/demo/relatorios")({ component: Rel, head: () => ({ meta: [{"title": "Relatórios · Demo | Gym Spotter"}, {"name": "description", "content": "Relatórios — Gym Spotter, gestão de academias."}, {"property": "og:title", "content": "Relatórios · Demo | Gym Spotter"}, {"property": "og:description", "content": "Relatórios — Gym Spotter, gestão de academias."}, {"property": "og:type", "content": "website"}, {"name": "twitter:card", "content": "summary"}] }) });

const fmtBRL = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0 });

function Rel() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black tracking-normal text-foreground">Relatórios</h1>
        <p className="text-sm text-muted-foreground mt-1">Visão estratégica — MRR, Churn, Retenção, Ranking equipe</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard label="MRR atual" value={fmtBRL(K.mrr)} sub="+12% MoM" tone="emerald" />
        <MetricCard label="Churn rate" value={`${(K.churnRate*100).toFixed(0)}%`} sub="-1% trim. ant." tone="rose" />
        <MetricCard label="Retenção" value={`${(K.taxaRetencao*100).toFixed(0)}%`} sub="Top 5% setor" tone="orange" />
        <MetricCard label="Ticket médio" value={fmtBRL(K.ticketMedio)} sub="Plano + extras" tone="violet" />
      </div>

      <Card className="border-border shadow-sm"><CardContent className="p-6">
        <h3 className="font-bold text-foreground mb-4">Evolução MRR · 12 meses</h3>
        <div className="h-72">
          <ResponsiveContainer>
            <LineChart data={demoFitZoneMrrEvolution}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
              <XAxis dataKey="mes" stroke="#71717a" fontSize={11} />
              <YAxis stroke="#71717a" fontSize={11} tickFormatter={v=>`${v/1000}k`} />
              <Tooltip formatter={(v: number) => fmtBRL(v)} contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb" }} />
              <Line type="monotone" dataKey="mrr" stroke="var(--primary)" strokeWidth={3} dot={{ fill: "var(--primary)", r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent></Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border shadow-sm"><CardContent className="p-6">
          <h3 className="font-bold text-foreground mb-4">Receita por plano</h3>
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={demoFitZonePlans.map(p => ({ name: p.name.split(" ")[0], receita: p.alunos * p.price / (p.duration === "Anual" ? 12 : p.duration === "Trimestral" ? 3 : p.duration === "Semestral" ? 6 : 1) }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis dataKey="name" stroke="#71717a" fontSize={11} />
                <YAxis stroke="#71717a" fontSize={11} tickFormatter={v=>`${(v/1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: number) => fmtBRL(v)} contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb" }} />
                <Bar dataKey="receita" fill="var(--primary)" radius={[6,6,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent></Card>

        <Card className="border-border shadow-sm"><CardContent className="p-6">
          <h3 className="font-bold text-foreground mb-4">Top modalidades · check-ins mês</h3>
          <div className="space-y-2">
            {demoFitZoneTopModalidades.map(m => (
              <div key={m.modalidade}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-muted-foreground">{m.modalidade}</span>
                  <span className="text-muted-foreground">{m.checkins} <span className="text-muted-foreground">({m.pct}%)</span></span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-primary to-primary" style={{ width: `${m.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </CardContent></Card>
      </div>

      <Card className="border-border shadow-sm"><CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-foreground flex items-center gap-2"><Crown className="h-4 w-4 text-warning" /> Ranking professores · abril</h3>
          <Badge className="bg-muted text-muted-foreground border-0">comissão sobre alunos vinculados</Badge>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs uppercase tracking-wider text-muted-foreground text-left border-b border-border">
              <th className="py-2.5">#</th><th className="py-2.5">Professor</th><th className="py-2.5">Alunos</th><th className="py-2.5">Check-ins mês</th><th className="py-2.5 text-right">Comissão</th>
            </tr>
          </thead>
          <tbody>
            {demoFitZoneTopProfessores.map((p, i) => (
              <tr key={p.name} className="border-b border-border hover:bg-muted/50">
                <td className="py-3 font-bold text-muted-foreground">{i+1}º</td>
                <td className="py-3 font-bold text-muted-foreground">{p.name}</td>
                <td className="py-3 text-muted-foreground">{p.alunos}</td>
                <td className="py-3 text-muted-foreground">{p.checkins_mes}</td>
                <td className="py-3 text-right font-bold text-success">{fmtBRL(p.comissao)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent></Card>
    </div>
  );
}

function MetricCard({ label, value, sub, tone }: { label: string; value: string; sub: string; tone: "emerald"|"rose"|"orange"|"violet" }) {
  const tx = { emerald: "text-success", rose: "text-destructive", orange: "text-primary", violet: "text-chart-5" }[tone];
  return (
    <Card className="border-border shadow-sm"><CardContent className="p-5">
      <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={`text-3xl font-black mt-1 ${tx}`}>{value}</div>
      <div className="text-xs text-muted-foreground mt-1">{sub}</div>
    </CardContent></Card>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, TrendingDown, Wallet, AlertCircle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid, Legend } from "recharts";
import { demoFitZoneKpis as K, demoFitZoneReceitaVsDespesa6m, demoFitZoneFinanceiro } from "@/lib/demo-data";

export const Route = createFileRoute("/demo/financeiro")({ component: Fin, head: () => ({ meta: [{"title": "Financeiro · Demo | Gym Spotter"}, {"name": "description", "content": "Financeiro — Gym Spotter, gestão de academias."}, {"property": "og:title", "content": "Financeiro · Demo | Gym Spotter"}, {"property": "og:description", "content": "Financeiro — Gym Spotter, gestão de academias."}, {"property": "og:type", "content": "website"}, {"name": "twitter:card", "content": "summary"}] }) });

const fmtBRL = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0 });
const stBadge = (s: string) => ({
  pago: "bg-success/15 text-success border-success/30",
  pendente: "bg-warning/15 text-warning border-warning/30",
  atrasado: "bg-destructive/15 text-destructive border-destructive/30",
}[s] ?? "");

function Fin() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black tracking-normal text-foreground">Financeiro</h1>
        <p className="text-sm text-muted-foreground mt-1">Visão consolidada do mês corrente · Abril/2026</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <FinCard color="from-success to-success" icon={TrendingUp}   label="Receitas Mês"   value={fmtBRL(K.receitaMes)}     delta="+8.2% vs Fev" />
        <FinCard color="from-info to-info"       icon={Wallet}       label="A Receber"      value={fmtBRL(K.aReceber)}       delta="11 mensalidades" />
        <FinCard color="from-destructive to-destructive"         icon={AlertCircle}  label="Inadimplência"  value={fmtBRL(K.inadimplencia)}  delta={`${(K.inadimplenciaRate*100).toFixed(0)}% da base`} />
        <FinCard color="from-primary to-primary"     icon={TrendingDown} label="Lucro Mês"      value={fmtBRL(K.lucroMes)}       delta={`Despesas ${fmtBRL(K.despesasMes)}`} />
      </div>

      <Card className="border-border shadow-sm">
        <CardContent className="p-6">
          <h3 className="font-bold text-foreground mb-4">Receitas vs Despesas · últimos 6 meses</h3>
          <div className="h-80">
            <ResponsiveContainer>
              <BarChart data={demoFitZoneReceitaVsDespesa6m}>
                <defs>
                  <linearGradient id="grR" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--primary)" /><stop offset="100%" stopColor="var(--chart-2)" /></linearGradient>
                  <linearGradient id="grD" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#3B82F6" /><stop offset="100%" stopColor="#60A5FA" /></linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis dataKey="mes" stroke="#71717a" fontSize={11} />
                <YAxis stroke="#71717a" fontSize={11} tickFormatter={v=>`${v/1000}k`} />
                <Tooltip formatter={(v: number) => fmtBRL(v)} contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb" }} />
                <Legend />
                <Bar dataKey="receita" name="Receita" fill="url(#grR)" radius={[6,6,0,0]} />
                <Bar dataKey="despesa" name="Despesa" fill="url(#grD)" radius={[6,6,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border shadow-sm">
        <CardContent className="p-6">
          <Tabs defaultValue="receitas">
            <TabsList>
              <TabsTrigger value="receitas">Receitas ({demoFitZoneFinanceiro.receitas.length})</TabsTrigger>
              <TabsTrigger value="despesas">Despesas ({demoFitZoneFinanceiro.despesas.length})</TabsTrigger>
            </TabsList>
            <TabsContent value="receitas" className="mt-4">
              <Table rows={demoFitZoneFinanceiro.receitas.map(r => ({ desc: r.desc, cat: r.cat, valor: r.valor, data: r.data, status: r.status }))} />
            </TabsContent>
            <TabsContent value="despesas" className="mt-4">
              <Table rows={demoFitZoneFinanceiro.despesas.map(d => ({ desc: d.desc, cat: d.cat, valor: d.valor, data: d.data, status: d.status }))} negative />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

function FinCard({ color, icon: Icon, label, value, delta }: { color: string; icon: typeof Wallet; label: string; value: string; delta: string }) {
  return (
    <Card className="border-border shadow-sm"><CardContent className="p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{label}</span>
        <div className={`h-8 w-8 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center`}><Icon className="h-4 w-4 text-foreground" /></div>
      </div>
      <div className="text-2xl font-black text-muted-foreground">{value}</div>
      <div className="text-xs text-muted-foreground mt-1">{delta}</div>
    </CardContent></Card>
  );
}

function Table({ rows, negative }: { rows: { desc:string; cat:string; valor:number; data:string; status:string }[]; negative?: boolean }) {
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="text-xs uppercase tracking-wider text-muted-foreground text-left border-b border-border">
          <th className="py-2.5">Descrição</th><th className="py-2.5">Categoria</th><th className="py-2.5">Data</th><th className="py-2.5">Status</th><th className="py-2.5 text-right">Valor</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i} className="border-b border-border hover:bg-muted/50">
            <td className="py-2.5 font-medium text-muted-foreground">{r.desc}</td>
            <td className="py-2.5"><Badge variant="outline" className="border-border text-muted-foreground">{r.cat}</Badge></td>
            <td className="py-2.5 text-muted-foreground">{r.data}</td>
            <td className="py-2.5"><Badge className={`${stBadge(r.status)} border text-[10px]`}>{r.status}</Badge></td>
            <td className={`py-2.5 text-right font-bold ${negative ? "text-destructive" : "text-success"}`}>{negative && "−"}R$ {r.valor.toFixed(2)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

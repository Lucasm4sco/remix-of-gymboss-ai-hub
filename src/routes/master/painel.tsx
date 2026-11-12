import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/page-header";
import { KpiCard } from "@/components/kpi-card";
import { Building2, TrendingUp, Activity, Clock, AlertTriangle, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { demoMasterAcademies } from "@/lib/demo-data";
import { fmtBRL } from "@/lib/format";

export const Route = createFileRoute("/master/painel")({ component: Painel, head: () => ({ meta: [{"title": "Painel Master · Master | Gym Spotter"}, {"name": "description", "content": "Painel Master — Gym Spotter, gestão de academias."}, {"property": "og:title", "content": "Painel Master · Master | Gym Spotter"}, {"property": "og:description", "content": "Painel Master — Gym Spotter, gestão de academias."}, {"property": "og:type", "content": "website"}, {"name": "twitter:card", "content": "summary"}] }) });

function Painel() {
  const { data } = useQuery({
    queryKey: ["master-painel"],
    queryFn: async () => {
      const { data: academies } = await supabase.from("academy").select("id, status, valor_mensal, trial_ate, ultimo_acesso");
      const list = academies ?? [];
      const ativas = list.filter((a) => a.status === "active");
      const trial = list.filter((a) => a.status === "trial");
      const inadimplentes = list.filter((a) => a.status === "blocked");
      const mrr = ativas.reduce((s, a) => s + Number(a.valor_mensal ?? 0), 0);
      return { total: list.length, ativas: ativas.length, trial: trial.length, inadimplentes: inadimplentes.length, mrr };
    },
  });
  // Fallback / showcase usando demoMasterAcademies para visualizar a plataforma
  const showcase = demoMasterAcademies;
  const showcaseMrr = showcase.reduce((s, a) => s + a.mrr, 0);
  const showcaseAlunos = showcase.reduce((s, a) => s + a.alunos, 0);
  return (
    <div>
      <PageHeader title="Painel Master" description="Visão consolidada de todas as academias." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <KpiCard label="MRR (real)" value={fmtBRL(data?.mrr ?? 0)} icon={TrendingUp} hint={`+ showcase ${fmtBRL(showcaseMrr)}`} />
        <KpiCard label="Academias ativas" value={String(data?.ativas ?? 0)} icon={Activity} />
        <KpiCard label="Total de academias" value={String(data?.total ?? 0)} icon={Building2} />
        <KpiCard label="Em trial" value={String(data?.trial ?? 0)} icon={Clock} />
        <KpiCard label="Inadimplentes" value={String(data?.inadimplentes ?? 0)} icon={AlertTriangle} />
        <KpiCard label="Alunos na plataforma" value={String(showcaseAlunos)} icon={Users} hint="Showcase + reais" />
      </div>

      <h2 className="text-lg font-semibold mt-8 mb-3">Academias na plataforma (showcase)</h2>
      <Card><CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Academia</TableHead>
              <TableHead>Cidade</TableHead>
              <TableHead>Plano</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Alunos</TableHead>
              <TableHead className="text-right">MRR</TableHead>
              <TableHead>Último acesso</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {showcase.map((a) => (
              <TableRow key={a.id}>
                <TableCell className="font-medium">{a.name}</TableCell>
                <TableCell className="text-muted-foreground">{a.cidade}</TableCell>
                <TableCell><Badge variant="outline">{a.plano}</Badge></TableCell>
                <TableCell>
                  <Badge
                    className={
                      a.status === "ativa" ? "bg-success/15 text-success hover:bg-success/15"
                      : a.status === "trial" ? "bg-warning/15 text-warning hover:bg-warning/15"
                      : "bg-destructive/15 text-destructive hover:bg-destructive/15"
                    }
                  >{a.status}</Badge>
                </TableCell>
                <TableCell className="text-right">{a.alunos}</TableCell>
                <TableCell className="text-right font-medium">{fmtBRL(a.mrr)}</TableCell>
                <TableCell className="text-muted-foreground text-sm">{a.ultimo_acesso}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent></Card>
    </div>
  );
}
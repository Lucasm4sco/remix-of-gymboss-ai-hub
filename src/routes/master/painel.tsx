import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/page-header";
import { KpiCard } from "@/components/kpi-card";
import { Building2, TrendingUp, Activity, Clock, AlertTriangle, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fmtBRL } from "@/lib/format";

export const Route = createFileRoute("/master/painel")({ component: Painel, head: () => ({ meta: [{"title": "Painel Master · Master | Gym Spotter"}, {"name": "description", "content": "Painel Master — Gym Spotter, gestão de academias."}, {"property": "og:title", "content": "Painel Master · Master | Gym Spotter"}, {"property": "og:description", "content": "Painel Master — Gym Spotter, gestão de academias."}, {"property": "og:type", "content": "website"}, {"name": "twitter:card", "content": "summary"}] }) });

function Painel() {
  const { data, error } = useQuery({
    queryKey: ["master-painel"],
    queryFn: async () => {
      const { data: academies, error } = await supabase.from("academy").select("id, status, valor_mensal, trial_ate, ultimo_acesso");
      if (error) throw new Error("Não foi possível carregar os indicadores.");
      const list = academies ?? [];
      const ativas = list.filter((a) => a.status === "active");
      const trial = list.filter((a) => a.status === "trial");
      const inadimplentes = list.filter((a) => a.status === "blocked");
      const mrr = ativas.reduce((s, a) => s + Number(a.valor_mensal ?? 0), 0);
      return { total: list.length, ativas: ativas.length, trial: trial.length, inadimplentes: inadimplentes.length, mrr };
    },
  });
  return (
    <div>
      <PageHeader title="Painel Master" description="Visão consolidada de todas as academias." />
      {error && <p role="alert" className="mb-4 text-sm text-destructive">Não foi possível carregar os indicadores. Tente novamente mais tarde.</p>}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <KpiCard label="MRR (real)" value={data && !error ? fmtBRL(data.mrr) : "—"} icon={TrendingUp} />
        <KpiCard label="Academias ativas" value={data && !error ? String(data.ativas) : "—"} icon={Activity} />
        <KpiCard label="Total de academias" value={data && !error ? String(data.total) : "—"} icon={Building2} />
        <KpiCard label="Em trial" value={data && !error ? String(data.trial) : "—"} icon={Clock} />
        <KpiCard label="Inadimplentes" value={data && !error ? String(data.inadimplentes) : "—"} icon={AlertTriangle} />
        <KpiCard label="Alunos na plataforma" value="—" icon={Users} hint="Indicador indisponível" />
      </div>

      <div className="mt-8">
        <Button asChild variant="outline"><Link to="/master/listaAcademias">Ver academias cadastradas</Link></Button>
      </div>
    </div>
  );
}
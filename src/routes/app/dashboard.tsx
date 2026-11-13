import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/lib/tenant-context";
import { PageHeader } from "@/components/page-header";
import { KpiCard } from "@/components/kpi-card";
import { Users, ScanLine, Wallet, AlertTriangle, TrendingUp, UserPlus, CalendarCheck, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { fmtBRL } from "@/lib/format";
import { format, subDays, startOfMonth } from "date-fns";
import { BookingLinkCard } from "@/components/booking-link-card";

export const Route = createFileRoute("/app/dashboard")({ component: Dashboard, head: () => ({ meta: [
  { title: "Dashboard · Academia | Gym Spotter" },
  { name: "description", content: "Indicadores e registros da sua academia no Gym Spotter." },
  { property: "og:title", content: "Dashboard · Academia | Gym Spotter" },
  { property: "og:description", content: "Indicadores e registros da sua academia no Gym Spotter." },
  { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
] }) });

function Dashboard() {
  const { tenant } = useTenant();
  const aid = tenant?.academyId;
  const today = format(new Date(), "yyyy-MM-dd");
  const weekAgo = format(subDays(new Date(), 7), "yyyy-MM-dd");
  const monthStart = format(startOfMonth(new Date()), "yyyy-MM-dd");

  const { data: loadedData, error } = useQuery({
    queryKey: ["dashboard", aid],
    enabled: !!aid,
    queryFn: async () => {
      if (!aid) throw new Error("Academia não selecionada.");
      const results = await Promise.all([
        supabase.from("student").select("id", { count: "exact", head: true }).eq("academy_id", aid).eq("status", "active"),
        supabase.from("checkin").select("id", { count: "exact", head: true }).eq("academy_id", aid).eq("date", today),
        supabase.from("checkin").select("id", { count: "exact", head: true }).eq("academy_id", aid).gte("date", weekAgo),
        supabase.from("financial").select("amount,type,status").eq("academy_id", aid).gte("date", monthStart),
        supabase.from("checkin").select("date").eq("academy_id", aid).gte("date", format(subDays(new Date(), 13), "yyyy-MM-dd")),
        supabase.from("checkin").select("time").eq("academy_id", aid).eq("date", today),
        supabase.from("student").select("plan_name").eq("academy_id", aid),
        supabase.from("student").select("id", { count: "exact", head: true }).eq("academy_id", aid).gte("created_at", monthStart),
        supabase.from("student").select("id", { count: "exact", head: true }).eq("academy_id", aid).eq("payment_status", "atrasado"),
      ]);
      if (results.some(result => result.error)) throw new Error("Não foi possível carregar os indicadores.");
      const [students, todays, weeks, financial, last14, byHour, plans, newStudents, overdue] = results;
      const receita = (financial.data ?? []).filter(f => f.type === "receita" && f.status === "pago").reduce((s, f) => s + Number(f.amount), 0);
      const byDay: Record<string, number> = {};
      for (let i = 13; i >= 0; i--) byDay[format(subDays(new Date(), i), "yyyy-MM-dd")] = 0;
      (last14.data ?? []).forEach((c) => { byDay[c.date] = (byDay[c.date] ?? 0) + 1; });
      const chart = Object.entries(byDay).map(([d, count]) => ({ date: format(new Date(d), "dd/MM"), count }));
      const hours: Record<string, number> = {};
      for (let h = 6; h <= 22; h++) hours[`${h}h`] = 0;
      (byHour.data ?? []).forEach((c) => { const h = `${parseInt(c.time.slice(0,2))}h`; if (hours[h] !== undefined) hours[h]++; });
      const hourChart = Object.entries(hours).map(([hour, count]) => ({ hour, count }));
      const planMap: Record<string, number> = {};
      (plans.data ?? []).forEach((s) => { planMap[s.plan_name ?? "Sem plano"] = (planMap[s.plan_name ?? "Sem plano"] ?? 0) + 1; });
      const planChart = Object.entries(planMap).map(([plan, count]) => ({ plan, count }));
      return {
        students: students.count ?? 0, todays: todays.count ?? 0, weeks: weeks.count ?? 0,
        receita, chart, hourChart, planChart,
        newStudents: newStudents.count ?? 0, overdue: overdue.count ?? 0,
      };
    },
  });

  const data = error ? undefined : loadedData;
  const { data: slugRow } = useQuery({
    queryKey: ["academy-slug", aid],
    enabled: !!aid,
    queryFn: async () => {
      if (!aid) return null;
      const { data } = await supabase.from("academy").select("slug").eq("id", aid).maybeSingle();
      return data;
    },
  });

  return (
    <div>
      <PageHeader title="Dashboard" description={`Bem-vindo${tenant?.academy?.name ? ` à ${tenant.academy.name}` : ""}.`} />
      {error && <p role="alert" className="mb-4 text-sm text-destructive">Não foi possível carregar os indicadores. Tente novamente mais tarde.</p>}
      {slugRow?.slug && <div className="mb-6"><BookingLinkCard slug={slugRow.slug} /></div>}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Check-ins hoje"        value={data?.todays ?? "—"}    icon={ScanLine} hint="Movimentação do dia" />
        <KpiCard label="Check-ins na semana"   value={data?.weeks ?? "—"}     icon={CalendarCheck} hint="Últimos 7 dias" />
        <KpiCard label="Alunos ativos"         value={data?.students ?? "—"}  icon={Users} />
        <KpiCard label="Novos cadastros (mês)" value={data?.newStudents ?? "—"} icon={UserPlus} />
        <KpiCard label="Faturamento (mês)"     value={data ? fmtBRL(data.receita) : "—"} icon={Wallet} hint="Recebido este mês" />
        <Card className={data?.overdue ? "border-destructive/40 bg-destructive/40" : ""}>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Mensalidades atrasadas</span>
              <AlertTriangle className={`h-4 w-4 ${data?.overdue ? "text-destructive" : "text-muted-foreground"}`} />
            </div>
            <div className={`mt-2 text-3xl font-bold ${data?.overdue ? "text-destructive" : ""}`}>{data?.overdue ?? "—"}</div>
            {!!data?.overdue && <div className="text-xs text-destructive mt-1">Cobrar inadimplentes</div>}
          </CardContent>
        </Card>
        <KpiCard label="Taxa ocupação aulas" value="—" icon={TrendingUp} hint="Indicador indisponível" />
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-primary">AI Alerts</span>
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <div className="mt-2 text-3xl font-bold text-primary">—</div>
            <div className="text-xs text-primary/80 mt-1">Indicador indisponível</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 mt-6 lg:grid-cols-2">
        <Card><CardContent className="p-5">
          <h3 className="font-semibold mb-4">Check-ins por hora (hoje)</h3>
          <div className="h-64"><ResponsiveContainer>
            <BarChart data={data?.hourChart ?? []}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} /><XAxis dataKey="hour" /><YAxis allowDecimals={false} /><Tooltip />
              <Bar dataKey="count" fill="var(--primary)" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer></div>
        </CardContent></Card>

        <Card><CardContent className="p-5">
          <h3 className="font-semibold mb-4">Alunos por plano</h3>
          <div className="h-64"><ResponsiveContainer>
            <BarChart data={data?.planChart ?? []}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} /><XAxis dataKey="plan" /><YAxis allowDecimals={false} /><Tooltip />
              <Bar dataKey="count" fill="var(--chart-2)" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer></div>
        </CardContent></Card>

        <Card className="lg:col-span-2"><CardContent className="p-5">
          <h3 className="font-semibold mb-4">Evolução de alunos (12 meses)</h3>
          <p className="py-8 text-sm text-muted-foreground">Histórico de evolução indisponível. Nenhum dado demonstrativo é exibido.</p>
        </CardContent></Card>
      </div>

      <div className="grid gap-6 mt-6 lg:grid-cols-3">
        <Card className="lg:col-span-2"><CardContent className="p-5">
          <h3 className="font-semibold mb-4">Aulas de hoje</h3>
          <p className="py-8 text-sm text-muted-foreground">Resumo de aulas indisponível. Consulte os horários cadastrados na Agenda.</p>
        </CardContent></Card>

        <Card className="border-primary/30"><CardContent className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-4 w-4 text-primary" />
            <h3 className="font-semibold">Alertas IA</h3>
          </div>
          <p className="text-sm text-muted-foreground">Análise de IA indisponível. Nenhuma oportunidade foi calculada com os dados da academia.</p>
        </CardContent></Card>
      </div>
    </div>
  );
}

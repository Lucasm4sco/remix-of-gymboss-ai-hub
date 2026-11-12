import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Dumbbell, Users, CheckCircle, Crown, DollarSign, Calendar, Brain, BarChart, UserCog, Settings,
  AlertCircle, Star, Check, ArrowRight, Sparkles, MessageCircle, Smartphone, Zap, Building2, TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export const Route = createFileRoute("/")({
  component: Landing,
  head: () => ({ meta: [
    { title: "Gym Spotter — IA pra academias que querem crescer" },
    { name: "description", content: "Pare de perder alunos. Gestão completa, check-in, financeiro, agenda e IA que reativa quem some — tudo numa só plataforma fitness." },
    { property: "og:title", content: "Gym Spotter — IA pra academias" },
    { property: "og:description", content: "Pare de perder alunos. Reative com inteligência." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ]}),
});

const modulos = [
  { icon: Users,        title: "Alunos",       desc: "Ficha completa, histórico, frequência e tags inteligentes." },
  { icon: CheckCircle,  title: "Check-ins",    desc: "Registro rápido via cartão, CPF ou QR. Fila em tempo real." },
  { icon: Crown,        title: "Planos",       desc: "Mensal, trimestral, anual ou sem fidelidade. Você define." },
  { icon: DollarSign,   title: "Financeiro",   desc: "Mensalidades, inadimplência, recibos automáticos." },
  { icon: Calendar,     title: "Agenda Aulas", desc: "Turmas em grupo, avaliação física e retornos." },
  { icon: Brain,        title: "AI Growth",    desc: "Reativa inativos, detecta queda de frequência, sugere ações." },
  { icon: BarChart,     title: "Relatórios",   desc: "MRR, churn, retenção por plano e por professor." },
  { icon: UserCog,      title: "Equipe",       desc: "Professores com especialidades e comissões automáticas." },
  { icon: Settings,     title: "Configurações",desc: "Branding, horários, integrações com catraca e PIX." },
];

const pains = [
  "Alunos somem e você nem percebe — só descobre quando não paga",
  "Inadimplência gerenciada em planilha (e quase ninguém cobra)",
  "Check-in com caderno — sem dados reais de frequência",
  "Sem visão de MRR, churn, ticket médio: você decide no escuro",
  "Equipe sem plataforma própria — tudo no WhatsApp pessoal",
  "Renovação manual de planos — você perde recorrência todo mês",
];

const steps = [
  { n: "01", t: "Cadastre sua academia",  d: "Branding, planos e horários em 5 minutos. Sem precisar de TI." },
  { n: "02", t: "Importe alunos",          d: "Migração gratuita da sua base atual (Excel, sistema antigo)." },
  { n: "03", t: "Check-in inteligente",    d: "Cartão, CPF ou QR. Fila em tempo real no balcão." },
  { n: "04", t: "IA recupera quem some",   d: "Detecta queda de frequência e gera mensagens prontas." },
];

const aiBullets = [
  { icon: TrendingUp, t: "Detecta queda de frequência" },
  { icon: Calendar,   t: "Avisa de planos vencendo" },
  { icon: Sparkles,   t: "Lembra de aniversariantes" },
  { icon: Users,      t: "Reativa inativos +30 dias" },
];

const insights = [
  { sev: "ALTA",    color: "bg-destructive",    title: "Rafael Souza sumiu há 49 dias",     sub: "Reativar em 24h: +R$ 149,90/mês" },
  { sev: "URGENTE", color: "bg-warning",  title: "12 planos vencendo essa semana",    sub: "R$ 4.600 em risco — renovar agora" },
  { sev: "ATENÇÃO",color: "bg-primary", title: "Carlos Mendes: -60% frequência",    sub: "Conversa preventiva evita churn" },
];

const testimonials = [
  { nome: "Marcelo Silva", acad: "FitZone",         txt: "Recuperamos R$ 12.400 em mensalidades de alunos inativos só no primeiro mês com a IA." },
  { nome: "Patricia Lima", acad: "Studio FIT",      txt: "Reduzi inadimplência em 70% só com os lembretes automáticos por WhatsApp. Fim do drama." },
  { nome: "Bruno Costa",   acad: "CrossFit Box",    txt: "Multi-unidade ficou simples. Tenho dashboard separado por academia e visão consolidada do MRR." },
];

const planos = [
  { name: "Starter",    price: 197, desc: "Para academias começando", features: ["Até 100 alunos","Check-in","Financeiro básico","Agenda simples","Suporte por email"] },
  { name: "Pro",        price: 397, desc: "Mais escolhido", featured: true, features: ["Até 500 alunos","AI Growth completo","Relatórios MRR/Churn","WhatsApp integrado","Multi-modalidade"] },
  { name: "Enterprise", price: 697, desc: "Rede de academias", features: ["Alunos ilimitados","Multi-unidade","API + integrações","Branding completo","Onboarding presencial"] },
];

const faq = [
  { q: "Preciso de cartão pra testar?", a: "Não. 14 dias grátis sem cartão, sem pegadinha. Você só paga se decidir continuar." },
  { q: "Funciona com catraca?", a: "Sim. Integramos com Topdata, Henry, Control iD, Linear e outras via webhook." },
  { q: "Tem app pro aluno?", a: "Sim. App do aluno pra check-in, ver plano, pagar via PIX e ver aulas disponíveis." },
  { q: "Quanto tempo leva a migração?", a: "30-60 minutos. Importamos seu Excel e nossa equipe valida tudo com você." },
  { q: "E se eu tiver mais de uma unidade?", a: "Plano Enterprise libera multi-unidade com painel consolidado e KPIs por academia." },
  { q: "Posso cancelar quando quiser?", a: "Sim. Sem fidelidade, sem multa. Cancele com 1 clique e exporte tudo." },
];

function Landing() {
  return (
    <div className="min-h-screen bg-card text-muted-foreground font-sans antialiased">
      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-muted/95 backdrop-blur border-b border-border/5">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary"><Dumbbell className="h-5 w-5 text-foreground" /></div>
            <span className="text-lg font-black text-foreground">Gym Spotter</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-foreground/70">
            <a href="#modulos" className="hover:text-foreground">Módulos</a>
            <a href="#como-funciona" className="hover:text-foreground">Como funciona</a>
            <a href="#pricing" className="hover:text-foreground">Planos</a>
            <Link to="/demo/dashboard" className="hover:text-foreground">Demo</Link>
          </nav>
          <div className="flex items-center gap-2">
            <Button asChild variant="outline" className="bg-transparent border-border/20 text-foreground hover:bg-card/10 hover:text-foreground"><Link to="/entrar">Entrar</Link></Button>
            <Button asChild className="bg-gradient-to-r from-primary to-primary text-foreground border-0 hover:opacity-90 font-bold"><Link to="/entrar">Começar grátis</Link></Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-muted text-foreground relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(249,115,22,0.25),transparent)]" />
        <div className="container mx-auto px-4 py-24 md:py-32 text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary/20 to-primary/20 border border-primary/30 text-primary px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-8">
            <Sparkles className="h-3.5 w-3.5" /> AI PARA ACADEMIAS QUE QUEREM CRESCER
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-normal text-foreground leading-[1.05]">
            Pare de perder alunos.<br />
            Reative com <span className="bg-gradient-to-r from-primary to-primary bg-clip-text text-transparent">inteligência</span>.
          </h1>
          <p className="mx-auto mt-7 max-w-2xl text-lg text-foreground/60">
            Gestão de alunos, check-ins, planos, financeiro e IA que recupera quem some —
            tudo num só sistema fitness.
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg" className="bg-gradient-to-r from-primary to-primary text-foreground border-0 hover:opacity-90 h-12 px-8 text-base font-bold"><Link to="/entrar">Começar grátis 14d <ArrowRight className="h-4 w-4 ml-1.5" /></Link></Button>
            <Button asChild size="lg" variant="outline" className="bg-transparent border-border/20 text-foreground hover:bg-card/10 hover:text-foreground h-12 px-8 text-base font-bold"><Link to="/demo/dashboard">Ver demonstração</Link></Button>
          </div>
          <p className="mt-5 text-xs text-foreground/40 font-medium">Sem cartão · Setup em 5min · Multi-unidade</p>
        </div>
      </section>

      {/* Stats banner */}
      <section className="bg-gradient-to-r from-primary to-primary text-foreground py-10">
        <div className="container mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { n: "+3.200", l: "academias" },
            { n: "480k",   l: "alunos ativos" },
            { n: "92%",    l: "retenção média" },
            { n: "4.8★",   l: "avaliação clientes" },
          ].map(s => (
            <div key={s.l}>
              <div className="text-4xl md:text-5xl font-black">{s.n}</div>
              <div className="text-sm font-semibold text-foreground/90 mt-1">{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Módulos */}
      <section id="modulos" className="container mx-auto px-4 py-24">
        <div className="text-center mb-14">
          <div className="text-xs font-black uppercase tracking-widest text-primary mb-2">9 MÓDULOS · 1 PLATAFORMA</div>
          <h2 className="text-4xl md:text-5xl font-black tracking-normal">Tudo que sua academia precisa</h2>
          <p className="text-muted-foreground mt-3 max-w-xl mx-auto">Sem gambiarra, sem planilha. Da entrada do aluno ao relatório de churn — num único lugar.</p>
        </div>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {modulos.map(m => (
            <Card key={m.title} className="border-border hover:border-primary/40 hover:shadow-lg transition group">
              <CardContent className="p-6">
                <div className="h-11 w-11 rounded-lg bg-gradient-to-br from-primary/10 to-primary/10 flex items-center justify-center mb-4 group-hover:from-primary group-hover:to-primary transition">
                  <m.icon className="h-5 w-5 text-primary group-hover:text-foreground transition" />
                </div>
                <h3 className="font-black text-lg">{m.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{m.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Pain points */}
      <section className="bg-muted py-24 border-y border-border">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <div className="text-xs font-black uppercase tracking-widest text-destructive mb-2">PROBLEMAS REAIS</div>
            <h2 className="text-4xl md:text-5xl font-black tracking-normal">Você já se viu nisso?</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
            {pains.map((p, i) => (
              <div key={i} className="flex gap-3 items-start p-5 rounded-xl border border-destructive/30 bg-card hover:bg-destructive/50 transition">
                <div className="h-9 w-9 rounded-lg bg-destructive/15 flex items-center justify-center shrink-0">
                  <AlertCircle className="h-5 w-5 text-destructive" />
                </div>
                <p className="text-sm font-semibold text-muted-foreground leading-relaxed">{p}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="como-funciona" className="container mx-auto px-4 py-24">
        <div className="text-center mb-14">
          <div className="text-xs font-black uppercase tracking-widest text-primary mb-2">DO ZERO AO PRIMEIRO CHECK-IN</div>
          <h2 className="text-4xl md:text-5xl font-black tracking-normal">Como funciona</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto">
          {steps.map(s => (
            <div key={s.n} className="relative">
              <div className="text-6xl font-black bg-gradient-to-br from-primary to-primary bg-clip-text text-transparent leading-none">{s.n}</div>
              <h3 className="font-black text-lg mt-3">{s.t}</h3>
              <p className="text-sm text-muted-foreground mt-1">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* AI Growth dark */}
      <section className="bg-muted text-foreground py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_50%,rgba(249,115,22,0.15),transparent)]" />
        <div className="container mx-auto px-4 relative z-10 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-primary text-foreground px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-5">
              <Brain className="h-3 w-3" /> AI GROWTH ENGINE
            </div>
            <h2 className="text-4xl md:text-5xl font-black tracking-normal text-foreground">IA que segura seu aluno</h2>
            <p className="text-foreground/60 mt-4 text-lg">A primeira IA brasileira treinada com 480 mil alunos de academia. Detecta padrões que o olho humano nunca pegaria.</p>
            <div className="grid grid-cols-2 gap-3 mt-8">
              {aiBullets.map(b => (
                <div key={b.t} className="flex items-center gap-2.5">
                  <div className="h-7 w-7 rounded-md bg-gradient-to-br from-primary to-primary flex items-center justify-center"><Check className="h-3.5 w-3.5 text-foreground" /></div>
                  <span className="text-sm font-semibold text-foreground/90">{b.t}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-3">
            {insights.map((ins, i) => (
              <div key={i} className="bg-card/5 border border-border/10 backdrop-blur rounded-xl p-4 flex items-start gap-3 hover:bg-card/10 transition">
                <div className={`${ins.color} text-foreground text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded shrink-0`}>{ins.sev}</div>
                <div className="flex-1">
                  <div className="font-bold text-foreground">{ins.title}</div>
                  <div className="text-xs text-foreground/60 mt-0.5">{ins.sub}</div>
                </div>
                <Sparkles className="h-4 w-4 text-primary shrink-0" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="container mx-auto px-4 py-24">
        <div className="text-center mb-14">
          <div className="text-xs font-black uppercase tracking-widest text-primary mb-2">RESULTADOS REAIS</div>
          <h2 className="text-4xl md:text-5xl font-black tracking-normal">O que falam de nós</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-3 max-w-6xl mx-auto">
          {testimonials.map(t => (
            <Card key={t.nome} className="border-border shadow-sm">
              <CardContent className="p-6">
                <div className="flex gap-0.5 mb-3">{Array.from({length:5}).map((_,i)=><Star key={i} className="h-4 w-4 fill-warning text-warning" />)}</div>
                <p className="text-muted-foreground leading-relaxed">"{t.txt}"</p>
                <div className="mt-5 pt-4 border-t border-border">
                  <div className="font-black text-sm">{t.nome}</div>
                  <div className="text-xs text-muted-foreground">{t.acad}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="bg-muted py-24 border-y border-border">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <div className="text-xs font-black uppercase tracking-widest text-primary mb-2">SEM PEGADINHA</div>
            <h2 className="text-4xl md:text-5xl font-black tracking-normal">Planos transparentes</h2>
            <p className="text-muted-foreground mt-3">14 dias grátis em qualquer plano. Sem cartão.</p>
          </div>
          <div className="grid gap-6 md:grid-cols-3 max-w-6xl mx-auto">
            {planos.map(p => (
              <Card key={p.name} className={`relative ${p.featured ? "border-0 shadow-2xl scale-105 bg-gradient-to-br from-background to-background text-foreground" : "border-border bg-card"}`}>
                {p.featured && <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-primary to-primary text-foreground text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">Mais escolhido</div>}
                <CardContent className="p-8">
                  <div className={`text-xs font-black uppercase tracking-widest ${p.featured ? "text-primary" : "text-primary"}`}>{p.desc}</div>
                  <h3 className={`text-2xl font-black mt-2 ${p.featured ? "text-foreground" : "text-muted-foreground"}`}>{p.name}</h3>
                  <div className="mt-5 flex items-baseline gap-1">
                    <span className={`text-5xl font-black ${p.featured ? "bg-gradient-to-r from-primary to-primary bg-clip-text text-transparent" : "text-muted-foreground"}`}>R$ {p.price}</span>
                    <span className={`${p.featured ? "text-foreground/60" : "text-muted-foreground"}`}>/mês</span>
                  </div>
                  <ul className="mt-6 space-y-3">
                    {p.features.map(f => (
                      <li key={f} className="flex items-start gap-2 text-sm">
                        <Check className={`h-4 w-4 mt-0.5 shrink-0 ${p.featured ? "text-primary" : "text-success"}`} />
                        <span className={p.featured ? "text-foreground/90" : "text-muted-foreground"}>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Button asChild className={`w-full mt-7 font-bold h-11 ${p.featured ? "bg-gradient-to-r from-primary to-primary text-foreground border-0 hover:opacity-90" : "bg-muted text-foreground hover:bg-muted"}`}>
                    <Link to="/entrar">Começar grátis</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="container mx-auto px-4 py-24 max-w-3xl">
        <div className="text-center mb-12">
          <div className="text-xs font-black uppercase tracking-widest text-primary mb-2">DÚVIDAS</div>
          <h2 className="text-4xl md:text-5xl font-black tracking-normal">Perguntas frequentes</h2>
        </div>
        <Accordion type="single" collapsible>
          {faq.map((f, i) => (
            <AccordionItem key={i} value={`f-${i}`} className="border-border">
              <AccordionTrigger className="text-left font-bold hover:no-underline text-muted-foreground">{f.q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      {/* Final CTA */}
      <section className="bg-gradient-to-br from-primary to-primary text-foreground py-20">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <Zap className="h-12 w-12 mx-auto text-foreground mb-4" />
          <h2 className="text-4xl md:text-5xl font-black tracking-normal text-foreground">Sua academia merece mais que planilha</h2>
          <p className="text-foreground/90 mt-3 text-lg">Comece grátis hoje. Em 14 dias você decide.</p>
          <div className="mt-7 flex justify-center gap-3 flex-wrap">
            <Button asChild size="lg" className="bg-card text-muted-foreground hover:bg-card/90 h-12 px-8 text-base font-black"><Link to="/entrar">Começar grátis agora <ArrowRight className="h-4 w-4 ml-1.5" /></Link></Button>
            <Button asChild size="lg" variant="outline" className="border-border text-foreground hover:bg-card/10 hover:text-foreground h-12 px-8 text-base font-bold"><Link to="/demo/dashboard">Ver demo primeiro</Link></Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted text-foreground/60 py-12 border-t border-border/5">
        <div className="container mx-auto px-4 grid gap-6 md:grid-cols-4 text-sm">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary"><Dumbbell className="h-4 w-4 text-foreground" /></div>
              <span className="text-foreground font-black">Gym Spotter</span>
            </div>
            <p className="text-xs">A plataforma que faz sua academia rodar como músculo treinado.</p>
          </div>
          <div>
            <div className="text-foreground font-bold mb-2 text-xs uppercase tracking-widest">Produto</div>
            <ul className="space-y-1.5 text-xs">
              <li><Link to="/demo/dashboard" className="hover:text-primary">Demo</Link></li>
              <li><a href="#modulos" className="hover:text-primary">Módulos</a></li>
              <li><a href="#pricing" className="hover:text-primary">Preços</a></li>
            </ul>
          </div>
          <div>
            <div className="text-foreground font-bold mb-2 text-xs uppercase tracking-widest">Empresa</div>
            <ul className="space-y-1.5 text-xs">
              <li><a href="#" className="hover:text-primary">Sobre</a></li>
              <li><a href="#" className="hover:text-primary">Blog</a></li>
              <li><a href="#" className="hover:text-primary">Contato</a></li>
            </ul>
          </div>
          <div>
            <div className="text-foreground font-bold mb-2 text-xs uppercase tracking-widest">Fale conosco</div>
            <a href="#" className="inline-flex items-center gap-2 text-xs hover:text-primary"><MessageCircle className="h-3.5 w-3.5" /> WhatsApp</a>
          </div>
        </div>
        <div className="container mx-auto px-4 mt-8 pt-6 border-t border-border/5 text-xs flex justify-between">
          <span>Gym Spotter © 2026 · Feito com 🧡 para academias brasileiras</span>
          <Link to="/entrar" className="hover:text-primary">Entrar</Link>
        </div>
      </footer>
    </div>
  );
}

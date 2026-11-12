import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScanLine, Search, Plus, CheckCircle2, Clock } from "lucide-react";
import { demoFitZoneCheckinsHoje, demoFitZoneStudents } from "@/lib/demo-data";

export const Route = createFileRoute("/demo/checkins")({ component: CheckIns, head: () => ({ meta: [{"title": "Check-ins · Demo | Gym Spotter"}, {"name": "description", "content": "Check-ins — Gym Spotter, gestão de academias."}, {"property": "og:title", "content": "Check-ins · Demo | Gym Spotter"}, {"property": "og:description", "content": "Check-ins — Gym Spotter, gestão de academias."}, {"property": "og:type", "content": "website"}, {"name": "twitter:card", "content": "summary"}] }) });

function CheckIns() {
  const [scanInput, setScanInput] = useState("");
  const selected = demoFitZoneStudents[0]; // Rafael Souza demo

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-black tracking-normal text-foreground">Check-ins</h1>
          <p className="text-sm text-muted-foreground mt-1">Registro em tempo real · sincroniza com catraca via webhook</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-xs text-muted-foreground uppercase tracking-wider">Hoje</div>
            <div className="text-3xl font-black bg-gradient-to-r from-primary to-primary bg-clip-text text-transparent">142</div>
          </div>
          <Button className="bg-gradient-to-r from-primary to-primary text-foreground border-0 hover:opacity-90 h-10 px-5 font-bold"><Plus className="h-4 w-4 mr-1.5" /> Novo check-in</Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Scan column */}
        <Card className="border-border shadow-sm lg:col-span-2">
          <CardContent className="p-6 space-y-5">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Identificação</div>
              <div className="relative">
                <ScanLine className="absolute left-4 top-1/2 -translate-y-1/2 h-6 w-6 text-primary" />
                <Input value={scanInput} onChange={e=>setScanInput(e.target.value)} placeholder="Cartão, CPF ou QR code..." className="pl-14 h-16 text-lg font-mono border-2 border-border focus:border-primary" autoFocus />
              </div>
              <div className="text-xs text-muted-foreground mt-2">Pressione Enter para confirmar entrada · ESC para limpar</div>
            </div>

            {/* Aluno preview */}
            <div className="border-2 border-success/30 bg-success/50 rounded-xl p-5">
              <div className="flex items-center gap-4">
                <img src={selected.photo_url} alt="" className="h-16 w-16 rounded-full object-cover ring-4 ring-success" />
                <div className="flex-1">
                  <div className="font-bold text-muted-foreground text-lg">{selected.name}</div>
                  <div className="text-sm text-muted-foreground">{selected.plan_name}</div>
                  <Badge className="bg-success text-foreground border-0 text-[10px] mt-1">PLANO VÁLIDO</Badge>
                </div>
                <CheckCircle2 className="h-10 w-10 text-success" />
              </div>
              <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-success/30">
                <div><div className="text-xs text-muted-foreground uppercase">Última entrada</div><div className="text-sm font-bold text-muted-foreground">{selected.last_checkin_days}d atrás</div></div>
                <div><div className="text-xs text-muted-foreground uppercase">Check-ins mês</div><div className="text-sm font-bold text-muted-foreground">{selected.checkin_count_month}</div></div>
              </div>
              <Button className="w-full mt-4 bg-success hover:bg-success text-foreground h-11 font-bold">Confirmar Entrada</Button>
            </div>
          </CardContent>
        </Card>

        {/* Live feed */}
        <Card className="border-border shadow-sm lg:col-span-3">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-foreground flex items-center gap-2">
                <span className="relative flex h-2 w-2"><span className="animate-ping absolute h-2 w-2 rounded-full bg-success opacity-75" /><span className="relative inline-flex rounded-full h-2 w-2 bg-success" /></span>
                Atividade em tempo real
              </h3>
              <Badge className="bg-muted text-muted-foreground border-0">{demoFitZoneCheckinsHoje.length} de 142</Badge>
            </div>
            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
              {[...demoFitZoneCheckinsHoje].reverse().map(c => (
                <div key={c.id} className="flex items-center gap-3 py-2.5 px-3 bg-muted rounded-lg hover:bg-muted transition">
                  <img src={c.photo_url} alt="" className="h-10 w-10 rounded-full object-cover" />
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm text-muted-foreground">{c.student_name}</div>
                    <div className="text-xs text-muted-foreground">{c.modalidade} · prof. {c.professor}</div>
                  </div>
                  <div className="flex items-center gap-1 text-xs font-mono text-muted-foreground"><Clock className="h-3 w-3" />{c.hora}</div>
                  <CheckCircle2 className="h-4 w-4 text-success" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/lib/tenant-context";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FormDialog } from "@/components/form-dialog";
import { Plus, Check, Star } from "lucide-react";
import { toast } from "sonner";
import { fmtBRL } from "@/lib/format";
import { emptyPlanForm, planFormSchema } from "@/lib/plan-form";

export const Route = createFileRoute("/app/planos")({ component: Planos, head: () => ({ meta: [{"title": "Planos · Academia | Gym Spotter"}, {"name": "description", "content": "Planos — Gym Spotter, gestão de academias."}, {"property": "og:title", "content": "Planos · Academia | Gym Spotter"}, {"property": "og:description", "content": "Planos — Gym Spotter, gestão de academias."}, {"property": "og:type", "content": "website"}, {"name": "twitter:card", "content": "summary"}] }) });

function Planos() {
  const { tenant } = useTenant();
  const aid = tenant?.academyId;
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formAcademyId, setFormAcademyId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyPlanForm);
  const { data: rows, error } = useQuery({
    queryKey: ["plans", aid], enabled: !!aid,
    queryFn: async () => {
      if (!aid) throw new Error("Academia não selecionada.");
      const { data, error } = await supabase.from("plan").select("*").eq("academy_id", aid).order("price");
      if (error) throw new Error("Não foi possível carregar os planos.");
      return data ?? [];
    },
  });
  const create = useMutation({
    mutationFn: async () => {
      if (!aid || formAcademyId !== aid) throw new Error("A academia selecionada mudou. Reabra o formulário.");
      const parsed = planFormSchema.safeParse(form);
      if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Confira os dados do plano.");
      const query = editingId
        ? supabase.from("plan").update(parsed.data).eq("id", editingId).eq("academy_id", aid)
        : supabase.from("plan").insert({ ...parsed.data, academy_id: aid });
      const { data, error } = await query.select("id").single();
      if (error || !data) throw new Error("Não foi possível salvar o plano. Verifique seu acesso e tente novamente.");
      return { academyId: aid, edited: !!editingId };
    },
    onSuccess: ({ academyId, edited }) => {
      toast.success(edited ? "Plano atualizado" : "Plano criado"); setOpen(false); setEditingId(null); setForm(emptyPlanForm());
      for (const key of ["plans", "dashboard", "public-booking"]) void qc.invalidateQueries({ queryKey: key === "public-booking" ? [key] : [key, academyId] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div>
      <PageHeader title="Planos" description={`${rows?.length ?? 0} plano(s) cadastrado(s)`} actions={
        <Button disabled={!aid || create.isPending} onClick={() => { setEditingId(null); setForm(emptyPlanForm()); setFormAcademyId(aid ?? null); setOpen(true); }} className="bg-primary hover:bg-primary/90"><Plus className="h-4 w-4" />Novo plano</Button>
      } />

      {error && <p role="alert" className="mb-4 text-sm text-destructive">Não foi possível carregar os planos. Tente novamente mais tarde.</p>}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {(rows ?? []).map(p => (
          <Card key={p.id} className={p.featured ? "border-primary border-2 relative" : ""}>
            {p.featured && <Badge className="absolute -top-2 right-4 bg-primary hover:bg-primary"><Star className="h-3 w-3 mr-1" />Destaque</Badge>}
            <CardContent className="p-6">
              <h3 className="text-lg font-bold">{p.name}</h3>
              <p className="text-xs text-muted-foreground mt-1 min-h-[2.5rem]">{p.description ?? ""}</p>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-bold text-primary">{fmtBRL(p.price).replace("R$", "")}</span>
                <span className="text-sm text-muted-foreground">/ {p.duration_months}m</span>
              </div>
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex items-center gap-2"><Check className="h-4 w-4 text-success" />{p.duration_months} {p.duration_months === 1 ? "mês" : "meses"} de acesso</div>
                {p.included_classes?.map((c: string) => <div key={c} className="flex items-center gap-2"><Check className="h-4 w-4 text-success" />{c}</div>)}
                {p.total_checkins && <div className="flex items-center gap-2"><Check className="h-4 w-4 text-success" />{p.total_checkins} check-ins</div>}
              </div>
              <Button variant="outline" className="w-full mt-5" disabled={create.isPending || !aid} onClick={() => {
                setEditingId(p.id); setFormAcademyId(aid ?? null);
                setForm({ name: p.name, price: Number(p.price), duration_months: p.duration_months, description: p.description ?? "", featured: p.featured }); setOpen(true);
              }}>Editar</Button>
            </CardContent>
          </Card>
        ))}
        {!error && rows?.length === 0 && <div className="col-span-full text-center text-muted-foreground py-12">Nenhum plano cadastrado. Crie o primeiro!</div>}
      </div>

      <FormDialog open={open} onOpenChange={(value) => { if (!create.isPending) setOpen(value); }} title={editingId ? "Editar plano" : "Novo plano"}>
        <form onSubmit={(e)=>{e.preventDefault(); create.mutate();}} className="space-y-3">
          <div><Label htmlFor="plan-name">Nome *</Label><Input id="plan-name" value={form.name} onChange={(e)=>setForm({...form, name: e.target.value})} required /></div>
          <div><Label htmlFor="plan-description">Descrição</Label><Input id="plan-description" value={form.description} onChange={(e)=>setForm({...form, description: e.target.value})} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label htmlFor="plan-price">Preço (R$)</Label><Input id="plan-price" type="number" min="0" step="0.01" value={form.price} onChange={(e)=>setForm({...form, price: Number(e.target.value)})} required /></div>
            <div><Label htmlFor="plan-duration">Duração (meses)</Label><Input id="plan-duration" type="number" min="1" step="1" value={form.duration_months} onChange={(e)=>setForm({...form, duration_months: Number(e.target.value)})} required /></div>
          </div>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.featured} onChange={e=>setForm({...form, featured: e.target.checked})} />Destaque</label>
          <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={create.isPending}>Salvar</Button>
        </form>
      </FormDialog>
    </div>
  );
}

import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { lovable } from "@/integrations/lovable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Dumbbell } from "lucide-react";
import { useTenant } from "@/lib/tenant-context";
import { accessDestination } from "@/lib/access-destination";

export const Route = createFileRoute("/entrar")({ component: Entrar, head: () => ({ meta: [
  { title: "Entrar — GymBoss AI" },
  { name: "description", content: "Acesse sua academia ou a administração do GymBoss AI." },
  { property: "og:title", content: "Entrar — GymBoss AI" },
  { property: "og:description", content: "Acesso seguro ao GymBoss AI." },
  { property: "og:type", content: "website" },
  { name: "twitter:card", content: "summary" },
] }) });

function Entrar() {
  const { user, loading, signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const { tenant, loading: tenantLoading, error: tenantError } = useTenant();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [confirmationPending, setConfirmationPending] = useState(false);

  useEffect(() => {
    if (!loading && user && !tenantLoading && tenant) {
      navigate({ to: accessDestination(tenant), replace: true });
    }
  }, [user, loading, tenantLoading, tenant, navigate]);

  const onLogin = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true);
    const { error } = await signIn(email, password);
    setBusy(false);
    if (error) toast.error(error.message);
  };

  const onSignup = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true);
    const { error, signedIn } = await signUp(email, password);
    setBusy(false);
    if (error) toast.error(error.message);
    else if (signedIn) toast.success("Conta criada. Acesso confirmado.");
    else { setConfirmationPending(true); toast.success("Confira seu email para confirmar o cadastro."); }
  };

  const onGoogle = async () => {
    setBusy(true);
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + "/entrar" });
    if (result.error) { toast.error(result.error.message ?? "Falha no login com Google"); setBusy(false); return; }
    if (result.redirected) return;
    setBusy(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="mb-6 flex items-center justify-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary">
            <Dumbbell className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold">GymBoss AI</span>
        </div>
        <Card>
          <CardContent className="p-6">
            {tenantError && <p role="alert" className="mb-4 text-sm text-destructive">Não foi possível verificar seu acesso. Recarregue a página para tentar novamente.</p>}
            {confirmationPending && <p role="status" className="mb-4 text-sm text-muted-foreground">Confira sua caixa de entrada e confirme o cadastro pelo link enviado.</p>}
            <Tabs defaultValue="login">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Entrar</TabsTrigger>
                <TabsTrigger value="signup">Criar conta</TabsTrigger>
              </TabsList>
              <TabsContent value="login">
                <form onSubmit={onLogin} className="space-y-3 mt-4">
                  <div><Label htmlFor="login-email">Email</Label><Input id="login-email" autoComplete="email" type="email" value={email} onChange={(e)=>setEmail(e.target.value)} required /></div>
                  <div><Label htmlFor="login-password">Senha</Label><Input id="login-password" autoComplete="current-password" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} required /></div>
                  <Button type="submit" className="w-full" disabled={busy}>Entrar</Button>
                  <div className="text-center"><Link to="/esqueci-senha" className="text-sm text-muted-foreground hover:text-primary">Esqueci a senha</Link></div>
                </form>
              </TabsContent>
              <TabsContent value="signup">
                <form onSubmit={onSignup} className="space-y-3 mt-4">
                  <div><Label htmlFor="signup-email">Email</Label><Input id="signup-email" autoComplete="email" type="email" value={email} onChange={(e)=>setEmail(e.target.value)} required /></div>
                  <div><Label htmlFor="signup-password">Senha</Label><Input id="signup-password" autoComplete="new-password" type="password" minLength={6} value={password} onChange={(e)=>setPassword(e.target.value)} required /></div>
                  <Button type="submit" className="w-full" disabled={busy}>Criar conta</Button>
                </form>
              </TabsContent>
            </Tabs>
            <div className="my-4 flex items-center gap-3">
              <Separator className="flex-1" /><span className="text-xs text-muted-foreground">ou</span><Separator className="flex-1" />
            </div>
            <Button type="button" variant="outline" className="w-full" disabled={busy} onClick={onGoogle}>
              Continuar com Google
            </Button>
          </CardContent>
        </Card>
        <div className="text-center mt-4">
          <Link to="/" className="text-sm text-muted-foreground hover:text-primary">← Voltar</Link>
        </div>
      </div>
    </div>
  );
}
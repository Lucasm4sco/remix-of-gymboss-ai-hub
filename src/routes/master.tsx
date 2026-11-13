import { Dumbbell } from "lucide-react";
import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { useTenant } from "@/lib/tenant-context";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { SidebarMaster } from "@/components/sidebar-master";
import { accessDestination } from "@/lib/access-destination";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/master")({ component: MasterLayout });

function MasterLayout() {
  const { user, loading } = useAuth();
  const { tenant, loading: tLoading, error: tenantError, refetch } = useTenant();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading || tLoading || tenantError) return;
    if (!user) navigate({ to: "/entrar", replace: true });
    else if (tenant && !tenant.isSuperAdmin) navigate({ to: accessDestination(tenant), replace: true });
  }, [user, loading, tenant, tLoading, tenantError, navigate]);

  if (user && !loading && !tLoading && tenantError) {
    return <div className="flex min-h-screen flex-col items-center justify-center gap-3 p-4">
      <p role="alert">Não foi possível verificar seu acesso. Tente novamente.</p>
      <Button variant="outline" onClick={() => { void refetch(); }}>Tentar novamente</Button>
    </div>;
  }

  if (loading || tLoading || !user || !tenant?.isSuperAdmin) {
    return <div className="flex min-h-screen items-center justify-center text-muted-foreground">Verificando acesso…</div>;
  }

  return (
    <SidebarProvider>
      <div className="modern-panel min-h-screen flex w-full">
        <SidebarMaster />
        <div className="min-w-0 flex-1 flex flex-col">
          <header className="h-16 flex items-center gap-3 border-b border-border bg-sidebar px-2 sm:px-4">
            <SidebarTrigger />
            <Dumbbell className="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
            <span className="text-sm font-bold text-foreground">Gym Spotter</span>
            <span className="ml-auto text-[10px] sm:text-xs font-medium text-muted-foreground">MASTER · Super admin</span>
          </header>
          <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-background"><Outlet /></main>
        </div>
      </div>
    </SidebarProvider>
  );
}
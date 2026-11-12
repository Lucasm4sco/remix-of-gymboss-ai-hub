import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { useTenant } from "@/lib/tenant-context";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { SidebarMaster } from "@/components/sidebar-master";
import { accessDestination } from "@/lib/access-destination";

export const Route = createFileRoute("/master")({ component: MasterLayout });

function MasterLayout() {
  const { user, loading } = useAuth();
  const { tenant, loading: tLoading } = useTenant();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading || tLoading) return;
    if (!user) navigate({ to: "/entrar", replace: true });
    else if (tenant && !tenant.isSuperAdmin) navigate({ to: accessDestination(tenant), replace: true });
  }, [user, loading, tenant, tLoading, navigate]);

  if (loading || tLoading || !user || !tenant?.isSuperAdmin) {
    return <div className="flex min-h-screen items-center justify-center text-muted-foreground">Verificando acesso…</div>;
  }

  return (
    <SidebarProvider>
      <div className="spotter-panel min-h-screen flex w-full">
        <SidebarMaster />
        <div className="min-w-0 flex-1 flex flex-col">
          <header className="h-14 flex items-center gap-3 border-b border-border bg-sidebar/70">
            <SidebarTrigger className="ml-2" />
            <span className="text-xs font-medium text-primary">Gym Spotter · MASTER · Super admin</span>
          </header>
          <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-background"><Outlet /></main>
        </div>
      </div>
    </SidebarProvider>
  );
}
import { createFileRoute, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { useTenant } from "@/lib/tenant-context";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { SidebarTenant } from "@/components/sidebar-tenant";
import { TrialBanner } from "@/components/trial-banner";

export const Route = createFileRoute("/app")({ component: AppLayout });

function AppLayout() {
  const { user, loading } = useAuth();
  const { tenant, loading: tLoading } = useTenant();
  const navigate = useNavigate();
  const path = useRouterState({ select: s => s.location.pathname });

  useEffect(() => {
    if (loading) return;
    if (!user) { navigate({ to: "/entrar", replace: true }); return; }
    if (tLoading) return;
    if (tenant?.isSuperAdmin && !tenant.academyId && path !== "/app/onboarding") {
      navigate({ to: "/master/painel", replace: true }); return;
    }
    // Sem academia e não é super admin → onboarding
    if (!tenant?.academyId && !tenant?.isSuperAdmin) {
      // permite acesso à rota onboarding sem academia
      if (path !== "/app/onboarding") {
        navigate({ to: "/app/onboarding", replace: true });
      }
    }
  }, [user, loading, tenant, tLoading, navigate, path]);

  if (loading || tLoading || !user || (!tenant?.academyId && path !== "/app/onboarding")) {
    return <div className="flex min-h-screen items-center justify-center text-muted-foreground">Carregando…</div>;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <SidebarTenant />
        <div className="flex-1 flex flex-col">
          <TrialBanner />
          <header className="h-12 flex items-center border-b border-border bg-background">
            <SidebarTrigger className="ml-2" />
          </header>
          <main className="flex-1 p-6 bg-background"><Outlet /></main>
        </div>
      </div>
    </SidebarProvider>
  );
}
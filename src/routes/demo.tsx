import { createFileRoute, Outlet, Link } from "@tanstack/react-router";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { SidebarDemo } from "@/components/sidebar-demo";

export const Route = createFileRoute("/demo")({ component: DemoLayout });

function DemoLayout() {
  return (
    <SidebarProvider>
      <div className="modern-panel min-h-screen flex w-full">
        <SidebarDemo />
        <div className="min-w-0 flex-1 flex flex-col">
          <div className="bg-gradient-to-r from-warning to-warning text-muted-foreground px-4 py-2 text-sm text-center font-medium">
            ⚡ Você está vendo a demo de <strong>FitZone Performance</strong> com 287 alunos. <Link to="/entrar" className="underline font-bold ml-1">Criar minha conta grátis →</Link>
          </div>
          <header className="h-12 flex items-center justify-between border-b border-border bg-card px-4">
            <SidebarTrigger />
            <Link to="/" className="text-xs text-muted-foreground hover:text-primary">← Voltar ao site</Link>
          </header>
          <main className="flex-1 p-6 bg-background"><Outlet /></main>
        </div>
      </div>
    </SidebarProvider>
  );
}
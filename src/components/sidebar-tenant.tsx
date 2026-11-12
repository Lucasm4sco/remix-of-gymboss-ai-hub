import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { LayoutDashboard, Users, Tag, CalendarDays, ScanLine, Wallet, BarChart3, Sparkles, UserCog, Settings, LogOut, Dumbbell, Inbox } from "lucide-react";
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { useAuth } from "@/lib/auth-context";
import { useTenant } from "@/lib/tenant-context";

const groups = [
  { label: "Principal", items: [
    { title: "Dashboard", url: "/app/dashboard", icon: LayoutDashboard },
    { title: "Alunos",    url: "/app/alunos",    icon: Users },
    { title: "Planos",    url: "/app/planos",    icon: Tag },
    { title: "Agenda",    url: "/app/agenda",    icon: CalendarDays },
    { title: "Check-ins", url: "/app/checkins",  icon: ScanLine },
  ]},
  { label: "Operacional", items: [
    { title: "Financeiro", url: "/app/financeiro", icon: Wallet },
    { title: "Relatórios", url: "/app/relatorios", icon: BarChart3 },
    { title: "Leads",      url: "/app/leads",      icon: Inbox },
    { title: "AI Growth",  url: "/app/aigrowth",   icon: Sparkles, accent: true },
  ]},
  { label: "Gestão", items: [
    { title: "Equipe",        url: "/app/equipe",        icon: UserCog },
    { title: "Configurações", url: "/app/configuracoes", icon: Settings },
  ]},
];

export function SidebarTenant() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const { signOut, user } = useAuth();
  const { tenant } = useTenant();
  const navigate = useNavigate();

  return (
    <Sidebar collapsible="icon" className="">
      <SidebarHeader className="bg-sidebar border-b border-sidebar-border">
        <div className="flex items-center gap-2 px-2 py-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/15 border border-primary/30">
            <Dumbbell className="h-5 w-5 text-primary" />
          </div>
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <span className="text-sm font-bold text-sidebar-foreground">Gym Spotter</span>
            <span className="truncate text-xs text-sidebar-foreground/60">{tenant?.academy?.name ?? "—"}</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="bg-sidebar">
        {groups.map((g) => (
          <SidebarGroup key={g.label}>
            <SidebarGroupLabel className="text-sidebar-foreground/50 text-[10px] uppercase tracking-wider px-3">{g.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {g.items.map((item) => {
                  const active = path === item.url;
                  return (
                    <SidebarMenuItem key={item.url}>
                      <SidebarMenuButton
                        asChild
                        isActive={active}
                        className={`text-sidebar-foreground/80 hover:text-sidebar-accent-foreground hover:bg-sidebar-accent data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground data-[active=true]:border-l-2 data-[active=true]:border-primary rounded-md`}
                      >
                        <Link to={item.url} className="flex items-center gap-2">
                          <item.icon className={`h-4 w-4 ${item.accent ? "text-primary" : ""}`} />
                          <span>{item.title}</span>
                          {item.accent && <span className="ml-auto text-[9px] font-bold bg-primary text-primary-foreground px-1.5 py-0.5 rounded">IA</span>}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter className="bg-sidebar border-t border-sidebar-border">
        <div className="px-2 py-1 text-xs text-sidebar-foreground/60 truncate group-data-[collapsible=icon]:hidden">{user?.email}</div>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton className="text-sidebar-foreground/80 hover:text-sidebar-accent-foreground hover:bg-sidebar-accent" onClick={async () => { await signOut(); navigate({ to: "/entrar", replace: true }); }}>
              <LogOut className="h-4 w-4" /><span>Sair</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

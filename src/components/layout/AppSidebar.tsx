import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Bot,
  BookOpen,
  FileText,
  ListChecks,
  AlertOctagon,
  MonitorSmartphone,
  Upload,
  History,
  BarChart3,
  Users,
  Settings,
  BrainCircuit,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar";

const nav = {
  overview: [
    { title: "Dashboard", url: "/", icon: LayoutDashboard },
    { title: "BrainOps AI", url: "/chat", icon: Bot },
  ],
  knowledge: [
    { title: "Base de Conhecimento", url: "/knowledge-base", icon: BookOpen },
    { title: "Documentações", url: "/documentacoes", icon: FileText },
    { title: "Procedimentos", url: "/procedimentos", icon: ListChecks },
    { title: "Erros Conhecidos", url: "/erros-conhecidos", icon: AlertOctagon },
    { title: "Equipamentos", url: "/equipamentos", icon: MonitorSmartphone },
    { title: "Uploads", url: "/uploads", icon: Upload },
  ],
  insights: [
    { title: "Histórico", url: "/historico", icon: History },
    { title: "Analytics", url: "/analytics", icon: BarChart3 },
  ],
  admin: [
    { title: "Usuários", url: "/usuarios", icon: Users },
    { title: "Configurações", url: "/settings", icon: Settings },
  ],
};

export function AppSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isActive = (url: string) =>
    url === "/" ? pathname === "/" : pathname === url || pathname.startsWith(url + "/");

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/60 text-primary-foreground shadow-sm">
            <BrainCircuit className="h-5 w-5" />
          </div>
          <div className="group-data-[collapsible=icon]:hidden">
            <div className="text-sm font-semibold leading-none tracking-tight">BrainOps</div>
            <div className="mt-0.5 text-[11px] text-muted-foreground">Inteligência Operacional</div>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {(
          [
            ["Visão Geral", nav.overview],
            ["Conhecimento", nav.knowledge],
            ["Insights", nav.insights],
          ] as const
        ).map(([label, items]) => (
          <SidebarGroup key={label}>
            <SidebarGroupLabel>{label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {items.map((item) => (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton asChild isActive={isActive(item.url)} tooltip={item.title}>
                      <Link to={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          {nav.admin.map((item) => (
            <SidebarMenuItem key={item.url}>
              <SidebarMenuButton asChild isActive={isActive(item.url)} tooltip={item.title}>
                <Link to={item.url}>
                  <item.icon />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

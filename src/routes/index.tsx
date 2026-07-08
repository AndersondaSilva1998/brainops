import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { StatCard } from "@/components/common/StatCard";
import {
  AlertTriangle,
  BookOpen,
  FileText,
  Search,
  Timer,
  ArrowRight,
  MessageSquare,
  TrendingUp,
  Upload,
  Bot,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
} from "recharts";

export const Route = createFileRoute("/")({
  component: DashboardPage,
});

const metrics = {
  documentsCount: 212,
  proceduresCount: 74,
  errorsCount: 128,
  queriesCount: 1893,
  avgResolutionMinutes: 12,
};

const queriesTrend = [
  { day: "Seg", value: 220 },
  { day: "Ter", value: 265 },
  { day: "Qua", value: 310 },
  { day: "Qui", value: 298 },
  { day: "Sex", value: 342 },
  { day: "Sáb", value: 180 },
  { day: "Dom", value: 140 },
];

const topProblems = [
  { name: "Impressora offline", value: 42 },
  { name: "VPN não conecta", value: 36 },
  { name: "Outlook trava", value: 29 },
  { name: "Erro 0x610000f6", value: 21 },
  { name: "Reset AD", value: 18 },
];

const topEquipment = [
  { name: "HP LaserJet Pro M404", falhas: 34 },
  { name: "Notebook Dell 5420", falhas: 22 },
  { name: "Switch Cisco 2960", falhas: 14 },
  { name: "Impressora Ricoh SP", falhas: 12 },
];

const recentActivity = [
  { title: "Novo procedimento — Reset senha AD", tag: "procedimento", time: "há 2 min" },
  { title: "Erro cadastrado — Falha USB Dell 5420", tag: "erro", time: "há 34 min" },
  { title: "Upload — Manual Ricoh SP.pdf", tag: "upload", time: "há 1 h" },
  { title: "Consulta — VPN Cisco AnyConnect", tag: "consulta", time: "há 2 h" },
];

function DashboardPage() {
  return (
    <AppShell
      title="Dashboard"
      subtitle="Painel executivo do BrainOps"
      actions={
        <Button asChild size="sm">
          <Link to="/chat"><Bot className="h-4 w-4" /> Abrir BrainOps AI</Link>
        </Button>
      }
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Documentações" value={metrics.documentsCount} icon={FileText} accent="info" />
        <StatCard label="Procedimentos" value={metrics.proceduresCount} icon={BookOpen} accent="primary" />
        <StatCard label="Erros cadastrados" value={metrics.errorsCount} icon={AlertTriangle} accent="warning" />
        <StatCard label="Consultas realizadas" value={metrics.queriesCount.toLocaleString("pt-BR")} icon={Search} accent="success" />
        <StatCard label="Tempo médio (min)" value={metrics.avgResolutionMinutes} hint="resolução" icon={Timer} accent="primary" />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Consultas nos últimos 7 dias</CardTitle>
            <CardDescription>Volume diário de interações com o BrainOps</CardDescription>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={queriesTrend}>
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip contentStyle={{ background: "hsl(var(--background))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                <Area type="monotone" dataKey="value" stroke="hsl(var(--primary))" fill="url(#g1)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Problemas mais frequentes</CardTitle>
            <CardDescription>Top consultas do período</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {topProblems.map((p) => (
              <div key={p.name} className="flex items-center justify-between text-sm">
                <span className="truncate text-foreground/90">{p.name}</span>
                <Badge variant="secondary">{p.value}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Equipamentos com mais falhas</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topEquipment} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis type="category" dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} width={160} />
                <Tooltip contentStyle={{ background: "hsl(var(--background))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                <Bar dataKey="falhas" fill="hsl(var(--primary))" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Atividade recente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentActivity.map((a) => (
              <div key={a.title} className="flex items-start justify-between gap-3 rounded-md border p-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{a.title}</p>
                  <p className="text-xs text-muted-foreground">{a.time}</p>
                </div>
                <Badge variant="outline" className="capitalize shrink-0">{a.tag}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <QuickCard icon={MessageSquare} title="Nova consulta" desc="Pergunte à IA agora" to="/chat" />
        <QuickCard icon={Upload} title="Enviar documento" desc="Adicionar à base" to="/uploads" />
        <QuickCard icon={TrendingUp} title="Ver analytics" desc="Métricas completas" to="/analytics" />
      </div>
    </AppShell>
  );
}

function QuickCard({ icon: Icon, title, desc, to }: { icon: typeof MessageSquare; title: string; desc: string; to: string }) {
  return (
    <Link to={to} className="group">
      <Card className="transition-all hover:border-primary/50 hover:shadow-sm">
        <CardContent className="flex items-center gap-4 p-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Icon className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">{title}</p>
            <p className="text-xs text-muted-foreground">{desc}</p>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
        </CardContent>
      </Card>
    </Link>
  );
}

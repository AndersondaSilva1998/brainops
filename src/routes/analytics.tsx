import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { StatCard } from "@/components/common/StatCard";
import { BarChart3, Timer, Sparkles, Upload } from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
  BarChart,
  Bar,
} from "recharts";
import { analyticsService } from "@/services/analytics";

export const Route = createFileRoute("/analytics")({
  component: AnalyticsPage,
});

const COLORS = ["hsl(var(--primary))", "#38bdf8", "#f59e0b", "#10b981", "#a78bfa"];

function AnalyticsPage() {
  const { data: overview = { queriesCount: 0, avgResolutionMinutes: 0, documentsCount: 0, uploadsCount: 0 } } = useQuery({
    queryKey: ["analytics", "overview"],
    queryFn: analyticsService.overview,
  });

  const { data: trends = [] } = useQuery({
    queryKey: ["analytics", "trend"],
    queryFn: () => analyticsService.queriesTrend(14),
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["analytics", "categories"],
    queryFn: analyticsService.categories,
  });

  const { data: topDocuments = [] } = useQuery({
    queryKey: ["analytics", "topDocuments"],
    queryFn: () => analyticsService.topDocuments(5),
  });

  return (
    <AppShell title="Analytics" subtitle="Métricas de uso e eficiência da IA">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Consultas (30 dias)" value={overview.queriesCount.toLocaleString("pt-BR")} icon={BarChart3} accent="primary" />
        <StatCard label="Tempo médio resposta" value={`${overview.avgResolutionMinutes}s`} icon={Timer} accent="info" />
        <StatCard label="Documentos" value={overview.documentsCount.toString()} icon={Sparkles} accent="success" />
        <StatCard label="Uploads" value={overview.uploadsCount.toString()} icon={Upload} accent="warning" />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Consultas por período</CardTitle>
            <CardDescription>Últimos 14 dias</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trends}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip contentStyle={{ background: "hsl(var(--background))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                <Line type="monotone" dataKey="consultas" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Categorias mais pesquisadas</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categories} dataKey="value" nameKey="name" outerRadius={80} innerRadius={45} paddingAngle={2}>
                  {categories.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "hsl(var(--background))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Documentos mais utilizados</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topDocuments}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip contentStyle={{ background: "hsl(var(--background))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                <Bar dataKey="uso" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}

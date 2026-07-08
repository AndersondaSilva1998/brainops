import { createFileRoute } from "@tanstack/react-router";
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

export const Route = createFileRoute("/analytics")({
  component: AnalyticsPage,
});

const trend = Array.from({ length: 14 }).map((_, i) => ({
  day: `D${i + 1}`,
  consultas: 120 + Math.round(Math.sin(i / 2) * 40 + i * 8),
}));

const categorias = [
  { name: "Impressoras", value: 32 },
  { name: "Rede", value: 24 },
  { name: "Office", value: 18 },
  { name: "Acesso", value: 14 },
  { name: "Hardware", value: 12 },
];

const docs = [
  { name: "Manual HP M404", uso: 42 },
  { name: "Guia VPN Cisco", uso: 35 },
  { name: "Procedimento Spooler", uso: 28 },
  { name: "Reset AD", uso: 22 },
];

const COLORS = ["hsl(var(--primary))", "#38bdf8", "#f59e0b", "#10b981", "#a78bfa"];

function AnalyticsPage() {
  return (
    <AppShell title="Analytics" subtitle="Métricas de uso e eficiência da IA">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Consultas (30 dias)" value="4.821" icon={BarChart3} accent="primary" />
        <StatCard label="Tempo médio resposta" value="1.3s" icon={Timer} accent="info" />
        <StatCard label="Eficiência da IA" value="92%" icon={Sparkles} accent="success" />
        <StatCard label="Uploads" value={216} icon={Upload} accent="warning" />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Consultas por período</CardTitle>
            <CardDescription>Últimos 14 dias</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trend}>
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
                <Pie data={categorias} dataKey="value" nameKey="name" outerRadius={80} innerRadius={45} paddingAngle={2}>
                  {categorias.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
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
              <BarChart data={docs}>
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

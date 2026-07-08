import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { StatCard } from "@/components/common/StatCard";
import { AlertTriangle, BookOpen, FileText, Search, Timer, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { DashboardMetrics } from "@/types";

export const Route = createFileRoute("/")({
  component: DashboardPage,
});

const metrics: DashboardMetrics = {
  errorsCount: 128,
  proceduresCount: 74,
  documentsCount: 212,
  queriesCount: 1893,
  avgResolutionMinutes: 12,
};

function DashboardPage() {
  return (
    <AppShell title="Dashboard" subtitle="Visão geral do suporte técnico">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Erros cadastrados" value={metrics.errorsCount} icon={AlertTriangle} accent="warning" />
        <StatCard label="Procedimentos" value={metrics.proceduresCount} icon={BookOpen} accent="primary" />
        <StatCard label="Documentações" value={metrics.documentsCount} icon={FileText} accent="info" />
        <StatCard label="Consultas realizadas" value={metrics.queriesCount.toLocaleString("pt-BR")} icon={Search} accent="success" />
        <StatCard label="Tempo médio (min)" value={metrics.avgResolutionMinutes} hint="resolução" icon={Timer} accent="primary" />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Ações rápidas</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button asChild>
              <Link to="/chat"><MessageIcon /> Abrir Chat IA</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link to="/search"><Search className="h-4 w-4" /> Pesquisa Inteligente</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/knowledge-base/new">Novo registro <ArrowRight className="h-4 w-4" /></Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Status do sistema</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Row label="API Local (Ollama)" value="Aguardando conexão" tone="warning" />
            <Row label="Supabase" value="Não configurado" tone="warning" />
            <Row label="Índice vetorial" value="Pendente (Fase 5)" tone="muted" />
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}

function Row({ label, value, tone }: { label: string; value: string; tone: "warning" | "success" | "muted" }) {
  const cls =
    tone === "warning" ? "text-amber-500" : tone === "success" ? "text-emerald-500" : "text-muted-foreground";
  return (
    <div className="flex items-center justify-between rounded-md border px-3 py-2">
      <span className="text-muted-foreground">{label}</span>
      <span className={`font-medium ${cls}`}>{value}</span>
    </div>
  );
}

function MessageIcon() {
  return <span className="i-lucide-message-square h-4 w-4" />;
}

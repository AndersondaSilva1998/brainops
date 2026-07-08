import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { api } from "@/services/api";
import { isSupabaseConfigured, supabaseConfig } from "@/services/supabase";
import { chatService } from "@/services/chat";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const [checking, setChecking] = useState(false);
  const checkHealth = async () => {
    setChecking(true);
    const ok = await chatService.health();
    setChecking(false);
    ok ? toast.success("API local respondeu OK") : toast.error("API local indisponível");
  };

  return (
    <AppShell title="Configurações" subtitle="Ambiente e integrações">
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">API Local (Ollama / RAG)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-1.5">
              <Label>Base URL</Label>
              <Input readOnly value={api.baseUrl} />
              <p className="text-xs text-muted-foreground">
                Configure via variável de ambiente <code>VITE_API_URL</code>.
              </p>
            </div>
            <Button onClick={checkHealth} disabled={checking} variant="secondary">
              {checking ? "Verificando..." : "Testar conexão (/health)"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Supabase</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-1.5">
              <Label>URL</Label>
              <Input readOnly value={supabaseConfig.url ?? "(não configurado)"} />
            </div>
            <div className="grid gap-1.5">
              <Label>Anon Key</Label>
              <Input readOnly value={supabaseConfig.anonKey ? "••••••••" : "(não configurado)"} />
            </div>
            <p className="text-xs text-muted-foreground">
              Status: {isSupabaseConfigured ? "Configurado" : "Pendente — defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY"}
            </p>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Roadmap</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2 text-sm md:grid-cols-2">
            {[
              ["Fase 1", "Front-end completo ✅"],
              ["Fase 2", "Banco de dados Supabase"],
              ["Fase 3", "API própria (Node/Python)"],
              ["Fase 4", "Ollama local"],
              ["Fase 5", "RAG + busca semântica"],
              ["Fase 6", "Upload PDF/Word/Excel"],
              ["Fase 7", "Aprendizado com documentação"],
              ["Fase 8", "Histórico e melhoria contínua"],
            ].map(([k, v]) => (
              <div key={k} className="flex items-center justify-between rounded-md border px-3 py-2">
                <span className="font-medium">{k}</span>
                <span className="text-muted-foreground">{v}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}

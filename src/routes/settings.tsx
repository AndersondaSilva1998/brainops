import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/services/api";
import { isSupabaseConfigured, supabaseConfig } from "@/services/supabase";
import { chatService } from "@/services/chat";
import {
  defaultExternalApiConfig,
  getExternalApiConfig,
  getLastExternalApiResult,
  saveExternalApiConfig,
  testExternalApi,
} from "@/services/externalApi";
import { useMemo, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const [checking, setChecking] = useState(false);
  const [testingExternal, setTestingExternal] = useState(false);
  const [externalConfig, setExternalConfig] = useState(() => getExternalApiConfig());
  const [lastExternalResult, setLastExternalResult] = useState(() => getLastExternalApiResult());
  const supabaseHost = supabaseConfig.url
    ? (() => {
        try {
          return new URL(supabaseConfig.url).hostname;
        } catch {
          return supabaseConfig.url;
        }
      })()
    : "(não configurado)";

  const checkHealth = async () => {
    setChecking(true);
    try {
      const ok = await chatService.health();
      if (ok) {
        toast.success("API local respondeu OK");
      } else {
        toast.error("API local indisponível");
      }
    } finally {
      setChecking(false);
    }
  };

  const saveExternal = () => {
    const next = saveExternalApiConfig(externalConfig);
    setExternalConfig(next);
    toast.success("Configuração salva localmente");
  };

  const testExternal = async () => {
    setTestingExternal(true);
    const result = await testExternalApi(externalConfig);
    setTestingExternal(false);
    setLastExternalResult(result);

    if (result.ok) {
      toast.success(`Conexão OK (${result.status})`);
    } else {
      toast.error(result.error ?? "Falha ao testar a API externa");
    }
  };

  const externalSummary = useMemo(() => {
    if (!externalConfig.url) return "Aguardando URL";
    const base = externalConfig.url.replace(/\?.*$/, "");
    return `${base}${externalConfig.api && externalConfig.funcao ? " (pronto para testar)" : " (preencha API e função)"}`;
  }, [externalConfig.api, externalConfig.funcao, externalConfig.url]);

  return (
    <AppShell title="Configurações" subtitle="Ambiente e integrações">
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Configuração da API local (RAG)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-1.5">
              <Label>URL base</Label>
              <Input readOnly value={api.baseUrl} />
              <p className="text-xs text-muted-foreground">
                Configure via a variável de ambiente <code>VITE_API_URL</code>.
              </p>
            </div>
            <Button onClick={checkHealth} disabled={checking} variant="secondary">
              {checking ? "Verificando..." : "Testar conexão (/health)"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Configuração do Supabase</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-1.5">
              <Label>URL do projeto</Label>
              <Input readOnly value={supabaseConfig.url ?? "(não configurado)"} />
            </div>
            <div className="grid gap-1.5">
              <Label>Host do projeto</Label>
              <Input readOnly value={supabaseHost} />
            </div>
            <div className="grid gap-1.5">
              <Label>Chave anônima do projeto</Label>
              <Input readOnly value={supabaseConfig.anonKey ? "••••••••" : "(não configurado)"} />
            </div>
            <p className="text-xs text-muted-foreground">
              Status:{" "}
              {isSupabaseConfigured
                ? `Conectado ao projeto ${supabaseHost}`
                : "Pendente — defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY"}
            </p>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Configuração da API externa</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">{externalSummary}</p>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="grid gap-1.5">
                <Label>URL da API</Label>
                <Input
                  value={externalConfig.url}
                  onChange={(e) => setExternalConfig((prev) => ({ ...prev, url: e.target.value }))}
                  placeholder="https://branco.eship.com.br/v3/"
                />
              </div>
              <div className="grid gap-1.5">
                <Label>Valor do parâmetro API</Label>
                <Input
                  value={externalConfig.api}
                  onChange={(e) => setExternalConfig((prev) => ({ ...prev, api: e.target.value }))}
                  placeholder="Digite o valor de api"
                />
              </div>
            </div>
            <div className="grid gap-1.5">
              <Label>Função da chamada</Label>
              <Input
                value={externalConfig.funcao}
                onChange={(e) => setExternalConfig((prev) => ({ ...prev, funcao: e.target.value }))}
                placeholder="Digite a função correta"
              />
            </div>
            <div className="grid gap-1.5">
              <Label>Body em JSON</Label>
              <Textarea
                value={externalConfig.body}
                onChange={(e) => setExternalConfig((prev) => ({ ...prev, body: e.target.value }))}
                rows={10}
                placeholder={'{\n  "ordem": "00716320"\n}'}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button onClick={saveExternal} variant="secondary">
                Salvar configuração
              </Button>
              <Button onClick={testExternal} disabled={testingExternal}>
                {testingExternal ? "Testando..." : "Testar conexão"}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setExternalConfig(defaultExternalApiConfig);
                  saveExternalApiConfig(defaultExternalApiConfig);
                  toast.success("Valores padrão restaurados");
                }}
              >
                Restaurar padrão
              </Button>
            </div>

            <div className="rounded-md border bg-muted/30 p-3 text-sm">
              <div className="mb-2 flex items-center justify-between">
                <span className="font-medium">Último retorno salvo</span>
                <span className="text-xs text-muted-foreground">
                  {lastExternalResult?.timestamp
                    ? new Date(lastExternalResult.timestamp).toLocaleString("pt-BR")
                    : "Ainda não houve teste"}
                </span>
              </div>
              {lastExternalResult ? (
                <div className="space-y-2">
                  <p>
                    <span className="font-medium">Status:</span> {lastExternalResult.status}
                  </p>
                  <p>
                    <span className="font-medium">Sucesso:</span>{" "}
                    {lastExternalResult.ok ? "Sim" : "Não"}
                  </p>
                  {lastExternalResult.error ? (
                    <p className="text-red-600">
                      <span className="font-medium">Erro:</span> {lastExternalResult.error}
                    </p>
                  ) : null}
                  <pre className="max-h-48 overflow-auto whitespace-pre-wrap rounded bg-background p-2 text-xs">
                    {JSON.stringify(lastExternalResult.data, null, 2)}
                  </pre>
                </div>
              ) : (
                <p className="text-muted-foreground">Nenhum retorno foi salvo ainda.</p>
              )}
            </div>
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
              ["Fase 4", "API local / backend"],
              ["Fase 5", "RAG + busca semântica"],
              ["Fase 6", "Upload PDF/Word/Excel"],
              ["Fase 7", "Aprendizado com documentação"],
              ["Fase 8", "Histórico e melhoria contínua"],
            ].map(([k, v]) => (
              <div
                key={k}
                className="flex items-center justify-between rounded-md border px-3 py-2"
              >
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

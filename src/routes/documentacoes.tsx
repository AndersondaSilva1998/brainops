import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Search, FileText, Plus, Filter } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/documentacoes")({
  component: DocumentacoesPage,
});

const docs = [
  { id: "d-1", title: "Manual HP LaserJet Pro M404", category: "Manual", department: "TI", version: "v2.1", updated: "2 dias atrás", tags: ["impressora", "hp"] },
  { id: "d-2", title: "Guia de configuração VPN Cisco AnyConnect", category: "Documentação", department: "Rede", version: "v1.4", updated: "1 semana atrás", tags: ["vpn", "cisco"] },
  { id: "d-3", title: "Política de senhas corporativas", category: "Política", department: "Segurança", version: "v3.0", updated: "1 mês atrás", tags: ["senha", "ad"] },
  { id: "d-4", title: "Guia de instalação Office 365", category: "Manual", department: "TI", version: "v1.2", updated: "3 dias atrás", tags: ["office", "microsoft"] },
];

function DocumentacoesPage() {
  const [q, setQ] = useState("");
  const filtered = docs.filter((d) => (d.title + d.tags.join(" ")).toLowerCase().includes(q.toLowerCase()));
  return (
    <AppShell
      title="Documentações"
      subtitle="Biblioteca técnica corporativa"
      actions={
        <Button size="sm"><Plus className="h-4 w-4" /> Nova documentação</Button>
      }
    >
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar documentação" className="pl-9" />
        </div>
        <Button variant="outline" size="sm"><Filter className="h-4 w-4" /> Filtros</Button>
      </div>

      <Tabs defaultValue="cards">
        <TabsList>
          <TabsTrigger value="cards">Cards</TabsTrigger>
          <TabsTrigger value="lista">Lista</TabsTrigger>
        </TabsList>

        <TabsContent value="cards" className="mt-4">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((d) => (
              <Card key={d.id} className="transition-colors hover:border-primary/50">
                <CardContent className="p-5">
                  <div className="mb-3 flex items-start justify-between gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <FileText className="h-4 w-4" />
                    </div>
                    <Badge variant="outline">{d.version}</Badge>
                  </div>
                  <h3 className="mb-1 font-medium">{d.title}</h3>
                  <p className="text-xs text-muted-foreground">{d.department} · {d.category} · {d.updated}</p>
                  <div className="mt-3 flex flex-wrap gap-1">
                    {d.tags.map((t) => <span key={t} className="rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground">#{t}</span>)}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="lista" className="mt-4">
          <Card>
            <CardContent className="divide-y p-0">
              {filtered.map((d) => (
                <div key={d.id} className="flex items-center gap-4 p-4">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <div className="flex-1 min-w-0">
                    <p className="truncate font-medium">{d.title}</p>
                    <p className="text-xs text-muted-foreground">{d.department} · {d.category}</p>
                  </div>
                  <Badge variant="outline">{d.version}</Badge>
                  <span className="text-xs text-muted-foreground">{d.updated}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Search, FileText, Plus, Filter } from "lucide-react";
import { useState } from "react";
import { documentsService } from "@/services/documents";

export const Route = createFileRoute("/documentacoes")({
  component: DocumentacoesPage,
});

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function DocumentacoesPage() {
  const [q, setQ] = useState("");
  const { data = [], isLoading } = useQuery({ queryKey: ["documents", "list"], queryFn: () => documentsService.list() });
  const filtered = data.filter((doc) => (doc.name + (doc.contentType ?? "")).toLowerCase().includes(q.toLowerCase()));

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
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Carregando...</p>
          ) : filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhuma documentação cadastrada.</p>
          ) : (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {filtered.map((doc) => (
                <Card key={doc.id} className="transition-colors hover:border-primary/50">
                  <CardContent className="p-5">
                    <div className="mb-3 flex items-start justify-between gap-2">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <FileText className="h-4 w-4" />
                      </div>
                      <Badge variant="outline">{doc.contentType ?? "Tipo desconhecido"}</Badge>
                    </div>
                    <h3 className="mb-1 font-medium">{doc.name}</h3>
                    <p className="text-xs text-muted-foreground">{formatDate(doc.createdAt)}</p>
                    <div className="mt-3 flex flex-wrap gap-1">
                      {doc.downloadUrl && (
                        <span className="rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground">Download disponível</span>
                      )}
                      {doc.storagePath && (
                        <span className="rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground">Storage</span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="lista" className="mt-4">
          <Card>
            <CardContent className="divide-y p-0">
              {isLoading ? (
                <p className="p-4 text-sm text-muted-foreground">Carregando...</p>
              ) : filtered.length === 0 ? (
                <p className="p-4 text-sm text-muted-foreground">Nenhuma documentação cadastrada.</p>
              ) : (
                filtered.map((doc) => (
                  <div key={doc.id} className="flex items-center gap-4 p-4">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <p className="truncate font-medium">{doc.name}</p>
                      <p className="text-xs text-muted-foreground">{doc.contentType ?? "Tipo desconhecido"}</p>
                    </div>
                    <Badge variant="outline">{formatDate(doc.createdAt)}</Badge>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}

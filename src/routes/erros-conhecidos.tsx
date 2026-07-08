import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertOctagon, Plus, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { knowledgeBaseService } from "@/services/knowledgeBase";

export const Route = createFileRoute("/erros-conhecidos")({
  component: ErrosConhecidosPage,
});

function ErrosConhecidosPage() {
  const [q, setQ] = useState("");
  const { data = [], isLoading } = useQuery({
    queryKey: ["knowledge", "errors"],
    queryFn: () => knowledgeBaseService.list(),
  });

  const items = useMemo(
    () => data.filter((entry) => entry.category === "erro"),
    [data],
  );

  const filtered = items.filter((entry) =>
    [entry.title, entry.problemDescription, entry.equipment ?? "", ...entry.tags]
      .join(" ")
      .toLowerCase()
      .includes(q.toLowerCase()),
  );

  return (
    <AppShell
      title="Erros Conhecidos"
      subtitle="Catálogo de erros e soluções aplicadas"
      actions={<Button size="sm"><Plus className="h-4 w-4" /> Novo erro</Button>}
    >
      <div className="mb-4 relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por equipamento ou título" className="pl-9" />
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Carregando...</p>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nenhum erro conhecido encontrado.</p>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {filtered.map((entry) => (
            <Card key={entry.id} className="transition-colors hover:border-primary/50">
              <CardContent className="p-5">
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500">
                      <AlertOctagon className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="mt-1 font-medium leading-tight">{entry.title}</h3>
                    </div>
                  </div>
                  <Badge variant="outline" className="capitalize">
                    {entry.category}
                  </Badge>
                </div>
                <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">{entry.problemDescription}</p>
                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                  {entry.equipment && <span>Equipamento: {entry.equipment}</span>}
                  <span>Autor: {entry.author}</span>
                </div>
                <div className="mt-3 flex flex-wrap gap-1">
                  {entry.tags.map((tag) => (
                    <span key={tag} className="rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                      #{tag}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </AppShell>
  );
}

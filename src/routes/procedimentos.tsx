import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ListChecks, Plus, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { knowledgeBaseService } from "@/services/knowledgeBase";

export const Route = createFileRoute("/procedimentos")({
  component: ProcedimentosPage,
});

function ProcedimentosPage() {
  const [q, setQ] = useState("");
  const { data = [], isLoading } = useQuery({
    queryKey: ["knowledge", "procedures"],
    queryFn: () => knowledgeBaseService.list(),
  });

  const items = useMemo(() => data.filter((entry) => entry.category === "procedimento"), [data]);

  const filtered = items.filter((entry) =>
    [
      entry.title,
      entry.problemDescription,
      entry.solutionSteps,
      entry.equipment ?? "",
      ...entry.tags,
    ]
      .join(" ")
      .toLowerCase()
      .includes(q.toLowerCase()),
  );

  return (
    <AppShell
      title="Procedimentos"
      subtitle="Guias operacionais passo a passo"
      actions={
        <Button size="sm">
          <Plus className="h-4 w-4" /> Novo procedimento
        </Button>
      }
    >
      <div className="mb-4 relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar procedimento"
          className="pl-9"
        />
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Carregando...</p>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nenhum procedimento publicado.</p>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((entry) => (
            <Card key={entry.id} className="transition-colors hover:border-primary/50">
              <CardContent className="p-5">
                <div className="mb-3 flex items-start justify-between">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <ListChecks className="h-4 w-4" />
                  </div>
                  <Badge variant="outline">{entry.status}</Badge>
                </div>
                <h3 className="font-medium">{entry.title}</h3>
                <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
                  {entry.solutionSteps}
                </p>
                <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                  {entry.equipment && <span>Equipamento: {entry.equipment}</span>}
                  {entry.system && <span>Sistema: {entry.system}</span>}
                </div>
                <div className="mt-3 flex flex-wrap gap-1">
                  {entry.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                    >
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

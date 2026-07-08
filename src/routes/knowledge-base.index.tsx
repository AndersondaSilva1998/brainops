import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/layout/AppShell";
import { knowledgeBaseService } from "@/services/knowledgeBase";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PlusCircle, Search } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/knowledge-base/")({
  component: KnowledgeBaseListPage,
});

function KnowledgeBaseListPage() {
  const [q, setQ] = useState("");
  const { data = [], isLoading } = useQuery({
    queryKey: ["kb", "list"],
    queryFn: () => knowledgeBaseService.list(),
  });

  const filtered = data.filter((k) =>
    !q ? true : (k.title + " " + k.keywords.join(" ")).toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <AppShell
      title="Base de Conhecimento"
      subtitle="Procedimentos, erros e documentações"
      actions={
        <Button asChild size="sm">
          <Link to="/knowledge-base/new"><PlusCircle className="h-4 w-4" /> Novo</Link>
        </Button>
      }
    >
      <div className="mb-4 flex items-center gap-2">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por título ou palavra-chave" className="pl-9" />
        </div>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Carregando...</p>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((k) => (
            <Card key={k.id} className="transition-colors hover:border-primary/50">
              <CardContent className="p-5">
                <div className="mb-2 flex items-center gap-2">
                  <Badge variant="secondary" className="capitalize">{k.category}</Badge>
                  {k.equipment && <Badge variant="outline">{k.equipment}</Badge>}
                </div>
                <h3 className="mb-1 line-clamp-2 font-medium">{k.title}</h3>
                <p className="line-clamp-2 text-sm text-muted-foreground">{k.problemDescription}</p>
                <div className="mt-4 flex flex-wrap gap-1">
                  {k.tags.map((t) => (
                    <span key={t} className="rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground">#{t}</span>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
          {filtered.length === 0 && (
            <p className="text-sm text-muted-foreground">Nenhum registro encontrado.</p>
          )}
        </div>
      )}
    </AppShell>
  );
}

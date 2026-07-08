import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search as SearchIcon, Loader2 } from "lucide-react";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { searchService } from "@/services/search";
import type { SearchResult } from "@/types";

export const Route = createFileRoute("/search")({
  component: SearchPage,
});

function SearchPage() {
  const [query, setQuery] = useState("");
  const [errorCode, setErrorCode] = useState("");
  const [equipment, setEquipment] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);

  const mutation = useMutation({
    mutationFn: () => searchService.search({ query, errorCode, equipment }),
    onSuccess: setResults,
  });

  return (
    <AppShell title="Pesquisa Inteligente" subtitle="Busque na base de conhecimento por qualquer termo">
      <Card>
        <CardContent className="p-6">
          <form
            className="grid gap-3 md:grid-cols-[1fr,180px,220px,auto]"
            onSubmit={(e) => {
              e.preventDefault();
              mutation.mutate();
            }}
          >
            <div className="grid gap-1.5">
              <Label>Descrição / Palavra-chave / Mensagem de erro</Label>
              <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Ex: impressora não imprime" />
            </div>
            <div className="grid gap-1.5">
              <Label>Código do erro</Label>
              <Input value={errorCode} onChange={(e) => setErrorCode(e.target.value)} placeholder="0x610000f6" />
            </div>
            <div className="grid gap-1.5">
              <Label>Equipamento</Label>
              <Input value={equipment} onChange={(e) => setEquipment(e.target.value)} placeholder="HP LaserJet" />
            </div>
            <div className="flex items-end">
              <Button type="submit" disabled={mutation.isPending} className="w-full md:w-auto">
                {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <SearchIcon className="h-4 w-4" />}
                Pesquisar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {results.map((r) => (
          <Card key={r.id} className="transition-colors hover:border-primary/50">
            <CardContent className="p-5">
              <div className="mb-2 flex items-center gap-2">
                <Badge variant="secondary" className="capitalize">{r.category}</Badge>
                {r.equipment && <Badge variant="outline">{r.equipment}</Badge>}
              </div>
              <h3 className="mb-1 font-medium">{r.title}</h3>
              <p className="line-clamp-3 text-sm text-muted-foreground">{r.summary}</p>
              <div className="mt-4">
                <Button size="sm" variant="secondary">Abrir</Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {mutation.isSuccess && results.length === 0 && (
          <p className="text-sm text-muted-foreground">Nenhum resultado.</p>
        )}
      </div>
    </AppShell>
  );
}

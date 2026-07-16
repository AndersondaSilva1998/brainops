import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Clock } from "lucide-react";
import { useState } from "react";
import { conversationsService } from "@/services/conversations";

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export const Route = createFileRoute("/historico")({
  component: HistoricoPage,
});

function HistoricoPage() {
  const [q, setQ] = useState("");
  const { data = [], isLoading } = useQuery({
    queryKey: ["conversations", "list"],
    queryFn: () => conversationsService.list(),
  });

  const filtered = data.filter((item) =>
    [item.title, item.lastUserMessage ?? "", item.lastAssistantMessage ?? ""]
      .join(" ")
      .toLowerCase()
      .includes(q.toLowerCase()),
  );

  return (
    <AppShell title="Histórico" subtitle="Todas as consultas realizadas na plataforma">
      <div className="mb-4 relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar conversa"
          className="pl-9"
        />
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Carregando histórico...</p>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nenhuma conversa registrada.</p>
      ) : (
        <Card>
          <CardContent className="divide-y p-0">
            {filtered.map((item) => (
              <div key={item.id} className="p-5">
                <div className="mb-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">{formatDate(item.updatedAt)}</span>
                  <span>· {item.messageCount} mensagens</span>
                  <Badge variant="secondary">Conversa</Badge>
                </div>
                <p className="font-medium">{item.title}</p>
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                  {item.lastUserMessage ?? "Sem mensagem inicial."}
                </p>
                {item.lastAssistantMessage && (
                  <p className="mt-2 text-sm text-muted-foreground">
                    Resposta: {item.lastAssistantMessage}
                  </p>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </AppShell>
  );
}

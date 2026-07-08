import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ListChecks, Plus, Search, Clock } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/procedimentos")({
  component: ProcedimentosPage,
});

const items = [
  { id: "p-1", title: "Reset de senha do Active Directory", steps: 4, time: "5 min", category: "Acesso", tags: ["ad", "senha"], version: "v1.2" },
  { id: "p-2", title: "Limpar fila de impressão travada", steps: 6, time: "8 min", category: "Impressoras", tags: ["spooler"], version: "v2.0" },
  { id: "p-3", title: "Instalar VPN Cisco AnyConnect", steps: 10, time: "15 min", category: "Rede", tags: ["vpn"], version: "v1.4" },
  { id: "p-4", title: "Reprovisionar notebook Dell", steps: 12, time: "45 min", category: "Hardware", tags: ["dell"], version: "v3.1" },
];

function ProcedimentosPage() {
  const [q, setQ] = useState("");
  const filtered = items.filter((i) => i.title.toLowerCase().includes(q.toLowerCase()));
  return (
    <AppShell
      title="Procedimentos"
      subtitle="Guias operacionais passo a passo"
      actions={<Button size="sm"><Plus className="h-4 w-4" /> Novo procedimento</Button>}
    >
      <div className="mb-4 relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar procedimento" className="pl-9" />
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((i) => (
          <Card key={i.id} className="transition-colors hover:border-primary/50">
            <CardContent className="p-5">
              <div className="mb-3 flex items-start justify-between">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <ListChecks className="h-4 w-4" />
                </div>
                <Badge variant="outline">{i.version}</Badge>
              </div>
              <h3 className="font-medium">{i.title}</h3>
              <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                <span>{i.steps} passos</span>
                <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {i.time}</span>
                <Badge variant="secondary" className="text-[10px]">{i.category}</Badge>
              </div>
              <div className="mt-3 flex flex-wrap gap-1">
                {i.tags.map((t) => <span key={t} className="rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground">#{t}</span>)}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </AppShell>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertOctagon, Plus, Search } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/erros-conhecidos")({
  component: ErrosConhecidosPage,
});

const items = [
  { id: "e-1", code: "0x610000f6", title: "Impressora HP trava a fila", priority: "alta", impact: "Média", equipment: "HP LaserJet Pro M404" },
  { id: "e-2", code: "STOP 0x0000007B", title: "BSOD no boot após atualização", priority: "crítica", impact: "Alta", equipment: "Notebook Dell 5420" },
  { id: "e-3", code: "ERR_CONN_TIMEOUT", title: "VPN não conecta em redes 4G", priority: "média", impact: "Média", equipment: "Cisco AnyConnect" },
  { id: "e-4", code: "0x800CCC0E", title: "Outlook não envia e-mails", priority: "média", impact: "Média", equipment: "Outlook 365" },
];

const tone: Record<string, string> = {
  crítica: "bg-red-500/10 text-red-500 border-red-500/20",
  alta: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  média: "bg-blue-500/10 text-blue-500 border-blue-500/20",
};

function ErrosConhecidosPage() {
  const [q, setQ] = useState("");
  const filtered = items.filter((i) => (i.title + i.code).toLowerCase().includes(q.toLowerCase()));
  return (
    <AppShell
      title="Erros Conhecidos"
      subtitle="Catálogo de erros e soluções aplicadas"
      actions={<Button size="sm"><Plus className="h-4 w-4" /> Novo erro</Button>}
    >
      <div className="mb-4 relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por código ou título" className="pl-9" />
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {filtered.map((i) => (
          <Card key={i.id} className="transition-colors hover:border-primary/50">
            <CardContent className="p-5">
              <div className="mb-3 flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500">
                    <AlertOctagon className="h-4 w-4" />
                  </div>
                  <div>
                    <code className="rounded bg-muted px-1.5 py-0.5 text-xs">{i.code}</code>
                    <h3 className="mt-1 font-medium leading-tight">{i.title}</h3>
                  </div>
                </div>
                <Badge variant="outline" className={`capitalize ${tone[i.priority] ?? ""}`}>{i.priority}</Badge>
              </div>
              <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                <span>Impacto: {i.impact}</span>
                <span>·</span>
                <span>Equipamento: {i.equipment}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </AppShell>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MonitorSmartphone, Plus, Search, MapPin } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/equipamentos")({
  component: EquipamentosPage,
});

const items = [
  { id: "eq-1", name: "HP LaserJet Pro M404", brand: "HP", model: "M404", os: "-", category: "Impressora", asset: "TI-00421", location: "TI · 3º andar" },
  { id: "eq-2", name: "Notebook Dell Latitude 5420", brand: "Dell", model: "5420", os: "Windows 11", category: "Notebook", asset: "TI-01102", location: "Financeiro" },
  { id: "eq-3", name: "Switch Cisco Catalyst 2960", brand: "Cisco", model: "WS-C2960", os: "IOS 15", category: "Rede", asset: "REDE-0031", location: "Datacenter" },
  { id: "eq-4", name: "Servidor Dell PowerEdge R740", brand: "Dell", model: "R740", os: "Ubuntu 22.04", category: "Servidor", asset: "SRV-0007", location: "Datacenter" },
];

function EquipamentosPage() {
  const [q, setQ] = useState("");
  const filtered = items.filter((i) => (i.name + i.asset).toLowerCase().includes(q.toLowerCase()));
  return (
    <AppShell
      title="Equipamentos"
      subtitle="Inventário técnico da operação"
      actions={<Button size="sm"><Plus className="h-4 w-4" /> Novo equipamento</Button>}
    >
      <div className="mb-4 relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar equipamento ou patrimônio" className="pl-9" />
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((i) => (
          <Card key={i.id} className="transition-colors hover:border-primary/50">
            <CardContent className="p-5">
              <div className="mb-3 flex items-start justify-between">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <MonitorSmartphone className="h-4 w-4" />
                </div>
                <Badge variant="outline">{i.asset}</Badge>
              </div>
              <h3 className="font-medium">{i.name}</h3>
              <p className="text-xs text-muted-foreground">{i.brand} · {i.model} · {i.os}</p>
              <div className="mt-3 flex items-center gap-3 text-xs">
                <Badge variant="secondary">{i.category}</Badge>
                <span className="flex items-center gap-1 text-muted-foreground"><MapPin className="h-3 w-3" /> {i.location}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </AppShell>
  );
}

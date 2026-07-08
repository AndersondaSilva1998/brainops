import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MonitorSmartphone, Plus, Search, MapPin } from "lucide-react";
import { useMemo, useState } from "react";
import { knowledgeBaseService } from "@/services/knowledgeBase";

export const Route = createFileRoute("/equipamentos")({
  component: EquipamentosPage,
});

interface EquipmentSummary {
  name: string;
  count: number;
  latestEntry: string;
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function EquipamentosPage() {
  const [q, setQ] = useState("");
  const { data = [] } = useQuery({ queryKey: ["knowledge", "list"], queryFn: () => knowledgeBaseService.list() });

  const equipmentList = useMemo(() => {
    const map = new Map<string, EquipmentSummary>();
    data.forEach((entry) => {
      if (!entry.equipment) return;
      const existing = map.get(entry.equipment);
      const createdAt = entry.updatedAt || entry.createdAt;
      if (!existing) {
        map.set(entry.equipment, { name: entry.equipment, count: 1, latestEntry: createdAt });
      } else {
        map.set(entry.equipment, {
          ...existing,
          count: existing.count + 1,
          latestEntry: createdAt > existing.latestEntry ? createdAt : existing.latestEntry,
        });
      }
    });
    return Array.from(map.values()).sort((a, b) => b.count - a.count);
  }, [data]);

  const filtered = equipmentList.filter((item) => item.name.toLowerCase().includes(q.toLowerCase()));

  return (
    <AppShell
      title="Equipamentos"
      subtitle="Equipamentos mencionados na base de conhecimento"
      actions={<Button size="sm"><Plus className="h-4 w-4" /> Novo equipamento</Button>}
    >
      <div className="mb-4 relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar equipamento" className="pl-9" />
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nenhum equipamento encontrado na base de conhecimento.</p>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((item) => (
            <Card key={item.name} className="transition-colors hover:border-primary/50">
              <CardContent className="p-5">
                <div className="mb-3 flex items-start justify-between">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <MonitorSmartphone className="h-4 w-4" />
                  </div>
                  <Badge variant="outline">{item.count} ocorrências</Badge>
                </div>
                <h3 className="font-medium">{item.name}</h3>
                <p className="mt-2 text-xs text-muted-foreground">Última referência: {formatDate(item.latestEntry)}</p>
                <div className="mt-3 flex items-center gap-3 text-xs">
                  <Badge variant="secondary">Inventário</Badge>
                  <span className="flex items-center gap-1 text-muted-foreground"><MapPin className="h-3 w-3" /> Base de conhecimento</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </AppShell>
  );
}

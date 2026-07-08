import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Plus, Search } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/usuarios")({
  component: UsuariosPage,
});

const users = [
  { id: "u-1", name: "Ana Souza", email: "ana@empresa.com", role: "Admin", dept: "TI", active: true },
  { id: "u-2", name: "Carlos Mota", email: "carlos@empresa.com", role: "Editor", dept: "Suporte", active: true },
  { id: "u-3", name: "Beatriz Lima", email: "bea@empresa.com", role: "Leitor", dept: "Financeiro", active: true },
  { id: "u-4", name: "João Pereira", email: "joao@empresa.com", role: "Editor", dept: "TI", active: false },
];

function UsuariosPage() {
  const [q, setQ] = useState("");
  const filtered = users.filter((u) => (u.name + u.email).toLowerCase().includes(q.toLowerCase()));
  return (
    <AppShell
      title="Usuários"
      subtitle="Gestão de acessos e permissões"
      actions={<Button size="sm"><Plus className="h-4 w-4" /> Novo usuário</Button>}
    >
      <div className="mb-4 relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar usuário" className="pl-9" />
      </div>
      <Card>
        <CardContent className="divide-y p-0">
          {filtered.map((u) => (
            <div key={u.id} className="flex items-center gap-4 p-4">
              <Avatar>
                <AvatarFallback>{u.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{u.name}</p>
                <p className="text-xs text-muted-foreground">{u.email} · {u.dept}</p>
              </div>
              <Badge variant="secondary">{u.role}</Badge>
              <Badge variant="outline" className={u.active ? "border-emerald-500/20 text-emerald-500" : "border-muted"}>
                {u.active ? "Ativo" : "Inativo"}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </AppShell>
  );
}

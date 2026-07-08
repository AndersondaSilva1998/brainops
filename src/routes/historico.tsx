import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, User, Clock } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/historico")({
  component: HistoricoPage,
});

const items = [
  { id: "h-1", user: "Ana Souza", question: "Impressora HP não imprime, erro 0x610000f6", answer: "Reiniciar Spooler e limpar fila...", date: "hoje 14:32", time: "1.2s", category: "Impressoras", docs: 3 },
  { id: "h-2", user: "Carlos Mota", question: "Como resetar senha AD?", answer: "Abrir ADUC → localizar usuário...", date: "hoje 11:04", time: "0.9s", category: "Acesso", docs: 2 },
  { id: "h-3", user: "Beatriz Lima", question: "VPN Cisco AnyConnect não conecta", answer: "Verificar rede 4G / DNS...", date: "ontem 17:22", time: "1.7s", category: "Rede", docs: 4 },
  { id: "h-4", user: "João Pereira", question: "Outlook trava ao abrir anexos", answer: "Rodar SCANPST e reparo do Office...", date: "ontem 09:11", time: "1.1s", category: "Office", docs: 2 },
];

function HistoricoPage() {
  const [q, setQ] = useState("");
  const filtered = items.filter((i) => (i.question + i.user).toLowerCase().includes(q.toLowerCase()));
  return (
    <AppShell title="Histórico" subtitle="Todas as consultas realizadas na plataforma">
      <div className="mb-4 relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar consulta ou usuário" className="pl-9" />
      </div>

      <Card>
        <CardContent className="divide-y p-0">
          {filtered.map((i) => (
            <div key={i.id} className="p-5">
              <div className="mb-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><User className="h-3 w-3" /> {i.user}</span>
                <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {i.date}</span>
                <span>· {i.time}</span>
                <Badge variant="secondary">{i.category}</Badge>
                <Badge variant="outline">{i.docs} docs</Badge>
              </div>
              <p className="font-medium">{i.question}</p>
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{i.answer}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </AppShell>
  );
}

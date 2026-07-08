import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Upload, FileText, CheckCircle2, Clock, AlertCircle, File } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/uploads")({
  component: UploadsPage,
});

type Status = "processado" | "aguardando" | "erro";

interface Doc {
  id: string;
  name: string;
  type: string;
  size: string;
  date: string;
  status: Status;
}

const initial: Doc[] = [
  { id: "u-1", name: "Manual HP LaserJet.pdf", type: "PDF", size: "3.4 MB", date: "hoje", status: "processado" },
  { id: "u-2", name: "Procedimento VPN.docx", type: "Word", size: "128 KB", date: "hoje", status: "aguardando" },
  { id: "u-3", name: "Inventário TI.xlsx", type: "Excel", size: "802 KB", date: "ontem", status: "processado" },
  { id: "u-4", name: "diagrama-rede.png", type: "Imagem", size: "1.1 MB", date: "2 dias", status: "erro" },
];

const statusMeta: Record<Status, { icon: typeof CheckCircle2; label: string; cls: string }> = {
  processado: { icon: CheckCircle2, label: "Processado", cls: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" },
  aguardando: { icon: Clock, label: "Aguardando", cls: "text-amber-500 bg-amber-500/10 border-amber-500/20" },
  erro: { icon: AlertCircle, label: "Erro", cls: "text-red-500 bg-red-500/10 border-red-500/20" },
};

function UploadsPage() {
  const [docs] = useState<Doc[]>(initial);
  const [drag, setDrag] = useState(false);
  return (
    <AppShell title="Uploads" subtitle="Gerenciamento de documentos para RAG">
      <Card>
        <CardContent className="p-6">
          <div
            onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
            onDragLeave={() => setDrag(false)}
            onDrop={(e) => { e.preventDefault(); setDrag(false); }}
            className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-10 text-center transition-colors ${
              drag ? "border-primary bg-primary/5" : "border-border"
            }`}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Upload className="h-6 w-6" />
            </div>
            <p className="mt-3 font-medium">Arraste arquivos ou clique para enviar</p>
            <p className="text-xs text-muted-foreground">PDF, Word, Excel, TXT, Markdown, Imagem — até 50 MB</p>
            <Button className="mt-4" size="sm"><Upload className="h-4 w-4" /> Selecionar arquivos</Button>
            <div className="mt-4 flex flex-wrap justify-center gap-2 text-[11px] text-muted-foreground">
              {["PDF", "DOCX", "XLSX", "TXT", "MD", "PNG/JPG"].map((f) => (
                <span key={f} className="rounded border px-2 py-0.5">{f}</span>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="mt-6">
        <h2 className="mb-3 text-sm font-semibold text-muted-foreground">Documentos enviados</h2>
        <Card>
          <CardContent className="divide-y p-0">
            {docs.map((d) => {
              const s = statusMeta[d.status];
              return (
                <div key={d.id} className="flex items-center gap-4 p-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{d.name}</p>
                    <p className="text-xs text-muted-foreground">{d.type} · {d.size} · {d.date}</p>
                  </div>
                  <Badge variant="outline" className={s.cls}>
                    <s.icon className="h-3 w-3" /> {s.label}
                  </Badge>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      <div className="mt-6">
        <Card>
          <CardContent className="p-5">
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-medium"><File className="h-4 w-4" /> Índice vetorial (embeddings)</div>
              <span className="text-xs text-muted-foreground">Fase 5 — aguardando backend</span>
            </div>
            <Progress value={38} />
            <p className="mt-2 text-xs text-muted-foreground">
              O processamento e geração de embeddings serão feitos pela API própria + Ollama.
            </p>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}

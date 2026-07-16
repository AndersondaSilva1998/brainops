import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Upload, FileText, CheckCircle2, Clock, AlertCircle, File } from "lucide-react";
import { useState } from "react";
import { uploadsService } from "@/services/uploads";

export const Route = createFileRoute("/uploads")({
  component: UploadsPage,
});

type Status = "pendente" | "processando" | "concluido" | "erro";

interface UploadItem {
  id: string;
  name: string;
  type: string;
  size: string;
  date: string;
  status: Status;
}

const statusMeta: Record<Status, { icon: typeof CheckCircle2; label: string; cls: string }> = {
  pendente: {
    icon: Clock,
    label: "Pendente",
    cls: "text-amber-500 bg-amber-500/10 border-amber-500/20",
  },
  processando: {
    icon: Clock,
    label: "Processando",
    cls: "text-amber-500 bg-amber-500/10 border-amber-500/20",
  },
  concluido: {
    icon: CheckCircle2,
    label: "Concluído",
    cls: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
  },
  erro: { icon: AlertCircle, label: "Erro", cls: "text-red-500 bg-red-500/10 border-red-500/20" },
};

function formatBytes(bytes: number | null) {
  if (!bytes || bytes <= 0) return "-";
  const units = ["B", "KB", "MB", "GB"];
  let value = bytes;
  let index = 0;
  while (value >= 1024 && index < units.length - 1) {
    value /= 1024;
    index += 1;
  }
  return `${value.toFixed(1)} ${units[index]}`;
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function UploadsPage() {
  const [drag, setDrag] = useState(false);
  const { data = [], isLoading } = useQuery({
    queryKey: ["uploads", "list"],
    queryFn: () => uploadsService.list(),
  });

  const items: UploadItem[] = data.map((upload) => ({
    id: upload.id,
    name: upload.fileName,
    type: upload.downloadUrl ? "Arquivo" : "Desconhecido",
    size: formatBytes(upload.sizeBytes),
    date: formatDate(upload.createdAt),
    status: upload.status,
  }));

  return (
    <AppShell title="Uploads" subtitle="Gerenciamento de documentos para RAG">
      <Card>
        <CardContent className="p-6">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDrag(true);
            }}
            onDragLeave={() => setDrag(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDrag(false);
            }}
            className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-10 text-center transition-colors ${
              drag ? "border-primary bg-primary/5" : "border-border"
            }`}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Upload className="h-6 w-6" />
            </div>
            <p className="mt-3 font-medium">Arraste arquivos ou clique para enviar</p>
            <p className="text-xs text-muted-foreground">
              PDF, Word, Excel, TXT, Markdown, Imagem — até 50 MB
            </p>
            <Button className="mt-4" size="sm">
              <Upload className="h-4 w-4" /> Selecionar arquivos
            </Button>
            <div className="mt-4 flex flex-wrap justify-center gap-2 text-[11px] text-muted-foreground">
              {["PDF", "DOCX", "XLSX", "TXT", "MD", "PNG/JPG"].map((f) => (
                <span key={f} className="rounded border px-2 py-0.5">
                  {f}
                </span>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="mt-6">
        <h2 className="mb-3 text-sm font-semibold text-muted-foreground">Documentos enviados</h2>
        <Card>
          <CardContent className="divide-y p-0">
            {isLoading ? (
              <p className="p-4 text-sm text-muted-foreground">Carregando uploads...</p>
            ) : items.length === 0 ? (
              <p className="p-4 text-sm text-muted-foreground">Nenhum upload registrado.</p>
            ) : (
              items.map((d) => {
                const s = statusMeta[d.status];
                return (
                  <div key={d.id} className="flex items-center gap-4 p-4">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{d.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {d.type} · {d.size} · {d.date}
                      </p>
                    </div>
                    <Badge variant="outline" className={s.cls}>
                      <s.icon className="h-3 w-3" /> {s.label}
                    </Badge>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mt-6">
        <Card>
          <CardContent className="p-5">
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-medium">
                <File className="h-4 w-4" /> Índice vetorial (embeddings)
              </div>
              <span className="text-xs text-muted-foreground">Fase 5 — aguardando backend</span>
            </div>
            <Progress value={38} />
            <p className="mt-2 text-xs text-muted-foreground">
              O processamento e geração de embeddings serão feitos pela API própria.
            </p>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}

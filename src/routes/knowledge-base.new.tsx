import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { knowledgeBaseService } from "@/services/knowledgeBase";
import type { KnowledgeCategory, KnowledgeStatus } from "@/types";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/knowledge-base/new")({
  component: NewKnowledgePage,
});

const categories: KnowledgeCategory[] = ["procedimento", "erro", "documentacao", "manual", "outro"];
const statuses: KnowledgeStatus[] = ["draft", "published", "archived"];

function NewKnowledgePage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [form, setForm] = useState({
    title: "",
    category: "erro" as KnowledgeCategory,
    equipment: "",
    system: "",
    problemDescription: "",
    symptoms: "",
    solutionSteps: "",
    notes: "",
    keywords: "",
    tags: "",
    status: "draft" as KnowledgeStatus,
    author: "Equipe TI",
  });

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const mutation = useMutation({
    mutationFn: () =>
      knowledgeBaseService.create({
        title: form.title,
        category: form.category,
        equipment: form.equipment || undefined,
        system: form.system || undefined,
        problemDescription: form.problemDescription,
        symptoms: form.symptoms || undefined,
        solutionSteps: form.solutionSteps,
        notes: form.notes || undefined,
        keywords: form.keywords
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        tags: form.tags
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        attachments: [],
        status: form.status,
        author: form.author,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["kb"] });
      toast.success("Registro criado");
      navigate({ to: "/knowledge-base" });
    },
    onError: () => toast.error("Falha ao criar registro"),
  });

  return (
    <AppShell title="Novo Registro" subtitle="Cadastrar procedimento, erro ou documentação">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          mutation.mutate();
        }}
      >
        <Card>
          <CardContent className="grid gap-4 p-6 md:grid-cols-2">
            <Field label="Título" className="md:col-span-2">
              <Input value={form.title} onChange={(e) => set("title", e.target.value)} required />
            </Field>

            <Field label="Categoria">
              <Select
                value={form.category}
                onValueChange={(v) => set("category", v as KnowledgeCategory)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c} value={c} className="capitalize">
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label="Status">
              <Select
                value={form.status}
                onValueChange={(v) => set("status", v as KnowledgeStatus)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map((s) => (
                    <SelectItem key={s} value={s} className="capitalize">
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label="Equipamento">
              <Input value={form.equipment} onChange={(e) => set("equipment", e.target.value)} />
            </Field>
            <Field label="Sistema">
              <Input value={form.system} onChange={(e) => set("system", e.target.value)} />
            </Field>

            <Field label="Descrição do problema" className="md:col-span-2">
              <Textarea
                rows={3}
                value={form.problemDescription}
                onChange={(e) => set("problemDescription", e.target.value)}
                required
              />
            </Field>

            <Field label="Sintomas" className="md:col-span-2">
              <Textarea
                rows={2}
                value={form.symptoms}
                onChange={(e) => set("symptoms", e.target.value)}
              />
            </Field>

            <Field label="Solução (passo a passo)" className="md:col-span-2">
              <Textarea
                rows={5}
                value={form.solutionSteps}
                onChange={(e) => set("solutionSteps", e.target.value)}
                required
              />
            </Field>

            <Field label="Observações" className="md:col-span-2">
              <Textarea
                rows={2}
                value={form.notes}
                onChange={(e) => set("notes", e.target.value)}
              />
            </Field>

            <Field label="Palavras-chave (separadas por vírgula)">
              <Input value={form.keywords} onChange={(e) => set("keywords", e.target.value)} />
            </Field>
            <Field label="Tags (separadas por vírgula)">
              <Input value={form.tags} onChange={(e) => set("tags", e.target.value)} />
            </Field>

            <Field label="Autor">
              <Input value={form.author} onChange={(e) => set("author", e.target.value)} />
            </Field>
            <Field label="Anexos">
              <Input type="file" multiple disabled />
              <p className="mt-1 text-xs text-muted-foreground">
                Upload será habilitado com o Supabase Storage.
              </p>
            </Field>
          </CardContent>
        </Card>

        <div className="mt-4 flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => history.back()}>
            Cancelar
          </Button>
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </form>
    </AppShell>
  );
}

function Field({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`grid gap-1.5 ${className}`}>
      <Label>{label}</Label>
      {children}
    </div>
  );
}

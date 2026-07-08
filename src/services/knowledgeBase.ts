import type { KnowledgeEntry } from "@/types";
import { supabase, isSupabaseConfigured } from "@/services/supabase";

const mapRowToKnowledgeEntry = (row: any): KnowledgeEntry => ({
  id: row.id,
  title: row.titulo,
  category: row.categoria,
  equipment: row.equipamento ?? undefined,
  system: row.sistema ?? undefined,
  problemDescription: row.descricao_problema,
  symptoms: row.sintomas ?? undefined,
  solutionSteps: row.passos_solucao,
  notes: row.observacoes ?? undefined,
  keywords: row.palavras_chave ?? [],
  tags: row.tags ?? [],
  attachments: row.anexos ?? [],
  status: row.status,
  createdAt: row.criado_em,
  updatedAt: row.atualizado_em,
  author: row.autor,
});

export const knowledgeBaseService = {
  async list(): Promise<KnowledgeEntry[]> {
    if (!isSupabaseConfigured || !supabase) {
      return [];
    }

    const { data, error } = await supabase
      .from("bases_conhecimento")
      .select("*")
      .order("criado_em", { ascending: false });

    if (error) {
      console.error("Supabase error list knowledge base:", error);
      return [];
    }

    return (data ?? []).map(mapRowToKnowledgeEntry);
  },
  async get(id: string): Promise<KnowledgeEntry | null> {
    if (!isSupabaseConfigured || !supabase) {
      return null;
    }

    const { data, error } = await supabase
      .from("bases_conhecimento")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Supabase error get knowledge entry:", error);
      return null;
    }

    return data ? mapRowToKnowledgeEntry(data) : null;
  },
  async create(
    entry: Omit<KnowledgeEntry, "id" | "createdAt" | "updatedAt">,
  ): Promise<KnowledgeEntry> {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error("Supabase não está configurado");
    }

    const { data, error } = await supabase
      .from("bases_conhecimento")
      .insert([{ ...entry }])
      .select()
      .single();

    if (error || !data) {
      console.error("Supabase error create knowledge entry:", error);
      throw new Error(error?.message ?? "Erro ao criar registro de conhecimento");
    }

    return mapRowToKnowledgeEntry(data);
  },
  async remove(id: string): Promise<void> {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error("Supabase não está configurado");
    }

    const { error } = await supabase
      .from("bases_conhecimento")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Supabase error delete knowledge entry:", error);
      throw new Error(error.message);
    }
  },
};

import type { KnowledgeEntry } from "@/types";
import { supabase, isSupabaseConfigured } from "@/services/supabase";

const MOCK: KnowledgeEntry[] = [
  {
    id: "kb-1",
    title: "Impressora HP LaserJet não imprime — erro 0x610000f6",
    category: "erro",
    equipment: "HP LaserJet Pro M404",
    system: "Windows 11",
    problemDescription:
      "Impressora acusa erro 0x610000f6 ao enviar trabalho de impressão.",
    symptoms: "Fila de impressão trava. LED âmbar piscando.",
    solutionSteps:
      "1. Parar serviço Spooler\n2. Limpar C:\\Windows\\System32\\spool\\PRINTERS\n3. Reiniciar Spooler\n4. Reinstalar driver universal HP",
    notes: "Ocorre após atualização KB5039212.",
    keywords: ["impressora", "spooler", "0x610000f6"],
    tags: ["hp", "windows"],
    attachments: [],
    status: "published",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    author: "Equipe TI",
  },
  {
    id: "kb-2",
    title: "Procedimento — Reset de senha do AD",
    category: "procedimento",
    equipment: "-",
    system: "Active Directory",
    problemDescription: "Usuário esqueceu a senha do domínio.",
    symptoms: "Falha de login em estações Windows.",
    solutionSteps:
      "1. Validar identidade do usuário\n2. Abrir ADUC\n3. Reset password + marcar 'user must change at next logon'",
    keywords: ["senha", "ad", "reset"],
    tags: ["ad", "acesso"],
    attachments: [],
    status: "published",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    author: "Equipe TI",
  },
];

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
      return MOCK;
    }

    const { data, error } = await supabase
      .from("bases_conhecimento")
      .select("*")
      .order("criado_em", { ascending: false });

    if (error) {
      console.error("Supabase error list knowledge base:", error);
      return MOCK;
    }

    return (data ?? []).map(mapRowToKnowledgeEntry);
  },
  async get(id: string): Promise<KnowledgeEntry | null> {
    if (!isSupabaseConfigured || !supabase) {
      return MOCK.find((k) => k.id === id) ?? null;
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
      const now = new Date().toISOString();
      const created: KnowledgeEntry = {
        ...entry,
        id: `kb-${Math.random().toString(36).slice(2, 9)}`,
        createdAt: now,
        updatedAt: now,
      };
      MOCK.unshift(created);
      return created;
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
      const idx = MOCK.findIndex((k) => k.id === id);
      if (idx >= 0) MOCK.splice(idx, 1);
      return;
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

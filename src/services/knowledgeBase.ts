import type { KnowledgeEntry } from "@/types";

// Mock in-memory data for Phase 1. Replace with Supabase queries in Phase 2.
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

export const knowledgeBaseService = {
  async list(): Promise<KnowledgeEntry[]> {
    // TODO: substituir por supabase.from('knowledge_entries').select('*')
    return MOCK;
  },
  async get(id: string): Promise<KnowledgeEntry | null> {
    return MOCK.find((k) => k.id === id) ?? null;
  },
  async create(
    entry: Omit<KnowledgeEntry, "id" | "createdAt" | "updatedAt">,
  ): Promise<KnowledgeEntry> {
    const now = new Date().toISOString();
    const created: KnowledgeEntry = {
      ...entry,
      id: `kb-${Math.random().toString(36).slice(2, 9)}`,
      createdAt: now,
      updatedAt: now,
    };
    MOCK.unshift(created);
    return created;
  },
  async remove(id: string): Promise<void> {
    const idx = MOCK.findIndex((k) => k.id === id);
    if (idx >= 0) MOCK.splice(idx, 1);
  },
};

import { supabase, isSupabaseConfigured } from "@/services/supabase";

export interface DocumentRecord {
  id: string;
  name: string;
  contentType: string;
  sizeBytes: number | null;
  downloadUrl?: string;
  storagePath?: string;
  createdAt: string;
  updatedAt: string;
}

interface DocumentRow {
  id: string;
  nome: string;
  tipo_conteudo?: string | null;
  tamanho_bytes?: number | null;
  url_download?: string | null;
  caminho_storage?: string | null;
  criado_em: string;
  atualizado_em: string;
}

const mapDocument = (row: DocumentRow): DocumentRecord => ({
  id: row.id,
  name: row.nome,
  contentType: row.tipo_conteudo ?? "Desconhecido",
  sizeBytes: row.tamanho_bytes ?? null,
  downloadUrl: row.url_download ?? undefined,
  storagePath: row.caminho_storage ?? undefined,
  createdAt: row.criado_em,
  updatedAt: row.atualizado_em,
});

export const documentsService = {
  async list(): Promise<DocumentRecord[]> {
    if (!isSupabaseConfigured || !supabase) {
      return [];
    }

    const { data, error } = await supabase
      .from("documentos")
      .select("*")
      .order("criado_em", { ascending: false });

    if (error) {
      console.error("Supabase error list documents:", error);
      return [];
    }

    return (data ?? []).map(mapDocument);
  },
};

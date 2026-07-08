import { supabase, isSupabaseConfigured } from "@/services/supabase";

export type UploadStatus = "pendente" | "processando" | "concluido" | "erro";

export interface UploadRecord {
  id: string;
  fileName: string;
  status: UploadStatus;
  message?: string;
  storagePath?: string;
  downloadUrl?: string;
  createdAt: string;
  updatedAt: string;
}

const mapUpload = (row: any): UploadRecord => ({
  id: row.id,
  fileName: row.nome_arquivo,
  status: row.status,
  message: row.mensagem ?? undefined,
  storagePath: row.caminho_storage ?? undefined,
  downloadUrl: row.url_download ?? undefined,
  createdAt: row.criado_em,
  updatedAt: row.atualizado_em,
});

export const uploadsService = {
  async list(): Promise<UploadRecord[]> {
    if (!isSupabaseConfigured || !supabase) {
      return [];
    }

    const { data, error } = await supabase
      .from("uploads")
      .select("*")
      .order("criado_em", { ascending: false });

    if (error) {
      console.error("Supabase error list uploads:", error);
      return [];
    }

    return (data ?? []).map(mapUpload);
  },
};

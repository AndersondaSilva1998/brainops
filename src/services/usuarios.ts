import { supabase, isSupabaseConfigured } from "@/services/supabase";

export type Usuario = {
  id: string;
  email: string;
  nome: string;
  papel: string;
  criado_em: string | null;
};

export async function listUsuarios(): Promise<Usuario[]> {
  if (!isSupabaseConfigured || !supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("usuarios")
    .select("id, email, nome, papel, criado_em")
    .order("criado_em", { ascending: false });

  if (error) {
    console.error("Erro ao listar usuários:", error.message);
    return [];
  }

  return data ?? [];
}

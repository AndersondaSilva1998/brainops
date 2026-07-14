import { supabase, isSupabaseConfigured } from "@/services/supabase";
import type { Session, User } from "@supabase/supabase-js";

export async function getCurrentSession(): Promise<Session | null> {
  if (!isSupabaseConfigured || !supabase) {
    return null;
  }

  const { data, error } = await supabase.auth.getSession();
  if (error) {
    console.error("Erro ao obter sessão do Supabase:", error.message);
    return null;
  }

  return data.session;
}

export async function getCurrentUser(): Promise<User | null> {
  const session = await getCurrentSession();
  return session?.user ?? null;
}

export async function signInWithPassword(email: string, password: string) {
  if (!isSupabaseConfigured || !supabase) {
    return { error: new Error("Supabase não está configurado") };
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  return { data, error };
}

export async function signOut() {
  if (!isSupabaseConfigured || !supabase) {
    return { error: new Error("Supabase não está configurado") };
  }

  return await supabase.auth.signOut();
}

export function isDeveloper(user: User | null | undefined) {
  return (
    Boolean(user?.user_metadata?.role === "desenvolvedor") ||
    Boolean(user?.app_metadata?.role === "desenvolvedor")
  );
}

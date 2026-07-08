import { supabase, isSupabaseConfigured } from "@/services/supabase";

export interface ConversationMessageRow {
  id: string;
  conteudo: string;
  papel: "user" | "assistant" | "system";
  criado_em: string;
}

export interface ConversationSummary {
  id: string;
  title: string;
  favorite: boolean;
  createdAt: string;
  updatedAt: string;
  lastUserMessage?: string;
  lastAssistantMessage?: string;
  messageCount: number;
}

export interface ConversationMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt: string;
}

const normalizeMessages = (messages: ConversationMessageRow[]) =>
  messages
    .slice()
    .sort((a, b) => new Date(a.criado_em).getTime() - new Date(b.criado_em).getTime());

export const conversationsService = {
  async list(): Promise<ConversationSummary[]> {
    if (!isSupabaseConfigured || !supabase) {
      return [];
    }

    const { data, error } = await supabase
      .from("conversas")
      .select("id,titulo,favorito,criado_em,atualizado_em,mensagens(id,conteudo,papel,criado_em)")
      .order("atualizado_em", { ascending: false })
      .limit(50);

    if (error) {
      console.error("Supabase error list conversations:", error);
      return [];
    }

    return (data ?? []).map((row: any) => {
      const messages: ConversationMessageRow[] = row.mensagens ?? [];
      const ordered = normalizeMessages(messages);
      const lastUser = ordered.slice().reverse().find((m) => m.papel === "user");
      const lastAssistant = ordered.slice().reverse().find((m) => m.papel === "assistant");

      return {
        id: row.id,
        title: row.titulo,
        favorite: row.favorito,
        createdAt: row.criado_em,
        updatedAt: row.atualizado_em,
        lastUserMessage: lastUser?.conteudo,
        lastAssistantMessage: lastAssistant?.conteudo,
        messageCount: ordered.length,
      };
    });
  },

  async getMessages(conversationId: string): Promise<ConversationMessage[]> {
    if (!isSupabaseConfigured || !supabase) {
      return [];
    }

    const { data, error } = await supabase
      .from<ConversationMessageRow>("mensagens")
      .select("id,conteudo,papel,criado_em")
      .eq("conversa_id", conversationId)
      .order("criado_em", { ascending: true });

    if (error) {
      console.error("Supabase error get conversation messages:", error);
      return [];
    }

    return (data ?? []).map((row) => ({
      id: row.id,
      role: row.papel,
      content: row.conteudo,
      createdAt: row.criado_em,
    }));
  },

  async createConversation(title: string): Promise<ConversationSummary | null> {
    if (!isSupabaseConfigured || !supabase) {
      return null;
    }

    const { data, error } = await supabase
      .from("conversas")
      .insert([{ titulo: title, favorito: false }])
      .select("id,titulo,favorito,criado_em,atualizado_em")
      .single();

    if (error || !data) {
      console.error("Supabase error create conversation:", error);
      return null;
    }

    return {
      id: data.id,
      title: data.titulo,
      favorite: data.favorito,
      createdAt: data.criado_em,
      updatedAt: data.atualizado_em,
      messageCount: 0,
    };
  },

  async addMessage(conversationId: string, message: { role: "user" | "assistant" | "system"; content: string }): Promise<ConversationMessage | null> {
    if (!isSupabaseConfigured || !supabase) {
      return null;
    }

    const { data, error } = await supabase
      .from("mensagens")
      .insert([
        {
          conversa_id: conversationId,
          conteudo: message.content,
          papel: message.role,
        },
      ])
      .select("id,conteudo,papel,criado_em")
      .single();

    if (error || !data) {
      console.error("Supabase error add message:", error);
      return null;
    }

    return {
      id: data.id,
      role: data.papel,
      content: data.conteudo,
      createdAt: data.criado_em,
    };
  },
};

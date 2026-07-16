import { supabase, isSupabaseConfigured } from "@/services/supabase";

export interface AnalyticsOverview {
  queriesCount: number;
  avgResolutionMinutes: number;
  documentsCount: number;
  uploadsCount: number;
}

export interface AnalyticsCategory {
  name: string;
  value: number;
}

export interface AnalyticsDocumentUsage {
  name: string;
  uso: number;
}

interface MessageRow {
  conversa_id: string;
  papel: "user" | "assistant" | "system";
  criado_em: string;
}

interface KnowledgeCategoryRow {
  categoria?: string | null;
}

interface DocumentUsageRow {
  tipo_conteudo?: string | null;
}

const formatDay = (date: Date) =>
  date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });

export const analyticsService = {
  async overview(): Promise<AnalyticsOverview> {
    if (!isSupabaseConfigured || !supabase) {
      return {
        queriesCount: 0,
        avgResolutionMinutes: 0,
        documentsCount: 0,
        uploadsCount: 0,
      };
    }

    const since = new Date();
    since.setDate(since.getDate() - 30);

    const [
      { data: messageRows, error: messagesError },
      { count: docsCount, error: docsError },
      { count: uploadsCount, error: uploadsError },
    ] = await Promise.all([
      supabase
        .from<MessageRow>("mensagens")
        .select("conversa_id,papel,criado_em")
        .gte("criado_em", since.toISOString())
        .order("criado_em", { ascending: true }),
      supabase.from("documentos").select("id", { head: true, count: "exact" }),
      supabase.from("uploads").select("id", { head: true, count: "exact" }),
    ]);

    if (messagesError) console.error("Supabase error analytics messages:", messagesError);
    if (docsError) console.error("Supabase error analytics documents:", docsError);
    if (uploadsError) console.error("Supabase error analytics uploads:", uploadsError);

    const messages = messageRows ?? [];
    const queriesCount = messages.length;

    const resolutionMinutes = messages.reduce((acc, row, index, arr) => {
      if (row.papel !== "user") return acc;
      const nextAssistant = arr
        .slice(index + 1)
        .find((next) => next.conversa_id === row.conversa_id && next.papel === "assistant");
      if (!nextAssistant) return acc;
      const diffMs =
        new Date(nextAssistant.criado_em).getTime() - new Date(row.criado_em).getTime();
      return acc + diffMs / 1000 / 60;
    }, 0);

    const userMessagesWithReply = messages.reduce((count, row, index, arr) => {
      if (row.papel !== "user") return count;
      const hasReply = arr
        .slice(index + 1)
        .some((next) => next.conversa_id === row.conversa_id && next.papel === "assistant");
      return count + (hasReply ? 1 : 0);
    }, 0);

    const avgResolutionMinutes =
      userMessagesWithReply > 0 ? Math.round(resolutionMinutes / userMessagesWithReply) : 0;

    return {
      queriesCount,
      avgResolutionMinutes,
      documentsCount: docsCount ?? 0,
      uploadsCount: uploadsCount ?? 0,
    };
  },

  async queriesTrend(days = 14): Promise<Array<{ day: string; consultas: number }>> {
    if (!isSupabaseConfigured || !supabase) {
      return Array.from({ length: days }, (_, index) => ({
        day: new Date(Date.now() - (days - 1 - index) * 24 * 60 * 60 * 1000).toLocaleDateString(
          "pt-BR",
          { day: "2-digit", month: "2-digit" },
        ),
        consultas: 0,
      }));
    }

    const since = new Date();
    since.setDate(since.getDate() - (days - 1));

    const { data, error } = await supabase
      .from<MessageRow>("mensagens")
      .select("criado_em")
      .gte("criado_em", since.toISOString());

    if (error) {
      console.error("Supabase error analytics trend:", error);
      return [];
    }

    const counts = new Map<string, number>();
    const dayLabels = Array.from({ length: days }, (_, index) => {
      const date = new Date(since.getTime() + index * 24 * 60 * 60 * 1000);
      const label = formatDay(date);
      counts.set(label, 0);
      return label;
    });

    (data ?? []).forEach((row) => {
      const label = formatDay(new Date(row.criado_em));
      if (counts.has(label)) counts.set(label, (counts.get(label) ?? 0) + 1);
    });

    return dayLabels.map((day) => ({ day, consultas: counts.get(day) ?? 0 }));
  },

  async categories(): Promise<AnalyticsCategory[]> {
    if (!isSupabaseConfigured || !supabase) {
      return [];
    }

    const { data, error } = await supabase.from("bases_conhecimento").select("categoria");

    if (error) {
      console.error("Supabase error analytics categories:", error);
      return [];
    }

    const counts = new Map<string, number>();
    (data ?? []).forEach((row: KnowledgeCategoryRow) => {
      const category = row.categoria ?? "outro";
      counts.set(category, (counts.get(category) ?? 0) + 1);
    });

    return Array.from(counts.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  },

  async topDocuments(limit = 5): Promise<AnalyticsDocumentUsage[]> {
    if (!isSupabaseConfigured || !supabase) {
      return [];
    }

    const { data, error } = await supabase.from("documentos").select("tipo_conteudo");

    if (error) {
      console.error("Supabase error analytics top documents:", error);
      return [];
    }

    const counts = new Map<string, number>();
    (data ?? []).forEach((row: DocumentUsageRow) => {
      const name = row.tipo_conteudo ?? "Outro";
      counts.set(name, (counts.get(name) ?? 0) + 1);
    });

    return Array.from(counts.entries())
      .map(([name, uso]) => ({ name, uso }))
      .sort((a, b) => b.uso - a.uso)
      .slice(0, limit);
  },
};

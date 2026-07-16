import { supabase, isSupabaseConfigured } from "./supabase";

interface MessageRow {
  conversa_id: string;
  papel: "user" | "assistant" | "system";
  criado_em: string;
}

interface KnowledgeRecordRow {
  titulo?: string | null;
  equipamento?: string | null;
  categoria?: string | null;
  criado_em?: string;
}

interface UploadRecordRow {
  nome_arquivo?: string | null;
  status?: string | null;
  criado_em?: string;
}

interface ConversationRecordRow {
  titulo?: string | null;
  criado_em?: string;
}

interface ApiCallRow {
  criado_em?: string;
  endpoint?: string | null;
  api?: string | null;
  funcao?: string | null;
  response_ok?: boolean | null;
  response_status?: number | null;
  response_error?: string | null;
}

interface DashboardActivityItem {
  title: string;
  tag: string;
  time: string;
}

const weekdayLabels = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export const dashboardService = {
  async getMetrics() {
    if (!isSupabaseConfigured || !supabase) {
      return {
        documentsCount: 0,
        proceduresCount: 0,
        errorsCount: 0,
        queriesCount: 0,
        avgResolutionMinutes: 0,
      };
    }

    try {
      const [docs, procedures, errors, messagesRes, apiCallsRes] = await Promise.all([
        supabase.from("documentos").select("id", { head: true, count: "exact" }),
        supabase
          .from("bases_conhecimento")
          .select("id", { head: true, count: "exact" })
          .eq("categoria", "procedimento"),
        supabase
          .from("bases_conhecimento")
          .select("id", { head: true, count: "exact" })
          .eq("categoria", "erro"),
        supabase.from<MessageRow>("mensagens").select("conversa_id,papel,criado_em"),
        supabase.from<ApiCallRow>("api_chamadas").select("criado_em"),
      ]);

      const messages = messagesRes.data ?? [];
      const apiCalls = apiCallsRes.data ?? [];
      const queriesCount = messages.length + apiCalls.length;
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

      return {
        documentsCount: docs.count ?? 0,
        proceduresCount: procedures.count ?? 0,
        errorsCount: errors.count ?? 0,
        queriesCount,
        avgResolutionMinutes:
          userMessagesWithReply > 0 ? Math.round(resolutionMinutes / userMessagesWithReply) : 0,
      };
    } catch (e) {
      console.error("dashboardService.getMetrics error", e);
      return {
        documentsCount: 0,
        proceduresCount: 0,
        errorsCount: 0,
        queriesCount: 0,
        avgResolutionMinutes: 0,
      };
    }
  },

  async getQueriesTrend() {
    if (!isSupabaseConfigured || !supabase) {
      return weekdayLabels.map((d) => ({ day: d, value: 0 }));
    }

    const since = new Date();
    since.setDate(since.getDate() - 6);
    try {
      const [{ data: messageRows, error: messagesError }, { data: apiCallRows, error: apiCallsError }] =
        await Promise.all([
          supabase
            .from<MessageRow>("mensagens")
            .select("criado_em")
            .gte("criado_em", since.toISOString())
            .order("criado_em", { ascending: true }),
          supabase
            .from<ApiCallRow>("api_chamadas")
            .select("criado_em")
            .gte("criado_em", since.toISOString())
            .order("criado_em", { ascending: true }),
        ]);

      if (messagesError) throw messagesError;
      if (apiCallsError) throw apiCallsError;

      const counts: Record<string, number> = {};
      for (let i = 0; i < 7; i++) {
        const d = new Date();
        d.setDate(since.getDate() + i);
        const label = weekdayLabels[d.getDay()];
        counts[label] = 0;
      }

      (messageRows ?? []).forEach((r: MessageRow) => {
        const dt = new Date(r.criado_em);
        const label = weekdayLabels[dt.getDay()];
        counts[label] = (counts[label] ?? 0) + 1;
      });
      (apiCallRows ?? []).forEach((r: ApiCallRow) => {
        const dt = new Date(r.criado_em ?? new Date().toISOString());
        const label = weekdayLabels[dt.getDay()];
        counts[label] = (counts[label] ?? 0) + 1;
      });

      return Object.keys(counts).map((k) => ({ day: k, value: counts[k] }));
    } catch (e) {
      console.error("dashboardService.getQueriesTrend error", e);
      return weekdayLabels.map((d) => ({ day: d, value: 0 }));
    }
  },

  async getTopProblems() {
    if (!isSupabaseConfigured || !supabase) {
      return [] as { name: string; value: number }[];
    }

    try {
      const { data, error } = await supabase
        .from("bases_conhecimento")
        .select("titulo")
        .eq("categoria", "erro")
        .order("criado_em", { ascending: false })
        .limit(200);

      if (error) throw error;

      const map: Record<string, number> = {};
      (data ?? []).forEach((r: KnowledgeRecordRow) => {
        const name = r.titulo ?? "Sem título";
        map[name] = (map[name] ?? 0) + 1;
      });

      return Object.entries(map)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5);
    } catch (e) {
      console.error("dashboardService.getTopProblems error", e);
      return [];
    }
  },

  async getTopEquipment() {
    if (!isSupabaseConfigured || !supabase) {
      return [] as { name: string; falhas: number }[];
    }

    try {
      const { data, error } = await supabase
        .from("bases_conhecimento")
        .select("equipamento")
        .neq("equipamento", null)
        .limit(500);

      if (error) throw error;

      const map: Record<string, number> = {};
      (data ?? []).forEach((r: KnowledgeRecordRow) => {
        const name = r.equipamento ?? "-";
        map[name] = (map[name] ?? 0) + 1;
      });

      return Object.entries(map)
        .map(([name, falhas]) => ({ name, falhas }))
        .sort((a, b) => b.falhas - a.falhas)
        .slice(0, 10);
    } catch (e) {
      console.error("dashboardService.getTopEquipment error", e);
      return [];
    }
  },

  async getRecentActivity(limit = 10) {
    if (!isSupabaseConfigured || !supabase) return [] as DashboardActivityItem[];

    try {
      const [kb, uploads, conversas, apiCalls] = await Promise.all([
        supabase
          .from("bases_conhecimento")
          .select("titulo, categoria, criado_em")
          .order("criado_em", { ascending: false })
          .limit(limit),
        supabase
          .from("uploads")
          .select("nome_arquivo, status, criado_em")
          .order("criado_em", { ascending: false })
          .limit(limit),
        supabase
          .from("conversas")
          .select("titulo, criado_em")
          .order("criado_em", { ascending: false })
          .limit(limit),
        supabase
          .from<ApiCallRow>("api_chamadas")
          .select("api, funcao, criado_em")
          .order("criado_em", { ascending: false })
          .limit(limit),
      ]);

      const items: DashboardActivityItem[] = [];
      (kb.data ?? []).forEach((r: KnowledgeRecordRow) =>
        items.push({
          title: r.titulo ?? "Sem título",
          tag: r.categoria ?? "conhecimento",
          time: r.criado_em ?? "",
        }),
      );
      (uploads.data ?? []).forEach((r: UploadRecordRow) =>
        items.push({
          title: `Upload — ${r.nome_arquivo ?? "arquivo"}`,
          tag: "upload",
          time: r.criado_em ?? "",
        }),
      );
      (conversas.data ?? []).forEach((r: ConversationRecordRow) =>
        items.push({
          title: `Conversa — ${r.titulo ?? "sem título"}`,
          tag: "consulta",
          time: r.criado_em ?? "",
        }),
      );
      (apiCalls.data ?? []).forEach((r: ApiCallRow) =>
        items.push({
          title: `API — ${r.funcao ?? r.api ?? "chamada"}`,
          tag: "api",
          time: r.criado_em ?? "",
        }),
      );

      items.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
      return items.slice(0, limit).map((it) => ({ title: it.title, tag: it.tag, time: it.time }));
    } catch (e) {
      console.error("dashboardService.getRecentActivity error", e);
      return [];
    }
  },
};

export type DashboardMetrics = Awaited<ReturnType<typeof dashboardService.getMetrics>>;

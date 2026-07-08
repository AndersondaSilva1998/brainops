import { supabase, isSupabaseConfigured } from "./supabase";

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
      const docs = await supabase.from("documentos").select("id", { head: true, count: "exact" });
      const procedures = await supabase
        .from("bases_conhecimento")
        .select("id", { head: true, count: "exact" })
        .eq("categoria", "procedimento");
      const errors = await supabase
        .from("bases_conhecimento")
        .select("id", { head: true, count: "exact" })
        .eq("categoria", "erro");
      const queries = await supabase.from("mensagens").select("id", { head: true, count: "exact" });

      return {
        documentsCount: docs.count ?? 0,
        proceduresCount: procedures.count ?? 0,
        errorsCount: errors.count ?? 0,
        queriesCount: queries.count ?? 0,
        avgResolutionMinutes: 0,
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
      const { data, error } = await supabase
        .from("mensagens")
        .select("criado_em")
        .gte("criado_em", since.toISOString())
        .order("criado_em", { ascending: true });

      if (error) throw error;

      const counts: Record<string, number> = {};
      for (let i = 0; i < 7; i++) {
        const d = new Date();
        d.setDate(since.getDate() + i);
        const label = weekdayLabels[d.getDay()];
        counts[label] = 0;
      }

      (data ?? []).forEach((r: any) => {
        const dt = new Date(r.criado_em);
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
      (data ?? []).forEach((r: any) => {
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
      (data ?? []).forEach((r: any) => {
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
    if (!isSupabaseConfigured || !supabase) return [] as any[];

    try {
      const [kb, uploads, conversas] = await Promise.all([
        supabase.from("bases_conhecimento").select("titulo, categoria, criado_em").order("criado_em", { ascending: false }).limit(limit),
        supabase.from("uploads").select("nome_arquivo, status, criado_em").order("criado_em", { ascending: false }).limit(limit),
        supabase.from("conversas").select("titulo, criado_em").order("criado_em", { ascending: false }).limit(limit),
      ]);

      const items: any[] = [];
      (kb.data ?? []).forEach((r: any) => items.push({ title: r.titulo, tag: r.categoria, time: r.criado_em }));
      (uploads.data ?? []).forEach((r: any) => items.push({ title: `Upload — ${r.nome_arquivo}`, tag: "upload", time: r.criado_em }));
      (conversas.data ?? []).forEach((r: any) => items.push({ title: `Conversa — ${r.titulo}`, tag: "consulta", time: r.criado_em }));

      items.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
      return items.slice(0, limit).map((it) => ({ title: it.title, tag: it.tag, time: it.time }));
    } catch (e) {
      console.error("dashboardService.getRecentActivity error", e);
      return [];
    }
  },
};

export type DashboardMetrics = Awaited<ReturnType<typeof dashboardService.getMetrics>>;

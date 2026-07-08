import { api } from "./api";
import type { SearchQuery, SearchResult } from "@/types";
import { knowledgeBaseService } from "./knowledgeBase";

export const searchService = {
  /**
   * Semantic search via local RAG API (POST /search).
   * Falls back to naive local filter while the backend isn't running.
   */
  async search(query: SearchQuery): Promise<SearchResult[]> {
    try {
      return await api.post<SearchResult[]>("/search", query);
    } catch {
      const all = await knowledgeBaseService.list();
      const q = query.query.toLowerCase();
      return all
        .filter((k) => {
          const hay = [
            k.title,
            k.problemDescription,
            k.equipment ?? "",
            ...k.keywords,
            ...k.tags,
          ]
            .join(" ")
            .toLowerCase();
          return !q || hay.includes(q);
        })
        .map<SearchResult>((k) => ({
          id: k.id,
          title: k.title,
          summary: k.problemDescription.slice(0, 160),
          category: k.category,
          equipment: k.equipment,
        }));
    }
  },
};

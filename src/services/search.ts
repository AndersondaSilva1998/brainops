import { api } from "./api";
import type { SearchQuery, SearchResult } from "@/types";

export const searchService = {
  async search(query: SearchQuery): Promise<SearchResult[]> {
    return api.post<SearchResult[]>("/search", query);
  },
};

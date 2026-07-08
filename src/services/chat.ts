import { api } from "./api";
import type { ChatRequest, ChatResponse } from "@/types";

export const chatService = {
  async send(req: ChatRequest): Promise<ChatResponse> {
    return api.post<ChatResponse>("/chat", req);
  },

  async health(): Promise<boolean> {
    try {
      await api.get<unknown>("/health");
      return true;
    } catch {
      return false;
    }
  },
};

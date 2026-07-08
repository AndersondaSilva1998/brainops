import { api } from "./api";
import type { ChatRequest, ChatResponse, ChatMessage } from "@/types";

export const chatService = {
  /** POST /chat — will forward to Ollama on the local API server. */
  async send(req: ChatRequest): Promise<ChatResponse> {
    try {
      return await api.post<ChatResponse>("/chat", req);
    } catch {
      // Fallback response so the UI is usable pre-backend.
      const msg: ChatMessage = {
        id: `m-${Date.now()}`,
        role: "assistant",
        content:
          "⚠️ API local indisponível. Assim que o servidor Ollama estiver ativo em VITE_API_URL, esta resposta virá do modelo com contexto da base de conhecimento.",
        createdAt: new Date().toISOString(),
      };
      return { message: msg, conversationId: req.conversationId ?? "local" };
    }
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

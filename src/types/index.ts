// Domain types for the internal AI support system.
// Kept framework-agnostic so backend (Supabase) can map 1:1.

export type KnowledgeStatus = "draft" | "published" | "archived";

export type KnowledgeCategory =
  | "procedimento"
  | "erro"
  | "documentacao"
  | "manual"
  | "outro";

export interface Attachment {
  id: string;
  name: string;
  url: string;
  mimeType?: string;
  sizeBytes?: number;
}

export interface KnowledgeEntry {
  id: string;
  title: string;
  category: KnowledgeCategory;
  equipment?: string;
  system?: string;
  problemDescription: string;
  symptoms?: string;
  solutionSteps: string;
  notes?: string;
  keywords: string[];
  tags: string[];
  attachments: Attachment[];
  status: KnowledgeStatus;
  createdAt: string;
  updatedAt: string;
  author: string;
}

export interface SearchQuery {
  query: string;
  errorCode?: string;
  equipment?: string;
  category?: KnowledgeCategory;
}

export interface SearchResult {
  id: string;
  title: string;
  summary: string;
  category: KnowledgeCategory;
  equipment?: string;
  score?: number;
}

export type ChatRole = "user" | "assistant" | "system";

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: string;
  sources?: SearchResult[];
}

export interface ChatRequest {
  message: string;
  conversationId?: string;
  history?: Pick<ChatMessage, "role" | "content">[];
}

export interface ChatResponse {
  message: ChatMessage;
  conversationId: string;
}

export interface DashboardMetrics {
  errorsCount: number;
  proceduresCount: number;
  documentsCount: number;
  queriesCount: number;
  avgResolutionMinutes: number;
}

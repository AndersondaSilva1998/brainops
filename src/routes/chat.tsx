import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Send,
  Bot,
  User,
  Loader2,
  Plus,
  Search,
  Star,
  Trash2,
  Copy,
  ThumbsUp,
  ThumbsDown,
  FileText,
  Sparkles,
  MessagesSquare,
  Info,
} from "lucide-react";
import { useRef, useState, useEffect, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { chatService } from "@/services/chat";
import { conversationsService } from "@/services/conversations";
import type { ChatMessage } from "@/types";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/chat")({
  component: ChatPage,
});

interface Conversation {
  id: string;
  title: string;
  favorite: boolean;
  updatedAt: string;
}

const suggestions = [
  "Descreva o problema que você encontrou.",
  "Informe o equipamento ou sistema afetado.",
  "Digite termos de erro ou mensagem exibida.",
  "Explique o que não está funcionando corretamente.",
];

function ChatPage() {
  const [localConversations, setLocalConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [filter, setFilter] = useState("");
  const [input, setInput] = useState("");
  const [messageCache, setMessageCache] = useState<Record<string, ChatMessage[]>>({});
  const [isSavingConversation, setIsSavingConversation] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const queryClient = useQueryClient();

  const { data: remoteConversations = [] } = useQuery({
    queryKey: ["conversations", "list"],
    queryFn: () => conversationsService.list(),
    staleTime: 60_000,
  });

  const allConversations = useMemo(
    () => [...localConversations, ...remoteConversations],
    [localConversations, remoteConversations],
  );

  useEffect(() => {
    if (!activeId && allConversations.length > 0) {
      setActiveId(allConversations[0].id);
    }
  }, [activeId, allConversations]);

  const active = allConversations.find((c) => c.id === activeId) ?? null;
  const isRemoteActive = activeId ? !activeId.startsWith("local-") : false;

  const { data: remoteMessages = [] } = useQuery({
    queryKey: ["conversationMessages", activeId],
    queryFn: () => (activeId ? conversationsService.getMessages(activeId) : Promise.resolve([])),
    enabled: Boolean(activeId && isRemoteActive),
  });

  useEffect(() => {
    if (activeId && isRemoteActive && remoteMessages.length > 0) {
      setMessageCache((prev) => ({
        ...prev,
        [activeId]: remoteMessages,
      }));
    }
  }, [activeId, isRemoteActive, remoteMessages]);

  const activeMessages = activeId ? messageCache[activeId] ?? [] : [];

  const filtered = useMemo(
    () =>
      allConversations.filter((c) => c.title.toLowerCase().includes(filter.toLowerCase())),
    [allConversations, filter],
  );

  const mutation = useMutation({
    mutationFn: ({ text, conversationId, history }: { text: string; conversationId: string; history: { role: string; content: string }[] }) =>
      chatService.send({
        message: text,
        conversationId,
        history,
      }),
    onSuccess: (res) => {
      const targetId = res.conversationId;
      setMessageCache((prev) => ({
        ...prev,
        [targetId]: [...(prev[targetId] ?? []), res.message],
      }));

      if (!targetId.startsWith("local-")) {
        conversationsService.addMessage(targetId, { role: "assistant", content: res.message.content });
        queryClient.invalidateQueries(["conversations", "list"]);
      }
    },
  });

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [activeMessages.length, mutation.isPending]);

  const createRemoteConversationIfNeeded = async (currentId: string, title: string) => {
    if (!currentId.startsWith("local-")) {
      return currentId;
    }

    setIsSavingConversation(true);
    const created = await conversationsService.createConversation(title);
    setIsSavingConversation(false);

    if (!created) {
      return currentId;
    }

    setLocalConversations((prev) => prev.filter((c) => c.id !== currentId));
    setActiveId(created.id);
    queryClient.invalidateQueries(["conversations", "list"]);
    return created.id;
  };

  const submit = async (raw?: string) => {
    const text = (raw ?? input).trim();
    if (!text || mutation.isPending) return;

    let currentId = activeId;
    if (!currentId) {
      currentId = `local-${Date.now()}`;
      setLocalConversations((prev) => [
        {
          id: currentId,
          title: text.slice(0, 40) || "Nova conversa",
          favorite: false,
          updatedAt: new Date().toISOString(),
        },
        ...prev,
      ]);
      setActiveId(currentId);
    }

    const targetId = await createRemoteConversationIfNeeded(currentId, text) ?? currentId;

    const user: ChatMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      content: text,
      createdAt: new Date().toISOString(),
    };

    setMessageCache((prev) => ({
      ...prev,
      [targetId]: [...(prev[targetId] ?? []), user],
    }));

    if (!targetId.startsWith("local-")) {
      conversationsService.addMessage(targetId, { role: "user", content: text });
    }

    setInput("");
    mutation.mutate({ text, conversationId: targetId, history: activeMessages.map((m) => ({ role: m.role, content: m.content })) });
  };

  const newConv = () => {
    const id = `local-${Date.now()}`;
    setLocalConversations((prev) => [
      { id, title: "Nova conversa", favorite: false, updatedAt: new Date().toISOString() },
      ...prev,
    ]);
    setActiveId(id);
  };

  const toggleFav = (id: string) =>
    setLocalConversations((prev) => prev.map((c) => (c.id === id ? { ...c, favorite: !c.favorite } : c)));

  const remove = (id: string) => {
    setLocalConversations((prev) => prev.filter((c) => c.id !== id));
    if (id === activeId) {
      const next = allConversations.filter((c) => c.id !== id);
      setActiveId(next.length > 0 ? next[0].id : null);
    }
  };

  return (
    <AppShell title="BrainOps AI" subtitle="Assistente RAG conectado ao Ollama local">
      <div className="grid h-[calc(100vh-8rem)] gap-4 lg:grid-cols-[280px,1fr]">
        <Card className="flex flex-col overflow-hidden">
          <div className="border-b p-3">
            <Button onClick={newConv} className="w-full" size="sm">
              <Plus className="h-4 w-4" /> Nova conversa
            </Button>
            <div className="relative mt-3">
              <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                placeholder="Pesquisar"
                className="h-9 pl-8"
              />
            </div>
          </div>
          <ScrollArea className="flex-1">
            <div className="space-y-1 p-2">
              {filtered.map((c) => (
                <div
                  key={c.id}
                  className={cn(
                    "group flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm transition-colors",
                    c.id === activeId ? "bg-muted" : "hover:bg-muted/60",
                  )}
                  onClick={() => setActiveId(c.id)}
                >
                  <MessagesSquare className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="flex-1 truncate">{c.title}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFav(c.id);
                    }}
                    className="opacity-0 group-hover:opacity-100"
                    aria-label="Favoritar"
                  >
                    <Star className={cn("h-3.5 w-3.5", c.favorite ? "fill-amber-400 text-amber-400 opacity-100" : "text-muted-foreground")} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      remove(c.id);
                    }}
                    className="opacity-0 group-hover:opacity-100"
                    aria-label="Excluir"
                  >
                    <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                  </button>
                </div>
              ))}
            </div>
          </ScrollArea>
        </Card>

        <Card className="flex flex-col overflow-hidden">
          <div ref={scrollRef} className="flex-1 overflow-y-auto">
            <div className="mx-auto max-w-3xl space-y-6 p-6">
              {!activeMessages.length ? (
                <div className="pt-6 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Info className="h-6 w-6" />
                  </div>
                  <h2 className="mt-4 text-xl font-semibold">Inicie a conversa</h2>
                  <p className="mt-1 text-sm text-muted-foreground">Faça uma pergunta para iniciar. As respostas virão do modelo conectado ao backend.</p>
                  <div className="mt-6 grid gap-2 sm:grid-cols-2">
                    {suggestions.map((s) => (
                      <button
                        key={s}
                        onClick={() => submit(s)}
                        className="rounded-lg border p-3 text-left text-sm text-foreground/80 transition-colors hover:border-primary/50 hover:bg-muted"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                activeMessages.map((m) => <Bubble key={m.id} message={m} />)
              )}

              {mutation.isPending && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" /> BrainOps está pensando...
                </div>
              )}
            </div>
          </div>

          <div className="border-t bg-background/60 p-4 backdrop-blur">
            <div className="mx-auto max-w-3xl">
              <div className="relative">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Descreva o problema, código de erro ou peça um procedimento..."
                  rows={2}
                  className="resize-none pr-14"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      submit();
                    }
                  }}
                />
                <Button
                  onClick={() => submit()}
                  disabled={mutation.isPending || !input.trim()}
                  size="icon"
                  className="absolute bottom-2 right-2"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <p className="mt-2 text-center text-xs text-muted-foreground">
                Enter envia · Shift+Enter quebra linha · Respostas podem conter imprecisões
              </p>
            </div>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}

function Bubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";
  const copy = () => {
    navigator.clipboard.writeText(message.content);
    toast.success("Copiado");
  };
  return (
    <div className={cn("flex gap-3", isUser && "flex-row-reverse")}>
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
          isUser ? "bg-primary text-primary-foreground" : "bg-muted",
        )}
      >
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>
      <div className={cn("max-w-[85%] space-y-2", isUser && "items-end")}>
        <div
          className={cn(
            "rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap",
            isUser ? "bg-primary text-primary-foreground" : "bg-muted",
          )}
        >
          {message.content}
        </div>

        {!isUser && message.id !== "welcome" && (
          <div className="flex items-center gap-1 pt-2">
            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={copy}><Copy className="h-3.5 w-3.5" /></Button>
            <Button size="icon" variant="ghost" className="h-7 w-7"><ThumbsUp className="h-3.5 w-3.5" /></Button>
            <Button size="icon" variant="ghost" className="h-7 w-7"><ThumbsDown className="h-3.5 w-3.5" /></Button>
          </div>
        )}
      </div>
    </div>
  );
}

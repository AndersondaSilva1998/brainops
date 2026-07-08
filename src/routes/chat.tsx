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
} from "lucide-react";
import { useRef, useState, useEffect, useMemo } from "react";
import { useMutation } from "@tanstack/react-query";
import { chatService } from "@/services/chat";
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
  messages: ChatMessage[];
}

const welcome: ChatMessage = {
  id: "welcome",
  role: "assistant",
  content:
    "Olá! Sou o BrainOps AI. Descreva o problema, código de erro ou situação e vou buscar a melhor solução na base de conhecimento.",
  createdAt: new Date().toISOString(),
};

const suggestions = [
  "Impressora HP não imprime, erro 0x610000f6",
  "Como resetar a senha do Active Directory?",
  "Outlook travando ao abrir anexos",
  "VPN Cisco AnyConnect não conecta",
];

function ChatPage() {
  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: "c-1",
      title: "Nova conversa",
      favorite: false,
      updatedAt: new Date().toISOString(),
      messages: [welcome],
    },
  ]);
  const [activeId, setActiveId] = useState("c-1");
  const [filter, setFilter] = useState("");
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const active = conversations.find((c) => c.id === activeId)!;
  const filtered = useMemo(
    () =>
      conversations.filter((c) => c.title.toLowerCase().includes(filter.toLowerCase())),
    [conversations, filter],
  );

  const mutation = useMutation({
    mutationFn: (text: string) =>
      chatService.send({
        message: text,
        history: active.messages.map((m) => ({ role: m.role, content: m.content })),
      }),
    onSuccess: (res) => {
      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeId
            ? { ...c, messages: [...c.messages, res.message], updatedAt: new Date().toISOString() }
            : c,
        ),
      );
    },
  });

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [active.messages, mutation.isPending]);

  const submit = (raw?: string) => {
    const text = (raw ?? input).trim();
    if (!text || mutation.isPending) return;
    const user: ChatMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      content: text,
      createdAt: new Date().toISOString(),
    };
    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeId
          ? {
              ...c,
              title: c.messages.length <= 1 ? text.slice(0, 40) : c.title,
              messages: [...c.messages, user],
              updatedAt: new Date().toISOString(),
            }
          : c,
      ),
    );
    setInput("");
    mutation.mutate(text);
  };

  const newConv = () => {
    const id = `c-${Date.now()}`;
    setConversations((prev) => [
      { id, title: "Nova conversa", favorite: false, updatedAt: new Date().toISOString(), messages: [welcome] },
      ...prev,
    ]);
    setActiveId(id);
  };

  const toggleFav = (id: string) =>
    setConversations((prev) => prev.map((c) => (c.id === id ? { ...c, favorite: !c.favorite } : c)));

  const remove = (id: string) => {
    setConversations((prev) => {
      const next = prev.filter((c) => c.id !== id);
      if (next.length === 0) {
        const fresh: Conversation = {
          id: `c-${Date.now()}`,
          title: "Nova conversa",
          favorite: false,
          updatedAt: new Date().toISOString(),
          messages: [welcome],
        };
        setActiveId(fresh.id);
        return [fresh];
      }
      if (id === activeId) setActiveId(next[0].id);
      return next;
    });
  };

  return (
    <AppShell title="BrainOps AI" subtitle="Assistente RAG conectado ao Ollama local">
      <div className="grid h-[calc(100vh-8rem)] gap-4 lg:grid-cols-[280px,1fr]">
        {/* Sidebar de conversas */}
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

        {/* Chat */}
        <Card className="flex flex-col overflow-hidden">
          <div ref={scrollRef} className="flex-1 overflow-y-auto">
            <div className="mx-auto max-w-3xl space-y-6 p-6">
              {active.messages.length <= 1 && (
                <div className="pt-6 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Sparkles className="h-6 w-6" />
                  </div>
                  <h2 className="mt-4 text-xl font-semibold">Como posso ajudar hoje?</h2>
                  <p className="mt-1 text-sm text-muted-foreground">Comece com uma das sugestões abaixo ou descreva seu problema.</p>
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
              )}

              {active.messages.map((m) => (
                <Bubble key={m.id} message={m} />
              ))}

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
          <>
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-muted-foreground">
              <Badge variant="outline" className="gap-1"><Sparkles className="h-3 w-3" /> Confiança: 92%</Badge>
              <Badge variant="outline">Categoria: procedimento</Badge>
              <span>· 1.2s</span>
            </div>
            <div className="space-y-1.5 pt-1">
              <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Fontes utilizadas</p>
              {["Manual HP LaserJet Pro M404.pdf", "Procedimento — Reset Spooler"].map((s) => (
                <div key={s} className="flex items-center justify-between rounded-md border px-2.5 py-1.5 text-xs">
                  <span className="flex items-center gap-2"><FileText className="h-3.5 w-3.5 text-muted-foreground" /> {s}</span>
                  <Button size="sm" variant="ghost" className="h-6 px-2 text-xs">Abrir</Button>
                </div>
              ))}
            </div>
            <Separator className="my-2" />
            <div className="flex items-center gap-1">
              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={copy}><Copy className="h-3.5 w-3.5" /></Button>
              <Button size="icon" variant="ghost" className="h-7 w-7"><ThumbsUp className="h-3.5 w-3.5" /></Button>
              <Button size="icon" variant="ghost" className="h-7 w-7"><ThumbsDown className="h-3.5 w-3.5" /></Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

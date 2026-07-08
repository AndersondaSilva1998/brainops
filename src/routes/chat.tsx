import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Bot, User, Loader2 } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { chatService } from "@/services/chat";
import type { ChatMessage } from "@/types";

export const Route = createFileRoute("/chat")({
  component: ChatPage,
});

function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Olá! Sou o assistente de suporte técnico. Descreva o problema, código de erro ou situação e vou buscar a melhor solução na base de conhecimento.",
      createdAt: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const mutation = useMutation({
    mutationFn: (text: string) =>
      chatService.send({
        message: text,
        history: messages.map((m) => ({ role: m.role, content: m.content })),
      }),
    onSuccess: (res) => setMessages((prev) => [...prev, res.message]),
  });

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, mutation.isPending]);

  const submit = () => {
    const text = input.trim();
    if (!text || mutation.isPending) return;
    const user: ChatMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      content: text,
      createdAt: new Date().toISOString(),
    };
    setMessages((p) => [...p, user]);
    setInput("");
    mutation.mutate(text);
  };

  return (
    <AppShell title="Chat IA" subtitle="Assistente RAG conectado ao Ollama local">
      <div className="mx-auto flex h-[calc(100vh-8rem)] max-w-4xl flex-col">
        <Card className="flex flex-1 flex-col overflow-hidden">
          <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-6">
            {messages.map((m) => (
              <Bubble key={m.id} message={m} />
            ))}
            {mutation.isPending && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> Pensando...
              </div>
            )}
          </div>

          <div className="border-t p-4">
            <div className="flex items-end gap-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Descreva o problema..."
                rows={2}
                className="resize-none"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    submit();
                  }
                }}
              />
              <Button onClick={submit} disabled={mutation.isPending || !input.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Enter para enviar · Shift+Enter para quebra de linha
            </p>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}

function Bubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";
  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""}`}>
      <div
        className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${
          isUser ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
        }`}
      >
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>
      <div
        className={`max-w-[80%] rounded-lg px-4 py-2 text-sm leading-relaxed whitespace-pre-wrap ${
          isUser ? "bg-primary text-primary-foreground" : "bg-muted"
        }`}
      >
        {message.content}
      </div>
    </div>
  );
}

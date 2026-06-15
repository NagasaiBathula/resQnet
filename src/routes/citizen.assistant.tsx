import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { aiSuggestedPrompts, generateAIResponse } from "@/lib/mock-data";
import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Sparkles, Send, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/citizen/assistant")({
  head: () => ({ meta: [{ title: "AI Disaster Assistant — ResQNet" }] }),
  component: AssistantPage,
});

type Msg = { id: string; role: "user" | "ai"; text: string };

function AssistantPage() {
  const [messages, setMessages] = useState<Msg[]>([
    { id: "m0", role: "ai", text: "Hello, I'm your ResQNet assistant. I can help with emergency guidance, shelters, medical help, or planning. How can I help you today?" },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, typing]);

  const send = (text?: string) => {
    const q = (text ?? input).trim();
    if (!q) return;
    setInput("");
    setMessages(m => [...m, { id: `u-${Date.now()}`, role: "user", text: q }]);
    setTyping(true);
    setTimeout(() => {
      setMessages(m => [...m, { id: `a-${Date.now()}`, role: "ai", text: generateAIResponse(q) }]);
      setTyping(false);
    }, 900);
  };

  return (
    <AppShell title="AI Disaster Assistant">
      <p className="text-muted-foreground -mt-1 mb-6">Trained on disaster protocols. Always available. Always confidential.</p>
      <div className="max-w-3xl mx-auto">
        <Card className="overflow-hidden shadow-elegant border-border/60 flex flex-col h-[calc(100vh-220px)] min-h-[520px]">
          <div className="flex items-center gap-3 border-b px-5 py-3 glass">
            <div className="relative">
              <div className="h-10 w-10 rounded-xl gradient-primary grid place-items-center text-white shadow-glow">
                <Sparkles className="h-5 w-5" />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-success border-2 border-card" />
            </div>
            <div>
              <div className="text-sm font-semibold">ResQNet</div>
              <div className="text-[11px] text-muted-foreground">Online · 12 languages · End-to-end encrypted</div>
            </div>
            <Button size="sm" variant="outline" className="ml-auto rounded-full hidden sm:inline-flex">
              <ShieldAlert className="h-3.5 w-3.5 mr-1" /> Escalate to human
            </Button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-3">
            {messages.map(m => (
              <motion.div key={m.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                className={cn("flex gap-2.5", m.role === "user" ? "justify-end" : "justify-start")}>
                {m.role === "ai" && (
                  <Avatar className="h-7 w-7 shrink-0">
                    <AvatarFallback className="bg-primary/10 text-primary text-[10px]"><Sparkles className="h-3.5 w-3.5" /></AvatarFallback>
                  </Avatar>
                )}
                <div className={cn(
                  "max-w-[78%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                  m.role === "user" ? "bg-primary text-primary-foreground rounded-br-md" : "bg-muted rounded-bl-md"
                )}>{m.text}</div>
              </motion.div>
            ))}
            {typing && (
              <div className="flex gap-2.5">
                <Avatar className="h-7 w-7"><AvatarFallback className="bg-primary/10 text-primary text-[10px]"><Sparkles className="h-3.5 w-3.5" /></AvatarFallback></Avatar>
                <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3 flex gap-1">
                  {[0, 0.15, 0.3].map(d => (
                    <span key={d} className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60 animate-bounce" style={{ animationDelay: `${d}s` }} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {messages.length <= 2 && (
            <div className="px-5 py-3 border-t flex flex-wrap gap-2">
              {aiSuggestedPrompts.map(p => (
                <button key={p} onClick={() => send(p)}
                  className="text-xs rounded-full border px-3 py-1.5 hover:bg-accent transition">
                  {p}
                </button>
              ))}
            </div>
          )}

          <form onSubmit={e => { e.preventDefault(); send(); }} className="border-t p-3 flex gap-2 glass">
            <Input value={input} onChange={e => setInput(e.target.value)} placeholder="Message ResQNet…" className="bg-card/60 border-0 h-11 rounded-full px-5" />
            <Button type="submit" size="icon" className="h-11 w-11 rounded-full shadow-glow">
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </Card>
      </div>
    </AppShell>
  );
}

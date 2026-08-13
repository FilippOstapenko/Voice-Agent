import { useEffect, useRef, useState } from "react";
import { Loader2, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";

interface ChatMessage {
  from: "visitor" | "ai";
  text: string;
}

const GREETING: ChatMessage = {
  from: "ai",
  // Shown locally only — the conversation in the database starts at the visitor's
  // first real message, so the inbox is not filled with empty "hello" conversations.
  text: "Hoi! Ik ben de AI-assistent. Stel gerust een vraag over onze diensten, prijzen of openingstijden.",
};

export default function ChatPanel({ onClose }: { onClose: () => void }) {
  const [messages, setMessages] = useState<ChatMessage[]>([GREETING]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Kept in a ref, not state: the id must be current inside send() without re-rendering.
  const conversationId = useRef<string | undefined>(undefined);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, sending]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || sending) return;

    setInput("");
    setError(null);
    setMessages((m) => [...m, { from: "visitor", text }]);
    setSending(true);

    try {
      const res = await api.chat(text, conversationId.current);
      conversationId.current = res.conversationId;
      setMessages((m) => [...m, { from: "ai", text: res.reply }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Er ging iets mis. Probeer het opnieuw.");
    } finally {
      setSending(false);
    }
  }

  return (
    // Full-screen on phones, docked card on desktop — same pattern as the dashboard shell.
    <div className="fixed inset-0 z-50 flex flex-col bg-background sm:inset-auto sm:bottom-6 sm:right-6 sm:h-[560px] sm:w-[380px] sm:rounded-xl sm:border sm:border-border sm:shadow-xl">
      <header className="flex items-center justify-between border-b border-border px-4 py-3">
        <div>
          <p className="text-sm font-semibold tracking-tight">AI-assistent</p>
          <p className="text-xs text-muted-foreground">Antwoordt met jouw bedrijfskennis</p>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} aria-label="Chat sluiten">
          <X className="h-4 w-4" />
        </Button>
      </header>

      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {messages.map((m, i) => (
          <div key={i} className={m.from === "visitor" ? "flex justify-end" : "flex justify-start"}>
            <div
              className={
                "max-w-[85%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed " +
                (m.from === "visitor"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-foreground")
              }
            >
              {m.text}
            </div>
          </div>
        ))}
        {sending && (
          <div className="flex justify-start">
            <div className="flex items-center gap-2 rounded-2xl bg-muted px-3.5 py-2 text-sm text-muted-foreground">
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Aan het typen…
            </div>
          </div>
        )}
        {error && <p className="text-center text-xs text-destructive">{error}</p>}
      </div>

      <form onSubmit={send} className="flex items-center gap-2 border-t border-border p-3">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Stel een vraag…"
          autoFocus
          disabled={sending}
        />
        <Button type="submit" size="icon" disabled={sending || !input.trim()} aria-label="Versturen">
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}

import { useEffect, useState } from "react";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { api, channelLabel, formatTime, type ConversationDetail, type ConversationListItem } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

export default function InboxView() {
  const [items, setItems] = useState<ConversationListItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<ConversationDetail | null>(null);

  async function load() {
    setError(null);
    try {
      setItems(await api.conversations());
    } catch {
      setError("Kan de inbox niet laden. Draait de backend? (docker compose up)");
    }
  }

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (!selectedId) return setDetail(null);
    api.conversation(selectedId).then(setDetail).catch(() => setDetail(null));
  }, [selectedId]);

  return (
    <div>
      <div className={cn(selectedId && "hidden lg:block")}>
        <h1 className="text-xl font-semibold tracking-tight">Inbox</h1>
        <p className="mt-1 text-sm text-muted-foreground">Alle gesprekken van elk kanaal op één plek.</p>
      </div>

      {error && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-base">Inbox niet bereikbaar</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" onClick={load}>
              <RefreshCw className="h-4 w-4" /> Opnieuw proberen
            </Button>
          </CardContent>
        </Card>
      )}

      {!error && (
        <div className="mt-4 grid gap-4 lg:mt-6 lg:grid-cols-[360px_1fr]">
          <Card className={cn("overflow-hidden p-0", selectedId && "hidden lg:block")}>
            {items === null ? (
              <p className="px-4 py-6 text-sm text-muted-foreground">Laden…</p>
            ) : items.length === 0 ? (
              <p className="px-4 py-6 text-sm text-muted-foreground">
                Nog geen gesprekken. Zodra een kanaal live is, verschijnen ze hier.
              </p>
            ) : (
              <ul>
                {items.map((c, i) => (
                  <li key={c.id}>
                    {i > 0 && <Separator />}
                    <button
                      onClick={() => setSelectedId(c.id)}
                      className={cn(
                        "flex w-full flex-col gap-1 px-4 py-3.5 text-left transition-colors hover:bg-secondary/60",
                        selectedId === c.id && "lg:bg-secondary"
                      )}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-medium">{c.contact}</span>
                        <span className="shrink-0 text-xs text-muted-foreground">{formatTime(c.createdAt)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={c.channel}>{channelLabel[c.channel]}</Badge>
                        <span className="truncate text-xs text-muted-foreground">{c.preview}</span>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <div className={cn("flex-col gap-4", selectedId ? "flex" : "hidden lg:flex")}>
            {!detail && selectedId && <p className="text-sm text-muted-foreground">Laden…</p>}
            {!selectedId && (
              <Card>
                <CardHeader>
                  <CardDescription>Kies links een gesprek om het transcript te bekijken.</CardDescription>
                </CardHeader>
              </Card>
            )}
            {detail && (
              <>
                <div className="flex items-center gap-2 lg:hidden">
                  <Button variant="ghost" size="sm" onClick={() => setSelectedId(null)}>
                    <ArrowLeft className="h-4 w-4" /> Inbox
                  </Button>
                  <span className="text-sm font-medium">{detail.contact}</span>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Samenvatting</CardTitle>
                    <CardDescription>{detail.summary || "Nog geen samenvatting."}</CardDescription>
                  </CardHeader>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Transcript</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-3">
                    {detail.transcript.map((line, i) => (
                      <div
                        key={i}
                        className={cn(
                          "max-w-[85%] rounded-lg px-3 py-2 text-sm",
                          line.from === "ai"
                            ? "self-start bg-secondary"
                            : "self-end bg-primary text-primary-foreground"
                        )}
                      >
                        {line.text}
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">CRM-acties</CardTitle>
                    {detail.actions.length === 0 && (
                      <CardDescription>Geen acties uit dit gesprek.</CardDescription>
                    )}
                  </CardHeader>
                  {detail.actions.length > 0 && (
                    <CardContent className="flex flex-col gap-2">
                      {detail.actions.map((a, i) => (
                        <div key={i} className="flex items-start gap-2 text-sm">
                          <Badge variant="outline" className="shrink-0">{a.type}</Badge>
                          <span>{a.detail}</span>
                        </div>
                      ))}
                    </CardContent>
                  )}
                </Card>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

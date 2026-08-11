import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { conversations, channelLabel } from "@/lib/mock";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

export default function InboxView() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = conversations.find((c) => c.id === selectedId) ?? null;
  const detail = selected ?? conversations[0];

  return (
    <div>
      {/* Mobile: list OR detail. Desktop: both side by side. */}
      <div className={cn(selected && "hidden lg:block")}>
        <h1 className="text-xl font-semibold tracking-tight">Inbox</h1>
        <p className="mt-1 text-sm text-muted-foreground">Alle gesprekken van elk kanaal op één plek.</p>
      </div>

      <div className="mt-4 grid gap-4 lg:mt-6 lg:grid-cols-[360px_1fr]">
        <Card className={cn("overflow-hidden p-0", selected && "hidden lg:block")}>
          <ul>
            {conversations.map((c, i) => (
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
                    <span className="shrink-0 text-xs text-muted-foreground">{c.time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={c.channel}>{channelLabel[c.channel]}</Badge>
                    <span className="truncate text-xs text-muted-foreground">{c.preview}</span>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </Card>

        <div className={cn("flex-col gap-4", selected ? "flex" : "hidden lg:flex")}>
          <div className="flex items-center gap-2 lg:hidden">
            <Button variant="ghost" size="sm" onClick={() => setSelectedId(null)}>
              <ArrowLeft className="h-4 w-4" /> Inbox
            </Button>
            <span className="text-sm font-medium">{detail.contact}</span>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Samenvatting</CardTitle>
              <CardDescription>{detail.summary}</CardDescription>
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
        </div>
      </div>
    </div>
  );
}

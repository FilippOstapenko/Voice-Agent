import { useState } from "react";
import { Link } from "react-router-dom";
import { Inbox, Bot, Radio, CreditCard, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import InboxView from "./views/InboxView";
import AgentView from "./views/AgentView";
import ChannelsView from "./views/ChannelsView";
import BillingView from "./views/BillingView";

const nav = [
  { id: "inbox", label: "Inbox", icon: Inbox },
  { id: "agent", label: "Assistent", icon: Bot },
  { id: "channels", label: "Kanalen", icon: Radio },
  { id: "billing", label: "Abonnement", icon: CreditCard },
] as const;

type View = (typeof nav)[number]["id"];

export default function Dashboard() {
  const [view, setView] = useState<View>("inbox");

  return (
    <div className="flex min-h-dvh bg-secondary/40">
      {/* Sidebar — desktop only */}
      <aside className="hidden w-56 shrink-0 flex-col border-r border-border bg-background md:flex">
        <div className="px-5 py-5">
          <span className="text-sm font-semibold tracking-tight">optivaize<span className="text-primary">.ai</span></span>
        </div>
        <nav className="flex flex-1 flex-col gap-1 px-3">
          {nav.map((item) => (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={cn(
                "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                view === item.id
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </button>
          ))}
        </nav>
        <div className="px-3 pb-4">
          <Link
            to="/"
            className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ExternalLink className="h-4 w-4" /> Naar website
          </Link>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="fixed inset-x-0 top-0 z-20 flex items-center justify-between border-b border-border bg-background px-4 py-3 md:hidden">
        <span className="text-sm font-semibold tracking-tight">optivaize<span className="text-primary">.ai</span></span>
        <Link to="/" className="text-xs text-muted-foreground">Naar website</Link>
      </div>

      {/* Content — bottom padding clears the tab bar on mobile */}
      <main className="flex-1 overflow-auto px-4 pb-24 pt-16 md:p-8 md:pb-8 md:pt-8">
        {view === "inbox" && <InboxView />}
        {view === "agent" && <AgentView />}
        {view === "channels" && <ChannelsView />}
        {view === "billing" && <BillingView />}
      </main>

      {/* Bottom tab bar — mobile only, app-style */}
      <nav className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-4 border-t border-border bg-background pb-[env(safe-area-inset-bottom)] md:hidden">
        {nav.map((item) => (
          <button
            key={item.id}
            onClick={() => setView(item.id)}
            className={cn(
              "flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium",
              view === item.id ? "text-primary" : "text-muted-foreground"
            )}
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </button>
        ))}
      </nav>
    </div>
  );
}

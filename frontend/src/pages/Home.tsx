import { Link } from "react-router-dom";
import { Phone, MessageCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const plans = [
  { name: "Start", price: "€99", blurb: "Chat op je website + inbox", highlight: false },
  { name: "Compleet", price: "€249", blurb: "Chat + WhatsApp + telefoon", highlight: true },
  { name: "Pro", price: "€499", blurb: "Alles + CRM-koppeling + hogere bundels", highlight: false },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
        <span className="text-sm font-semibold tracking-tight">optivaize<span className="text-primary">.ai</span></span>
        <nav className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <a href="#pricing">Prijzen</a>
          </Button>
          <Button size="sm" asChild>
            <Link to="/app">Dashboard <ArrowRight className="h-3.5 w-3.5" /></Link>
          </Button>
        </nav>
      </header>

      <section className="mx-auto max-w-3xl px-6 pb-20 pt-24 text-center">
        <Badge variant="secondary" className="mb-6">Nooit meer een gemiste oproep</Badge>
        <h1 className="text-balance text-5xl font-semibold leading-[1.1] tracking-tight">
          Jouw AI-receptionist, dag en nacht bereikbaar
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-pretty text-lg text-muted-foreground">
          Beantwoordt je telefoon, WhatsApp en websitechat. Plant afspraken, beantwoordt vragen
          en zet elke conversatie automatisch in je CRM.
        </p>
        <div className="mt-9 flex items-center justify-center gap-3">
          <Button size="lg">
            <Phone className="h-4 w-4" /> Laat de AI mij bellen
          </Button>
          <Button size="lg" variant="outline">
            <MessageCircle className="h-4 w-4" /> Chat met de agent
          </Button>
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          De demo belt je binnen 30 seconden — zo klinkt je eigen assistent.
        </p>
      </section>

      <section id="pricing" className="mx-auto max-w-5xl px-6 pb-24">
        <h2 className="text-center text-2xl font-semibold tracking-tight">Prijzen</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {plans.map((p) => (
            <Card key={p.name} className={p.highlight ? "border-primary shadow-md" : undefined}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {p.name}
                  {p.highlight && <Badge>Populair</Badge>}
                </CardTitle>
                <CardDescription>{p.blurb}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-semibold tracking-tight">{p.price}<span className="text-sm font-normal text-muted-foreground"> /maand</span></div>
                <Button className="mt-5 w-full" variant={p.highlight ? "default" : "outline"}>
                  Start met {p.name}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <footer className="border-t border-border py-8 text-center text-xs text-muted-foreground">
        © 2026 Optivaize — AI Voice Agent Platform
      </footer>
    </div>
  );
}

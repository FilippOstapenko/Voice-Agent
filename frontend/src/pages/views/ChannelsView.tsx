import { Phone, MessageCircle, Code, Mic } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const snippet = `<script src="https://app.optivaize.ai/widget.js"
  data-org="org_demo123" async></script>`;

export default function ChannelsView() {
  return (
    <div className="max-w-3xl">
      <h1 className="text-xl font-semibold tracking-tight">Kanalen</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Waar je assistent bereikbaar is. Alles komt samen in dezelfde inbox.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Phone className="h-4 w-4" /> Telefoon
              <Badge variant="secondary" className="ml-auto">Nog niet gekoppeld</Badge>
            </CardTitle>
            <CardDescription>
              Eigen nummer of doorschakeling van je bestaande nummer.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" disabled>Nummer koppelen — fase 2e</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <MessageCircle className="h-4 w-4" /> WhatsApp
              <Badge variant="secondary" className="ml-auto">Nog niet gekoppeld</Badge>
            </CardTitle>
            <CardDescription>Zakelijk WhatsApp-nummer op dezelfde assistent.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" disabled>WhatsApp koppelen — fase 2d</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Mic className="h-4 w-4" /> Website voice
              <Badge variant="secondary" className="ml-auto">Nog niet gekoppeld</Badge>
            </CardTitle>
            <CardDescription>Spraakdemo en voice-assistent op je site.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" disabled>Activeren — fase 2d</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Code className="h-4 w-4" /> Chatwidget
              <Badge variant="secondary" className="ml-auto">Nog niet gekoppeld</Badge>
            </CardTitle>
            <CardDescription>Plak dit snippet vlak voor de &lt;/body&gt; van je site.</CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="overflow-x-auto rounded-md bg-secondary p-3 text-xs">{snippet}</pre>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

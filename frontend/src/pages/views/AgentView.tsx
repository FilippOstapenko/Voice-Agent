import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function AgentView() {
  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-semibold tracking-tight">Assistent</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Bedrijfskennis en instructies waarmee de AI jouw klanten te woord staat.
      </p>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">Bedrijfskennis</CardTitle>
          <CardDescription>
            Vul je website in — de assistent leest hem en genereert de kennisbasis.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="site">Website</Label>
            <div className="flex gap-2">
              <Input id="site" placeholder="https://jouwbedrijf.nl" />
              <Button>Genereer kennis</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="text-base">Instructies</CardTitle>
          <CardDescription>De toon en regels voor de assistent, in gewone taal.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="prompt">Prompt</Label>
            <Textarea
              id="prompt"
              rows={6}
              defaultValue="Je bent de vriendelijke receptionist van Van Dijk Installaties. Beantwoord vragen kort en duidelijk. Plan afspraken alleen op werkdagen. Verbind door naar een medewerker bij klachten."
            />
          </div>
          <div>
            <Button>Opslaan</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

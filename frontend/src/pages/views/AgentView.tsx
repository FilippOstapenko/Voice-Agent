import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function AgentView() {
  const [website, setWebsite] = useState("");
  const [prompt, setPrompt] = useState("");
  const [knowledge, setKnowledge] = useState("");
  const [busy, setBusy] = useState<"generate" | "save" | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([api.organization(), api.agent()])
      .then(([org, agent]) => {
        setWebsite(org.website ?? "");
        setPrompt(agent.prompt);
        setKnowledge(agent.knowledge);
      })
      .catch(() => setNotice("Kan instellingen niet laden. Draait de backend?"));
  }, []);

  async function generate() {
    setBusy("generate");
    setNotice(null);
    try {
      const agent = await api.generateKnowledge(website);
      setKnowledge(agent.knowledge);
      setNotice("Kennisbasis bijgewerkt.");
    } catch {
      setNotice("Genereren mislukt.");
    } finally {
      setBusy(null);
    }
  }

  async function save() {
    setBusy("save");
    setNotice(null);
    try {
      await api.saveAgent({ prompt, knowledge });
      setNotice("Opgeslagen.");
    } catch {
      setNotice("Opslaan mislukt.");
    } finally {
      setBusy(null);
    }
  }

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
            <div className="flex flex-col gap-2 sm:flex-row">
              <Input
                id="site"
                placeholder="https://jouwbedrijf.nl"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
              />
              <Button onClick={generate} disabled={busy !== null || !website}>
                {busy === "generate" ? "Bezig…" : "Genereer kennis"}
              </Button>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="knowledge">Kennisbasis</Label>
            <Textarea
              id="knowledge"
              rows={4}
              value={knowledge}
              onChange={(e) => setKnowledge(e.target.value)}
            />
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
            <Textarea id="prompt" rows={6} value={prompt} onChange={(e) => setPrompt(e.target.value)} />
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={save} disabled={busy !== null}>
              {busy === "save" ? "Bezig…" : "Opslaan"}
            </Button>
            {notice && <span className="text-sm text-muted-foreground">{notice}</span>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

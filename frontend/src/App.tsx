import { useState } from "react";
import { Phone } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function App() {
  const [health, setHealth] = useState<string>("");

  async function checkBackend() {
    try {
      const res = await fetch("http://localhost:3000/health");
      const data = await res.json();
      setHealth(JSON.stringify(data));
    } catch {
      setHealth("backend not reachable — is docker compose up?");
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center gap-6 p-8 text-center">
      <h1 className="text-4xl font-semibold tracking-tight">AI Voice Agent Platform</h1>
      <p className="text-muted-foreground">
        Foundation is running. Homepage and dashboard shells arrive in Phase 2a.
      </p>
      <div className="flex gap-3">
        <Button size="lg">
          <Phone className="mr-1 h-4 w-4" /> Let the AI call me
        </Button>
        <Button variant="outline" size="lg" onClick={checkBackend}>
          Check backend
        </Button>
      </div>
      {health && <code className="rounded bg-secondary px-3 py-1 text-sm">{health}</code>}
    </main>
  );
}

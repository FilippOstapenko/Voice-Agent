import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const usage = [
  { label: "Belminuten", used: 0, total: 300 },
  { label: "WhatsApp-gesprekken", used: 0, total: 200 },
  { label: "Chatgesprekken", used: 3, total: 500 },
];

export default function BillingView() {
  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-semibold tracking-tight">Abonnement</h1>
      <p className="mt-1 text-sm text-muted-foreground">Je plan en verbruik deze maand.</p>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            Compleet <Badge>Actief</Badge>
          </CardTitle>
          <CardDescription>€249 per maand · volgende factuur 1 september</CardDescription>
        </CardHeader>
        <CardContent className="flex gap-2">
          <Button variant="outline">Plan wijzigen</Button>
          <Button variant="ghost">Facturen bekijken</Button>
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="text-base">Verbruik</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {usage.map((u) => (
            <div key={u.label}>
              <div className="mb-1 flex justify-between text-sm">
                <span>{u.label}</span>
                <span className="text-muted-foreground">{u.used} / {u.total}</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${Math.max((u.used / u.total) * 100, 1)}%` }}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

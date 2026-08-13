import { useEffect, useState } from "react";
import { api, type BillingData } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const planLabel: Record<BillingData["plan"], string> = {
  START: "Start",
  COMPLEET: "Compleet",
  PRO: "Pro",
};

export default function BillingView() {
  const [data, setData] = useState<BillingData | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    api.billing().then(setData).catch(() => setError(true));
  }, []);

  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-semibold tracking-tight">Abonnement</h1>
      <p className="mt-1 text-sm text-muted-foreground">Je plan en verbruik deze maand.</p>

      {error && (
        <Card className="mt-6">
          <CardHeader>
            <CardDescription>Kan abonnementsgegevens niet laden. Draait de backend?</CardDescription>
          </CardHeader>
        </Card>
      )}
      {!error && data === null && <p className="mt-6 text-sm text-muted-foreground">Laden…</p>}

      {data && (
        <>
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                {planLabel[data.plan]}{" "}
                <Badge>{data.status === "active" ? "Actief" : data.status}</Badge>
              </CardTitle>
              <CardDescription>
                €{data.pricePerMonth} per maand · beheer via Stripe volgt in fase 2f
              </CardDescription>
            </CardHeader>
            <CardContent className="flex gap-2">
              <Button variant="outline" disabled>Plan wijzigen</Button>
              <Button variant="ghost" disabled>Facturen bekijken</Button>
            </CardContent>
          </Card>

          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-base">Verbruik</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {data.usage.map((u) => (
                <div key={u.label}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span>{u.label}</span>
                    <span className="text-muted-foreground">{u.used} / {u.quota}</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${Math.min(Math.max((u.used / u.quota) * 100, 1), 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

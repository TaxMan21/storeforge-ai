"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { apiGet, apiPost } from "@/lib/api-client";
import { Loader2, Check, Plug, ExternalLink } from "lucide-react";

const CATEGORIES: Record<string, string> = {
  PAYMENTS: "Payments",
  ANALYTICS: "Analytics",
  MARKETING: "Marketing",
  CONVERSION: "Conversion Optimization",
  FULFILLMENT: "Dropshipping / Fulfillment",
  SUPPORT: "Customer Support",
  SEO: "SEO",
};

export default function IntegrationsPage() {
  const params = useParams();
  const id = params.id as string;
  const [integrations, setIntegrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await apiGet(`/api/integrations?storeProjectId=${id}`);
        setIntegrations(data.integrations || []);
      } catch {}
      setLoading(false);
    }
    load();
  }, [id]);

  async function connectIntegration(integration: any) {
    setConnecting(integration.name);
    try {
      await apiPost("/api/integrations", {
        storeProjectId: id,
        name: integration.name,
        category: integration.category,
        config: {},
      });
      setIntegrations((prev) =>
        prev.map((i) =>
          i.name === integration.name ? { ...i, status: "CONNECTED", installed: true } : i
        )
      );
    } catch {}
    setConnecting(null);
  }

  const grouped = integrations.reduce((acc: Record<string, any[]>, i) => {
    (acc[i.category] = acc[i.category] || []).push(i);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="relative">
          <div className="h-10 w-10 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Integrations</h1>
        <p className="text-gray-500 mt-1">Connect essential tools to power your store.</p>
      </div>

      {Object.entries(CATEGORIES).map(([catKey, catLabel]) => {
        const items = grouped[catKey] || [];
        if (items.length === 0) return null;

        return (
          <div key={catKey}>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">{catLabel}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {items.map((int) => (
                <Card key={int.name} className={`card-premium border-gray-100 ${int.status === "CONNECTED" ? "ring-2 ring-green-500/20" : ""}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{int.name}</CardTitle>
                      {int.status === "CONNECTED" ? (
                        <Badge variant="success"><Check className="h-3 w-3 mr-1" /> Connected</Badge>
                      ) : (
                        <Badge variant="secondary">Recommended</Badge>
                      )}
                    </div>
                    <CardDescription>{int.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2">
                      {int.status !== "CONNECTED" ? (
                        <Button
                          size="sm"
                          onClick={() => connectIntegration(int)}
                          disabled={connecting === int.name}
                          className="gap-1"
                        >
                          {connecting === int.name ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Plug className="h-3.5 w-3.5" />
                          )}
                          Connect
                        </Button>
                      ) : (
                        <Button size="sm" variant="outline" className="gap-1">
                          <Check className="h-3.5 w-3.5" /> Connected
                        </Button>
                      )}
                      {int.url && int.url !== "#" && (
                        <a href={int.url} target="_blank" rel="noopener noreferrer">
                          <Button size="sm" variant="ghost" className="gap-1">
                            <ExternalLink className="h-3.5 w-3.5" /> Visit
                          </Button>
                        </a>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiPost } from "@/lib/api-client";
import { Store, ShoppingCart, Globe } from "lucide-react";
import { cn } from "@/lib/utils";

export default function NewStorePage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [platform, setPlatform] = useState<"SHOPIFY" | "WOOCOMMERCE" | "CUSTOM">("SHOPIFY");
  const [storeType, setStoreType] = useState<"ONE_PRODUCT" | "NICHE" | "GENERAL">("NICHE");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { setError("Store name is required"); return; }
    setLoading(true);
    setError("");
    try {
      const data = await apiPost("/api/store-projects", { name, platform, storeType });
      router.push(`/dashboard/stores/${data.project.id}/questionnaire`);
    } catch (err: any) {
      setError(err.message || "Failed to create store");
      setLoading(false);
    }
  }

  const platforms = [
    { id: "SHOPIFY" as const, label: "Shopify", icon: Store, desc: "Most popular platform" },
    { id: "WOOCOMMERCE" as const, label: "WooCommerce", icon: ShoppingCart, desc: "WordPress-based" },
    { id: "CUSTOM" as const, label: "Custom Store", icon: Globe, desc: "Build from scratch" },
  ];

  const storeTypes = [
    { id: "ONE_PRODUCT" as const, label: "One Product", desc: "Focus on a single hero product" },
    { id: "NICHE" as const, label: "Niche Store", desc: "Curated products in one niche" },
    { id: "GENERAL" as const, label: "General Store", desc: "Wide variety of products" },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Create New Store</h1>
        <p className="text-gray-500 mt-1">Set up your store foundation before the AI builds it.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-700">{error}</div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Store Name</CardTitle>
            <CardDescription>Choose a memorable name for your store.</CardDescription>
          </CardHeader>
          <CardContent>
            <Input
              placeholder="e.g. EcoGlow Essentials"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={100}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Platform</CardTitle>
            <CardDescription>Where will your store be hosted?</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              {platforms.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPlatform(p.id)}
                  className={cn(
                    "flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all",
                    platform === p.id
                      ? "border-indigo-600 bg-indigo-50"
                      : "border-gray-200 hover:border-gray-300"
                  )}
                >
                  <p.icon className="h-8 w-8 text-gray-600" />
                  <span className="font-medium text-sm">{p.label}</span>
                  <span className="text-xs text-gray-500">{p.desc}</span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Store Type</CardTitle>
            <CardDescription>How many products will you sell?</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              {storeTypes.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setStoreType(t.id)}
                  className={cn(
                    "flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all text-center",
                    storeType === t.id
                      ? "border-indigo-600 bg-indigo-50"
                      : "border-gray-200 hover:border-gray-300"
                  )}
                >
                  <span className="font-medium text-sm">{t.label}</span>
                  <span className="text-xs text-gray-500">{t.desc}</span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
          <Button type="submit" size="lg" disabled={loading}>
            {loading ? "Creating..." : "Next: Start Questionnaire"}
          </Button>
        </div>
      </form>
    </div>
  );
}

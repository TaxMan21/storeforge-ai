"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { apiGet, apiPost } from "@/lib/api-client";
import { Loader2, TrendingUp, ShoppingCart, ExternalLink, Plus, Check } from "lucide-react";

export default function ProductsPage() {
  const params = useParams();
  const id = params.id as string;
  const [candidates, setCandidates] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [researching, setResearching] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [researchData, selectedData] = await Promise.all([
          apiGet(`/api/products/research?storeProjectId=${id}&limit=20`),
          apiGet(`/api/products/select?storeProjectId=${id}`),
        ]);
        if (!cancelled) {
          setCandidates(researchData.products || []);
          setSelectedIds(new Set((selectedData.products || []).map((p: any) => p.productCandidateId).filter(Boolean)));
        }
      } catch {}
      if (!cancelled) setLoading(false);
    }
    load();
    return () => { cancelled = true; };
  }, [id]);

  async function runResearch() {
    setResearching(true);
    try {
      const data = await apiPost("/api/products/research", { storeProjectId: id });
      setCandidates(data.products || []);
    } catch {}
    setResearching(false);
  }

  async function selectProduct(product: any) {
    try {
      await apiPost("/api/products/select", {
        storeProjectId: id,
        productCandidateId: product.id,
        sellingPrice: product.recommendedPrice,
      });
      setSelectedIds((prev) => new Set([...prev, product.id]));
    } catch {}
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Product Research</h1>
          <p className="text-gray-500 mt-1">Find and select winning products for your store.</p>
        </div>
        <Button onClick={runResearch} disabled={researching} className="gap-2">
          {researching ? <Loader2 className="h-4 w-4 animate-spin" /> : <TrendingUp className="h-4 w-4" />}
          {researching ? "Researching..." : "AI Product Research"}
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 rounded-xl bg-gray-200 animate-pulse" />
          ))}
        </div>
      ) : candidates.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <ShoppingCart className="h-16 w-16 text-gray-300 mb-4" />
            <p className="text-lg text-gray-500 mb-2">No products yet</p>
            <p className="text-sm text-gray-400 mb-6">Run AI product research to find trending products.</p>
            <Button onClick={runResearch} className="gap-2"><TrendingUp className="h-4 w-4" /> Start Research</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {candidates.map((product) => (
            <Card key={product.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="text-base leading-tight">{product.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="bg-gray-50 rounded p-2">
                    <p className="text-gray-500 text-xs">Cost</p>
                    <p className="font-semibold">${product.costPrice?.toFixed(2)}</p>
                  </div>
                  <div className="bg-gray-50 rounded p-2">
                    <p className="text-gray-500 text-xs">Sell At</p>
                    <p className="font-semibold">${product.recommendedPrice?.toFixed(2)}</p>
                  </div>
                  <div className="bg-green-50 rounded p-2">
                    <p className="text-gray-500 text-xs">Margin</p>
                    <p className="font-semibold text-green-700">{product.estimatedMargin?.toFixed(0)}%</p>
                  </div>
                  <div className="bg-blue-50 rounded p-2">
                    <p className="text-gray-500 text-xs">Shipping</p>
                    <p className="font-semibold">{product.shippingTimeDays}d</p>
                  </div>
                </div>

                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Trend Score</span>
                    <span className="font-medium">{product.trendScore}/10</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Risk Score</span>
                    <span className="font-medium">{product.riskScore}/10</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Opportunity</span>
                    <span className="font-medium text-green-600">{product.opportunityScore}/10</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">TikTok Potential</span>
                    <span className="font-medium">{product.tiktokPotential}/10</span>
                  </div>
                </div>

                {product.adHook && (
                  <p className="text-xs text-gray-600 italic bg-gray-50 rounded p-2">"{product.adHook}"</p>
                )}

                <div className="flex gap-2">
                  {selectedIds.has(product.id) ? (
                    <Button variant="secondary" className="flex-1 gap-1" disabled>
                      <Check className="h-3.5 w-3.5" /> Selected
                    </Button>
                  ) : (
                    <Button variant="outline" className="flex-1 gap-1" onClick={() => selectProduct(product)}>
                      <Plus className="h-3.5 w-3.5" /> Select
                    </Button>
                  )}
                  {product.supplierUrl && (
                    <a href={product.supplierUrl} target="_blank" rel="noopener noreferrer">
                      <Button variant="ghost" size="icon"><ExternalLink className="h-4 w-4" /></Button>
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { apiGet, apiPatch } from "@/lib/api-client";
import { Loader2, Check, Palette, Type, Layout, Puzzle, ShoppingCart } from "lucide-react";

export default function BlueprintPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const data = await apiGet(`/api/store-projects/${id}`);
        setProject(data.project);
      } catch { router.push("/dashboard/stores"); }
      setLoading(false);
    }
    load();
  }, [id, router]);

  async function approveBlueprint() {
    setApproving(true);
    try {
      await apiPatch(`/api/store-projects/${id}`, { status: "BLUEPRINT_APPROVED" });
      // Initialize pages
      await apiPost("/api/pages", { storeProjectId: id });
      setProject((p: any) => ({ ...p, status: "BLUEPRINT_APPROVED" }));
    } catch {}
    setApproving(false);
  }

  async function apiPost(url: string, body?: any) {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
    });
    return res.json();
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  const blueprint = project?.blueprintData;
  if (!blueprint) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16">
        <p className="text-gray-500 mb-4">No blueprint generated yet.</p>
        <Button onClick={() => router.push(`/dashboard/stores/${id}/questionnaire`)}>
          Complete Questionnaire First
        </Button>
      </div>
    );
  }

  const isApproved = ["BLUEPRINT_APPROVED", "BUILDING", "READY", "LIVE"].includes(project.status);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Store Blueprint</h1>
          <p className="text-gray-500 mt-1">Review and approve your AI-generated store blueprint.</p>
        </div>
        <Badge variant={isApproved ? "success" : "warning"}>
          {isApproved ? "Approved" : "Pending Approval"}
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-indigo-600" />
            Brand Identity
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-gray-500 mb-1">Store Name</p>
            <p className="text-xl font-bold text-gray-900">{blueprint.storeName}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Logo Concept</p>
            <p className="text-gray-700">{blueprint.logoConcept?.description}</p>
            <Badge variant="secondary" className="mt-1">{blueprint.logoConcept?.style}</Badge>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-2">Brand Colors</p>
            <div className="flex gap-3">
              {Object.entries(blueprint.brandColors || {}).map(([name, hex]) => (
                <div key={name} className="flex flex-col items-center gap-1">
                  <div className="h-10 w-10 rounded-lg border shadow-sm" style={{ backgroundColor: hex as string }} />
                  <span className="text-xs text-gray-500">{name}</span>
                  <span className="text-xs font-mono">{hex as string}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Brand Voice</p>
            <p className="text-gray-700">{blueprint.brandVoice}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Type className="h-5 w-5 text-indigo-600" />
            Typography
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-500">Heading Font</p>
              <p className="font-semibold">{blueprint.fonts?.heading}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Body Font</p>
              <p className="font-semibold">{blueprint.fonts?.body}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Accent Font</p>
              <p className="font-semibold">{blueprint.fonts?.accent}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layout className="h-5 w-5 text-indigo-600" />
            Homepage Sections
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {blueprint.homepageSections?.map((section: any, i: number) => (
              <div key={i} className="flex items-center gap-4 p-3 rounded-lg bg-gray-50">
                <div className="h-8 w-8 rounded bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm">
                  {i + 1}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{section.title}</p>
                  <p className="text-sm text-gray-500">{section.description}</p>
                </div>
                <Badge variant="secondary">{section.type}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-indigo-600" />
            Product Strategy
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-500">Target Products</p>
              <p className="font-semibold">{blueprint.productStrategy?.count}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Price Range</p>
              <p className="font-semibold">{blueprint.productStrategy?.priceRange}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Categories</p>
              <p className="font-semibold">{blueprint.productStrategy?.categories?.join(", ")}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Puzzle className="h-5 w-5 text-indigo-600" />
            Recommended Integrations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {blueprint.recommendedIntegrations?.map((int: string) => (
              <Badge key={int} variant="secondary">{int}</Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={() => router.push(`/dashboard/stores/${id}`)}>
          Back to Store
        </Button>
        {!isApproved ? (
          <Button onClick={approveBlueprint} disabled={approving} size="lg" className="gap-2">
            {approving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            {approving ? "Approving..." : "Approve Blueprint"}
          </Button>
        ) : (
          <Button onClick={() => router.push(`/dashboard/stores/${id}/products`)} size="lg" className="gap-2">
            Next: Select Products
          </Button>
        )}
      </div>
    </div>
  );
}

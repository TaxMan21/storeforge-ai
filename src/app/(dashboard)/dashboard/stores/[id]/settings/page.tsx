"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { apiGet, apiPatch } from "@/lib/api-client";
import { Loader2, Save, Trash2, ExternalLink } from "lucide-react";

export default function StoreSettingsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [customDomain, setCustomDomain] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const data = await apiGet(`/api/store-projects/${id}`);
        setProject(data.project);
        setName(data.project.name);
        setCustomDomain(data.project.customDomain || "");
      } catch { router.push("/dashboard/stores"); }
      setLoading(false);
    }
    load();
  }, [id, router]);

  async function saveSettings() {
    setSaving(true);
    try {
      await apiPatch(`/api/store-projects/${id}`, { name, customDomain });
      setProject((p: any) => ({ ...p, name, customDomain }));
    } catch {}
    setSaving(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Store Settings</h1>
        <p className="text-gray-500 mt-1">Configure your store settings.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>General</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Store Name</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} className="mt-1" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Platform</label>
            <div className="mt-1"><Badge variant="secondary">{project?.platform}</Badge></div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Status</label>
            <div className="mt-1"><Badge variant={project?.status === "LIVE" ? "success" : "secondary"}>{project?.status?.replace(/_/g, " ")}</Badge></div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Custom Domain</label>
            <Input value={customDomain} onChange={(e) => setCustomDomain(e.target.value)} placeholder="yourstore.com" className="mt-1" />
          </div>
          <Button onClick={saveSettings} disabled={saving} className="gap-2">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Settings
          </Button>
        </CardContent>
      </Card>

      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-red-600">Danger Zone</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 mb-4">Permanently delete this store and all associated data. This action cannot be undone.</p>
          <Button variant="destructive" className="gap-2" onClick={async () => {
            if (!confirm("Are you sure? This is irreversible.")) return;
            await fetch(`/api/store-projects/${id}`, { method: "DELETE" });
            router.push("/dashboard/stores");
          }}>
            <Trash2 className="h-4 w-4" /> Delete Store
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { apiGet, apiDelete } from "@/lib/api-client";
import { Plus, Store, Trash2, ExternalLink } from "lucide-react";

export default function StoresPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const data = await apiGet("/api/store-projects");
        if (!cancelled) setProjects(data.projects);
      } catch {}
      if (!cancelled) setLoading(false);
    }
    load();
    return () => { cancelled = true; };
  }, []);

  async function handleDelete(id: string) {
    if (!confirm("Delete this store? This cannot be undone.")) return;
    try {
      await apiDelete(`/api/store-projects/${id}`);
      setProjects((prev) => prev.filter((p) => p.id !== id));
    } catch {}
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">My Stores</h1>
        <Link href="/dashboard/stores/new">
          <Button className="gap-2"><Plus className="h-4 w-4" /> Create New Store</Button>
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 rounded-xl bg-gray-200 animate-pulse" />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Store className="h-16 w-16 text-gray-300 mb-4" />
            <p className="text-lg text-gray-500 mb-2">No stores yet</p>
            <p className="text-sm text-gray-400 mb-6">Create your first AI-powered store to get started.</p>
            <Link href="/dashboard/stores/new">
              <Button size="lg" className="gap-2"><Plus className="h-5 w-5" /> Create Store</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Card key={project.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="truncate">{project.name}</span>
                  <Badge variant={project.status === "LIVE" ? "success" : project.status === "DRAFT" ? "warning" : "secondary"}>
                    {project.status.replace(/_/g, " ")}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-gray-500 space-y-1">
                  <p>Platform: {project.platform}</p>
                  <p>Type: {project.storeType?.replace(/_/g, " ")}</p>
                  <p>Products: {project._count?.selectedProducts || 0}</p>
                </div>
                <div className="flex gap-2">
                  <Link href={`/dashboard/stores/${project.id}`} className="flex-1">
                    <Button variant="outline" className="w-full gap-1" size="sm">
                      <ExternalLink className="h-3.5 w-3.5" /> Manage
                    </Button>
                  </Link>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(project.id)} className="text-red-500 hover:text-red-700">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

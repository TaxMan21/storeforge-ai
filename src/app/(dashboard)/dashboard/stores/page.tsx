"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { apiGet, apiDelete } from "@/lib/api-client";
import { Plus, Store, Trash2, ExternalLink, Package } from "lucide-react";

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
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Stores</h1>
          <p className="text-gray-500 mt-1">Manage and monitor all your AI-built stores.</p>
        </div>
        <Link href="/dashboard/stores/new">
          <Button className="gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-lg shadow-indigo-500/25 btn-shine">
            <Plus className="h-4 w-4" /> Create New Store
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 rounded-2xl bg-gray-100 animate-pulse" />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <Card className="border-gray-100">
          <CardContent className="flex flex-col items-center justify-center py-20">
            <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center mb-6">
              <Store className="h-10 w-10 text-indigo-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No stores yet</h3>
            <p className="text-gray-500 mb-8 text-center max-w-sm">Create your first AI-powered store and watch it come to life in minutes.</p>
            <Link href="/dashboard/stores/new">
              <Button size="lg" className="gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-lg shadow-indigo-500/25 btn-shine">
                <Plus className="h-5 w-5" /> Create Your First Store
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Card key={project.id} className="card-premium border-gray-100 overflow-hidden">
              <div className="h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between">
                  <span className="truncate text-lg">{project.name}</span>
                  <Badge variant={project.status === "LIVE" ? "success" : project.status === "DRAFT" ? "warning" : "secondary"}>
                    {project.status.replace(/_/g, " ")}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1.5">
                    <Package className="h-4 w-4" /> {project._count?.selectedProducts || 0} products
                  </span>
                  <span>{project.platform}</span>
                </div>
                <div className="flex gap-2">
                  <Link href={`/dashboard/stores/${project.id}`} className="flex-1">
                    <Button variant="outline" className="w-full gap-1 rounded-xl" size="sm">
                      <ExternalLink className="h-3.5 w-3.5" /> Manage
                    </Button>
                  </Link>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(project.id)} className="text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl">
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

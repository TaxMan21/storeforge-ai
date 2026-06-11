"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { apiGet, apiPatch } from "@/lib/api-client";
import { Loader2, FileText, Plus, Eye, EyeOff } from "lucide-react";

export default function PagesPage() {
  const params = useParams();
  const id = params.id as string;
  const [pages, setPages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [initializing, setInitializing] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const data = await apiGet(`/api/pages?storeProjectId=${id}`);
        if (!cancelled) setPages(data.pages || []);
      } catch {}
      if (!cancelled) setLoading(false);
    }
    load();
    return () => { cancelled = true; };
  }, [id]);

  async function initializePages() {
    setInitializing(true);
    try {
      const data = await apiPost("/api/pages", { storeProjectId: id });
      setPages(data.pages || []);
    } catch {}
    setInitializing(false);
  }

  async function apiPost(url: string, body?: any) {
    const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: body ? JSON.stringify(body) : undefined });
    return res.json();
  }

  async function togglePublish(page: any) {
    try {
      await apiPatch(`/api/pages/${page.id}`, { isPublished: !page.isPublished });
      setPages((prev) => prev.map((p) => p.id === page.id ? { ...p, isPublished: !p.isPublished } : p));
    } catch {}
  }

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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Store Pages</h1>
          <p className="text-gray-500 mt-1">Manage your store pages and content.</p>
        </div>
        {pages.length === 0 && (
          <Button onClick={initializePages} disabled={initializing} className="gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-lg shadow-indigo-500/25 btn-shine">
            {initializing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Initialize Pages
          </Button>
        )}
      </div>

      {pages.length === 0 ? (
        <Card className="border-gray-100">
          <CardContent className="flex flex-col items-center justify-center py-20">
            <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-orange-100 to-red-100 flex items-center justify-center mb-6">
              <FileText className="h-10 w-10 text-orange-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No pages yet</h3>
            <p className="text-gray-500 mb-8 text-center max-w-sm">Initialize your store pages to get started with content.</p>
            <Button onClick={initializePages} disabled={initializing} className="gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-lg shadow-indigo-500/25 btn-shine">
              {initializing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Create Default Pages
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {pages.map((page) => (
            <Card key={page.id} className="card-premium border-gray-100">
              <CardContent className="flex items-center gap-4 py-4">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-white">
                  <FileText className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{page.title}</p>
                  <p className="text-sm text-gray-500">/{page.slug}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={page.isPublished ? "success" : "secondary"}>
                    {page.isPublished ? "Published" : "Draft"}
                  </Badge>
                  <Button variant="ghost" size="icon" onClick={() => togglePublish(page)} title={page.isPublished ? "Unpublish" : "Publish"} className="rounded-xl">
                    {page.isPublished ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
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

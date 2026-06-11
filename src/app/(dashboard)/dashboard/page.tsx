"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/stores/auth-store";
import { apiGet } from "@/lib/api-client";
import {
  Store,
  ShoppingCart,
  Sparkles,
  TrendingUp,
  Plus,
  ArrowRight,
} from "lucide-react";

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const [stats, setStats] = useState({ projects: 0, products: 0, plan: "FREE" });
  const [recentProjects, setRecentProjects] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const projects = await apiGet("/api/store-projects");
        setRecentProjects(projects.projects.slice(0, 3));
        setStats((s) => ({ ...s, projects: projects.projects.length }));
      } catch {}
    }
    load();
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.name || "there"}
          </h1>
          <p className="text-gray-500 mt-1">Build and optimize your ecommerce empire with AI.</p>
        </div>
        <Link href="/dashboard/stores/new">
          <Button size="lg" className="gap-2">
            <Plus className="h-5 w-5" />
            Create New Store
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Stores</CardTitle>
            <Store className="h-5 w-5 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.projects}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Products Selected</CardTitle>
            <ShoppingCart className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.products}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">AI Generations</CardTitle>
            <Sparkles className="h-5 w-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">0</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Current Plan</CardTitle>
            <TrendingUp className="h-5 w-5 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className="text-3xl font-bold">{user?.subscription?.plan || "FREE"}</span>
              <Badge variant="success">{user?.subscription?.status || "Active"}</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Recent Stores</h2>
          <Link href="/dashboard/stores" className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        {recentProjects.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Store className="h-12 w-12 text-gray-300 mb-4" />
              <p className="text-gray-500 mb-4">You haven't created any stores yet.</p>
              <Link href="/dashboard/stores/new">
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create Your First Store
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recentProjects.map((project) => (
              <Link key={project.id} href={`/dashboard/stores/${project.id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      {project.name}
                      <Badge variant={project.status === "LIVE" ? "success" : "secondary"}>
                        {project.status.replace(/_/g, " ")}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-500">
                      {project.platform} &middot; {project.storeType?.replace(/_/g, " ")}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

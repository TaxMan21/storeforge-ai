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
  Zap,
  BarChart3,
  Crown,
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
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 p-8 md:p-10">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
          backgroundSize: '24px 24px'
        }} />
        <div className="orb w-64 h-64 bg-white/10 -top-20 -right-20 animate-orb-1" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
              Welcome back, {user?.name || "there"} 👋
            </h1>
            <p className="text-lg text-white/80">
              Build and optimize your ecommerce empire with AI.
            </p>
          </div>
          <Link href="/dashboard/stores/new">
            <Button className="h-12 px-6 rounded-xl bg-white text-indigo-600 hover:bg-gray-50 font-semibold shadow-xl btn-shine">
              <Plus className="h-5 w-5 mr-2" />
              Create New Store
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            title: "Total Stores",
            value: stats.projects,
            icon: Store,
            color: "from-blue-500 to-cyan-500",
            bgColor: "bg-blue-50",
            iconColor: "text-blue-600",
          },
          {
            title: "Products Selected",
            value: stats.products,
            icon: ShoppingCart,
            color: "from-green-500 to-emerald-500",
            bgColor: "bg-green-50",
            iconColor: "text-green-600",
          },
          {
            title: "AI Generations",
            value: 0,
            icon: Sparkles,
            color: "from-purple-500 to-pink-500",
            bgColor: "bg-purple-50",
            iconColor: "text-purple-600",
          },
          {
            title: "Current Plan",
            value: user?.subscription?.plan || "FREE",
            icon: Crown,
            color: "from-orange-500 to-red-500",
            bgColor: "bg-orange-50",
            iconColor: "text-orange-600",
            isPlan: true,
          },
        ].map((stat, i) => (
          <Card key={i} className="card-premium border-gray-100">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">{stat.title}</p>
                  {stat.isPlan ? (
                    <div className="flex items-center gap-2">
                      <span className="text-3xl font-bold text-gray-900">{stat.value}</span>
                      <Badge variant="success" className="text-xs">Active</Badge>
                    </div>
                  ) : (
                    <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  )}
                </div>
                <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.iconColor}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              title: "Create New Store",
              desc: "Start building with AI",
              icon: Plus,
              href: "/dashboard/stores/new",
              color: "from-indigo-500 to-purple-600",
            },
            {
              title: "View Analytics",
              desc: "Track your performance",
              icon: BarChart3,
              href: "/dashboard/analytics",
              color: "from-green-500 to-emerald-600",
            },
            {
              title: "Upgrade Plan",
              desc: "Unlock premium features",
              icon: Zap,
              href: "/dashboard/billing",
              color: "from-orange-500 to-red-500",
            },
          ].map((action, i) => (
            <Link key={i} href={action.href}>
              <Card className="card-premium border-gray-100 cursor-pointer group">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${action.color} text-white shadow-lg group-hover:scale-110 transition-transform`}>
                      <action.icon className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{action.title}</p>
                      <p className="text-sm text-gray-500">{action.desc}</p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-gray-300 ml-auto group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Stores */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Recent Stores</h2>
          <Link href="/dashboard/stores" className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1 font-medium">
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        {recentProjects.length === 0 ? (
          <Card className="border-gray-100">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="h-16 w-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
                <Store className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-lg font-semibold text-gray-900 mb-2">No stores yet</p>
              <p className="text-gray-500 mb-6">Create your first AI-powered store to get started.</p>
              <Link href="/dashboard/stores/new">
                <Button className="gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-lg shadow-indigo-500/25">
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
                <Card className="card-premium border-gray-100 cursor-pointer h-full">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="font-bold text-gray-900 text-lg">{project.name}</h3>
                      <Badge variant={project.status === "LIVE" ? "success" : project.status === "DRAFT" ? "warning" : "secondary"}>
                        {project.status.replace(/_/g, " ")}
                      </Badge>
                    </div>
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

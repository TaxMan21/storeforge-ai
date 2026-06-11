"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { apiGet } from "@/lib/api-client";
import { BarChart3, ShoppingCart, Store, TrendingUp } from "lucide-react";

export default function AnalyticsPage() {
  const [projects, setProjects] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const data = await apiGet("/api/store-projects");
        setProjects(data.projects || []);
      } catch {}
    }
    load();
  }, []);

  const totalProducts = projects.reduce((sum, p) => sum + (p._count?.selectedProducts || 0), 0);
  const totalIntegrations = projects.reduce((sum, p) => sum + (p._count?.integrations || 0), 0);

  const stats = [
    { label: "Total Stores", value: projects.length, icon: Store, color: "from-blue-500 to-cyan-500", bgColor: "bg-blue-50" },
    { label: "Products Selected", value: totalProducts, icon: ShoppingCart, color: "from-green-500 to-emerald-500", bgColor: "bg-green-50" },
    { label: "Integrations", value: totalIntegrations, icon: BarChart3, color: "from-purple-500 to-pink-500", bgColor: "bg-purple-50" },
    { label: "Live Stores", value: projects.filter((p) => p.status === "LIVE").length, icon: TrendingUp, color: "from-orange-500 to-red-500", bgColor: "bg-orange-50" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Analytics Overview</h1>
        <p className="text-gray-500 mt-1">High-level view of all your stores.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <Card key={i} className="card-premium border-gray-100">
            <CardContent className="flex items-center gap-4 py-6">
              <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-500">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-gray-100">
        <CardContent className="py-16 text-center">
          <div className="h-16 w-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <BarChart3 className="h-8 w-8 text-gray-400" />
          </div>
          <p className="text-lg font-semibold text-gray-900 mb-2">Detailed Analytics Coming Soon</p>
          <p className="text-gray-500 max-w-md mx-auto">Detailed analytics will appear once your stores are live and connected to Google Analytics.</p>
        </CardContent>
      </Card>
    </div>
  );
}

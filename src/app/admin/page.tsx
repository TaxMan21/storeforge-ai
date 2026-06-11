"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { apiGet } from "@/lib/api-client";
import { Shield, Users, Store, Activity, AlertTriangle } from "lucide-react";

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await apiGet("/api/admin/dashboard");
        setStats(data);
      } catch {}
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-48 bg-gray-100 rounded-xl animate-pulse" />
        <div className="grid grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-32 bg-gray-100 rounded-2xl animate-pulse" />)}
        </div>
      </div>
    );
  }

  const s = stats?.stats || {};

  const statCards = [
    { label: "Total Users", value: s.totalUsers || 0, icon: Users, color: "from-blue-500 to-cyan-500" },
    { label: "Store Projects", value: s.totalProjects || 0, icon: Store, color: "from-green-500 to-emerald-500" },
    { label: "Paid Subscriptions", value: s.activePaidSubscriptions || 0, icon: Activity, color: "from-purple-500 to-pink-500" },
    { label: "AI Calls Today", value: s.aiUsageToday || 0, icon: AlertTriangle, color: "from-orange-500 to-red-500" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
          <Shield className="h-5 w-5 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => (
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
        <CardHeader>
          <CardTitle className="text-lg">Plan Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            {Object.entries(s.planBreakdown || {}).map(([plan, count]) => (
              <div key={plan} className="flex items-center gap-2">
                <Badge variant={plan === "PRO" ? "default" : plan === "AGENCY" ? "success" : "secondary"}>{plan}</Badge>
                <span className="font-semibold">{count as number}</span>
              </div>
            ))}
            {Object.keys(s.planBreakdown || {}).length === 0 && (
              <p className="text-sm text-gray-500">No paid subscriptions yet.</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="border-gray-100">
        <CardHeader>
          <CardTitle className="text-lg">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {(stats?.recentActivity || []).slice(0, 10).map((log: any) => (
              <div key={log.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 text-sm transition-colors">
                <Badge variant="secondary" className="text-xs">{log.action}</Badge>
                <span className="text-gray-500">{log.resource}</span>
                <span className="text-gray-400 text-xs ml-auto">{new Date(log.createdAt).toLocaleString()}</span>
              </div>
            ))}
            {(!stats?.recentActivity || stats.recentActivity.length === 0) && (
              <p className="text-sm text-gray-500">No recent activity.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

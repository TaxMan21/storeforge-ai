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
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
        <div className="grid grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-32 bg-gray-200 rounded-xl animate-pulse" />)}
        </div>
      </div>
    );
  }

  const s = stats?.stats || {};

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <Shield className="h-8 w-8 text-red-600" />
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="flex items-center gap-4 py-6">
            <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{s.totalUsers || 0}</p>
              <p className="text-sm text-gray-500">Total Users</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 py-6">
            <div className="h-12 w-12 rounded-xl bg-green-100 flex items-center justify-center">
              <Store className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{s.totalProjects || 0}</p>
              <p className="text-sm text-gray-500">Store Projects</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 py-6">
            <div className="h-12 w-12 rounded-xl bg-purple-100 flex items-center justify-center">
              <Activity className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{s.activePaidSubscriptions || 0}</p>
              <p className="text-sm text-gray-500">Paid Subscriptions</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 py-6">
            <div className="h-12 w-12 rounded-xl bg-orange-100 flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{s.aiUsageToday || 0}</p>
              <p className="text-sm text-gray-500">AI Calls Today</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Plan Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            {Object.entries(s.planBreakdown || {}).map(([plan, count]) => (
              <div key={plan} className="flex items-center gap-2">
                <Badge variant={plan === "PRO" ? "default" : plan === "AGENCY" ? "success" : "secondary"}>
                  {plan}
                </Badge>
                <span className="font-semibold">{count as number}</span>
              </div>
            ))}
            {Object.keys(s.planBreakdown || {}).length === 0 && (
              <p className="text-sm text-gray-500">No paid subscriptions yet.</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {(stats?.recentActivity || []).slice(0, 10).map((log: any) => (
              <div key={log.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 text-sm">
                <Badge variant="secondary" className="text-xs">{log.action}</Badge>
                <span className="text-gray-500">{log.resource}</span>
                <span className="text-gray-400 text-xs ml-auto">
                  {new Date(log.createdAt).toLocaleString()}
                </span>
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

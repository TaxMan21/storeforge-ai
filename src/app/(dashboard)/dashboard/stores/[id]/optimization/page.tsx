"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { apiGet, apiPost } from "@/lib/api-client";
import { Loader2, BarChart3, TrendingUp, Search, ShoppingCart, Gauge, Shield, Megaphone, RefreshCw } from "lucide-react";

const CATEGORY_ICONS: Record<string, any> = {
  STORE_READINESS: Gauge,
  PRODUCT_OPPORTUNITY: TrendingUp,
  SEO: Search,
  CONVERSION: ShoppingCart,
  SPEED: Gauge,
  TRUST: Shield,
  MARKETING: Megaphone,
};

const CATEGORY_LABELS: Record<string, string> = {
  STORE_READINESS: "Store Readiness",
  PRODUCT_OPPORTUNITY: "Product Opportunity",
  SEO: "SEO Score",
  CONVERSION: "Conversion Score",
  SPEED: "Speed Score",
  TRUST: "Trust Score",
  MARKETING: "Marketing Setup",
};

export default function OptimizationPage() {
  const params = useParams();
  const id = params.id as string;
  const [scores, setScores] = useState<any[]>([]);
  const [overall, setOverall] = useState(0);
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const data = await apiGet(`/api/optimization?storeProjectId=${id}`);
        if (!cancelled) {
          setScores(data.scores || []);
          setOverall(data.overallScore || 0);
        }
      } catch {}
      if (!cancelled) setLoading(false);
    }
    load();
    return () => { cancelled = true; };
  }, [id]);

  async function recalculate() {
    setCalculating(true);
    try {
      const data = await apiPost("/api/optimization", { storeProjectId: id });
      setScores(data.scores || []);
      setOverall(data.overallScore || 0);
    } catch {}
    setCalculating(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Optimization Dashboard</h1>
          <p className="text-gray-500 mt-1">Track and improve your store performance.</p>
        </div>
        <Button onClick={recalculate} disabled={calculating} variant="outline" className="gap-2">
          <RefreshCw className={`h-4 w-4 ${calculating ? "animate-spin" : ""}`} />
          Recalculate
        </Button>
      </div>

      <Card>
        <CardContent className="py-8">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div className="h-32 w-32 rounded-full border-8 border-gray-200 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-4xl font-bold text-gray-900">{overall}</p>
                  <p className="text-sm text-gray-500">/ 100</p>
                </div>
              </div>
            </div>
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-900">Overall Store Score</h2>
              <p className="text-gray-500">
                {overall >= 80 ? "Excellent! Your store is well optimized." :
                 overall >= 50 ? "Good progress. Some areas need improvement." :
                 "Keep building! Complete more steps to improve your score."}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {scores.map((score) => {
          const Icon = CATEGORY_ICONS[score.category] || BarChart3;
          const percentage = Math.round((score.score / score.maxScore) * 100);

          return (
            <Card key={score.category}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Icon className="h-4 w-4 text-indigo-600" />
                    {CATEGORY_LABELS[score.category] || score.category}
                  </CardTitle>
                  <Badge variant={percentage >= 70 ? "success" : percentage >= 40 ? "warning" : "destructive"}>
                    {percentage}%
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <Progress value={percentage} />
                {score.recommendations && score.recommendations.length > 0 && (
                  <div className="space-y-1">
                    {score.recommendations.slice(0, 2).map((rec: string, i: number) => (
                      <p key={i} className="text-xs text-gray-500 flex items-start gap-1">
                        <span className="text-indigo-600 mt-0.5">•</span>
                        {rec}
                      </p>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

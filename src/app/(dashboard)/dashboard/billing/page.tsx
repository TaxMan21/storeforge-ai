"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/stores/auth-store";
import { apiGet, apiPost } from "@/lib/api-client";
import { Check, Loader2, CreditCard, Crown, Zap, X, Store, Package, FileText, Sparkles, Plug, Globe, Users, Download } from "lucide-react";

const PLANS = [
  {
    id: "FREE",
    name: "Free",
    price: "$0",
    period: "forever",
    color: "from-gray-500 to-slate-600",
    limits: { stores: 1, products: 5, pages: 3, aiGens: 10, integrations: 1, domains: 0, team: 0, agents: 1 },
    features: [
      { text: "1 store blueprint", included: true },
      { text: "5 products per store", included: true },
      { text: "3 pages per store", included: true },
      { text: "10 AI edits/day", included: true },
      { text: "1 integration", included: true },
      { text: "Store Strategy agent only", included: true },
      { text: "Custom domains", included: false },
      { text: "Export store", included: false },
      { text: "Email flows & ad creatives", included: false },
      { text: "Priority support", included: false },
    ],
  },
  {
    id: "STARTER",
    name: "Starter",
    price: "$29.99",
    period: "/month",
    yearlyPrice: "$249.99/year",
    color: "from-blue-500 to-cyan-500",
    limits: { stores: 2, products: 20, pages: 8, aiGens: 100, integrations: 5, domains: 1, team: 0, agents: 4 },
    features: [
      { text: "2 stores", included: true },
      { text: "20 products per store", included: true },
      { text: "8 pages per store", included: true },
      { text: "100 AI edits/day", included: true },
      { text: "5 integrations per store", included: true },
      { text: "4 AI agents (Strategy, Products, Branding, Design)", included: true },
      { text: "1 custom domain", included: true },
      { text: "SEO tools", included: true },
      { text: "Export store", included: false },
      { text: "Email flows & ad creatives", included: false },
    ],
  },
  {
    id: "PRO",
    name: "Pro",
    price: "$79.99",
    period: "/month",
    yearlyPrice: "$699.99/year",
    popular: true,
    color: "from-indigo-500 to-purple-600",
    limits: { stores: 5, products: 100, pages: 20, aiGens: 500, integrations: 15, domains: 3, team: 2, agents: 9 },
    features: [
      { text: "5 stores", included: true },
      { text: "100 products per store", included: true },
      { text: "20 pages per store", included: true },
      { text: "500 AI edits/day", included: true },
      { text: "15 integrations per store", included: true },
      { text: "All 10 AI agents", included: true },
      { text: "3 custom domains", included: true },
      { text: "Email flows & ad creatives", included: true },
      { text: "Export store", included: true },
      { text: "2 team members", included: true },
    ],
  },
  {
    id: "AGENCY",
    name: "Agency",
    price: "$199.99",
    period: "/month",
    yearlyPrice: "$1,799.99/year",
    color: "from-orange-500 to-red-500",
    limits: { stores: "Unlimited", products: "Unlimited", pages: "Unlimited", aiGens: "Unlimited", integrations: "Unlimited", domains: "Unlimited", team: "Unlimited", agents: 10 },
    features: [
      { text: "Unlimited stores", included: true },
      { text: "Unlimited products", included: true },
      { text: "Unlimited pages", included: true },
      { text: "Unlimited AI generations", included: true },
      { text: "Unlimited integrations", included: true },
      { text: "All 10 AI agents", included: true },
      { text: "Unlimited custom domains", included: true },
      { text: "White-label exports", included: true },
      { text: "Unlimited team members", included: true },
      { text: "API access & AB testing", included: true },
    ],
  },
];

const USAGE_ITEMS = [
  { key: "stores", label: "Stores", icon: Store },
  { key: "products", label: "Products", icon: Package },
  { key: "pages", label: "Pages", icon: FileText },
  { key: "aiGens", label: "AI Generations Today", icon: Sparkles },
  { key: "integrations", label: "Integrations", icon: Plug },
];

export default function BillingPage() {
  const user = useAuthStore((s) => s.user);
  const [upgrading, setUpgrading] = useState<string | null>(null);
  const [usage, setUsage] = useState<any>(null);
  const currentPlan = user?.subscription?.plan || "FREE";

  useEffect(() => {
    async function load() {
      try {
        const data = await apiGet("/api/billing/usage");
        setUsage(data);
      } catch {}
    }
    load();
  }, []);

  async function handleUpgrade(planId: string) {
    setUpgrading(planId);
    try {
      await apiPost("/api/billing/upgrade", { plan: planId });
      window.location.reload();
    } catch {}
    setUpgrading(null);
  }

  const currentPlanData = PLANS.find((p) => p.id === currentPlan) || PLANS[0];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Billing & Plans</h1>
        <p className="text-gray-500 mt-1">Manage your subscription and view plan limits.</p>
      </div>

      {/* Current Plan Card */}
      <Card className="overflow-hidden border-gray-100">
        <div className="h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
        <CardContent className="py-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                <Crown className="h-7 w-7 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Current Plan</p>
                <p className="text-3xl font-bold text-gray-900">{currentPlan}</p>
              </div>
            </div>
            <CreditCard className="h-12 w-12 text-gray-300" />
          </div>
        </CardContent>
      </Card>

      {/* Usage Limits */}
      {usage && (
        <Card className="border-gray-100">
          <CardHeader>
            <CardTitle className="text-lg">Current Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {USAGE_ITEMS.map(({ key, label, icon: Icon }) => {
                const current = usage[key] || 0;
                const limit = currentPlanData.limits[key as keyof typeof currentPlanData.limits];
                const limitNum = typeof limit === "number" ? limit : 999;
                const percentage = limitNum === 999 ? 0 : Math.min((current / limitNum) * 100, 100);

                return (
                  <div key={key} className="p-4 rounded-xl bg-gray-50">
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className="h-4 w-4 text-indigo-500" />
                      <span className="text-sm font-medium text-gray-700">{label}</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold text-gray-900">{current}</span>
                      <span className="text-sm text-gray-400">/ {limit === "Unlimited" ? "∞" : limit}</span>
                    </div>
                    {percentage > 0 && (
                      <div className="mt-2 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all ${percentage > 80 ? "bg-red-500" : "bg-gradient-to-r from-indigo-500 to-purple-500"}`} style={{ width: `${percentage}%` }} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Plan Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {PLANS.map((plan) => {
          const isCurrent = currentPlan === plan.id;
          const isUpgradeable = !isCurrent && ["FREE", "STARTER", "PRO"].indexOf(currentPlan) < ["FREE", "STARTER", "PRO", "AGENCY"].indexOf(plan.id);

          return (
            <Card key={plan.id} className={`relative card-premium border-gray-100 overflow-hidden ${plan.popular ? "ring-2 ring-indigo-500 shadow-xl shadow-indigo-500/10" : ""}`}>
              {plan.popular && <div className="h-1 bg-gradient-to-r from-indigo-500 to-purple-600" />}
              {plan.popular && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2">
                  <Badge className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white mt-3 px-3 py-1">
                    <Zap className="h-3 w-3 mr-1" /> Most Popular
                  </Badge>
                </div>
              )}
              <CardHeader className={plan.popular ? "pt-10" : ""}>
                <CardTitle className="text-lg">{plan.name}</CardTitle>
                <div>
                  <span className="text-3xl font-bold text-gray-900">{plan.price}</span>
                  <span className="text-gray-500">{plan.period}</span>
                </div>
                {plan.yearlyPrice && <p className="text-xs text-gray-400">{plan.yearlyPrice}</p>}
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Limits Summary */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    { label: "Stores", value: plan.limits.stores },
                    { label: "Products", value: plan.limits.products },
                    { label: "Pages", value: plan.limits.pages },
                    { label: "AI/Day", value: plan.limits.aiGens },
                  ].map(({ label, value }) => (
                    <div key={label} className="bg-gray-50 rounded-lg px-2 py-1.5">
                      <span className="text-gray-500">{label}</span>
                      <span className="font-semibold ml-1">{value === "Unlimited" ? "∞" : value}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-100 pt-3">
                  <ul className="space-y-2">
                    {plan.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        {f.included ? (
                          <div className="h-4 w-4 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Check className="h-2.5 w-2.5 text-green-600" />
                          </div>
                        ) : (
                          <div className="h-4 w-4 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <X className="h-2.5 w-2.5 text-gray-400" />
                          </div>
                        )}
                        <span className={f.included ? "" : "text-gray-400"}>{f.text}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {isCurrent ? (
                  <Button variant="outline" className="w-full rounded-xl" disabled>Current Plan</Button>
                ) : isUpgradeable ? (
                  <Button
                    className={`w-full rounded-xl ${plan.popular ? "bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-lg shadow-indigo-500/25 btn-shine" : ""}`}
                    variant={plan.popular ? "default" : "outline"}
                    onClick={() => handleUpgrade(plan.id)}
                    disabled={upgrading === plan.id}
                  >
                    {upgrading === plan.id ? <Loader2 className="h-4 w-4 animate-spin" /> : `Upgrade to ${plan.name}`}
                  </Button>
                ) : (
                  <Button variant="outline" className="w-full rounded-xl" disabled>
                    {currentPlan === "AGENCY" ? "Max Plan" : "Downgrade"}
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

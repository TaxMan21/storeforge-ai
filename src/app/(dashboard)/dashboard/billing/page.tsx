"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/stores/auth-store";
import { apiPost } from "@/lib/api-client";
import { Check, Loader2, CreditCard, Crown, Zap } from "lucide-react";

const PLANS = [
  {
    id: "FREE",
    name: "Free",
    price: "$0",
    period: "forever",
    features: ["1 store blueprint", "Limited AI edits", "Basic product suggestions", "Community support"],
    limits: "1 store, 5 products, 10 AI edits/day",
    color: "from-gray-500 to-slate-600",
  },
  {
    id: "STARTER",
    name: "Starter",
    price: "$29.99",
    period: "/month",
    features: ["Full store blueprint", "20 product suggestions", "Basic SEO", "Basic integrations", "Email support"],
    limits: "2 stores, 20 products, 100 AI edits/day",
    yearlyPrice: "$249.99/year",
    color: "from-blue-500 to-cyan-500",
  },
  {
    id: "PRO",
    name: "Pro",
    price: "$79.99",
    period: "/month",
    popular: true,
    features: ["Full AI store builder", "Trending product research", "AI ad copy & email flows", "Conversion optimization", "Priority support"],
    limits: "5 stores, 100 products, 500 AI edits/day",
    yearlyPrice: "$699.99/year",
    color: "from-indigo-500 to-purple-600",
  },
  {
    id: "AGENCY",
    name: "Agency",
    price: "$199.99",
    period: "/month",
    features: ["Multiple stores", "White-label exports", "Team members", "Advanced analytics", "Priority AI generation"],
    limits: "Unlimited stores, products, AI edits",
    yearlyPrice: "$1,799.99/year",
    color: "from-orange-500 to-red-500",
  },
];

export default function BillingPage() {
  const user = useAuthStore((s) => s.user);
  const [upgrading, setUpgrading] = useState<string | null>(null);
  const currentPlan = user?.subscription?.plan || "FREE";

  async function handleUpgrade(planId: string) {
    setUpgrading(planId);
    try {
      await apiPost("/api/billing/upgrade", { plan: planId });
      window.location.reload();
    } catch {}
    setUpgrading(null);
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Billing & Plans</h1>
        <p className="text-gray-500 mt-1">Manage your subscription and payment methods.</p>
      </div>

      <Card className="overflow-hidden border-gray-100">
        <div className="h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
        <CardContent className="py-8">
          <div className="flex items-center justify-between">
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {PLANS.map((plan) => {
          const isCurrent = currentPlan === plan.id;
          const isUpgradeable = !isCurrent && currentPlan !== "AGENCY";

          return (
            <Card key={plan.id} className={`relative card-premium border-gray-100 overflow-hidden ${plan.popular ? "ring-2 ring-indigo-500 shadow-xl shadow-indigo-500/10" : ""}`}>
              {plan.popular && (
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-600" />
              )}
              {plan.popular && (
                <div className="absolute -top-0 left-1/2 -translate-x-1/2">
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
                <ul className="space-y-2.5">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <div className="h-5 w-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="h-3 w-3 text-green-600" />
                      </div>
                      {f}
                    </li>
                  ))}
                </ul>
                <p className="text-xs text-gray-400 pt-2 border-t border-gray-100">{plan.limits}</p>
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

"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/stores/auth-store";
import { apiPost } from "@/lib/api-client";
import { Check, Loader2, CreditCard } from "lucide-react";

const PLANS = [
  {
    id: "FREE",
    name: "Free",
    price: "$0",
    period: "forever",
    features: [
      "1 store blueprint",
      "Limited AI edits",
      "Basic product suggestions",
      "Community support",
    ],
    limits: "1 store, 5 products, 10 AI edits/day",
  },
  {
    id: "STARTER",
    name: "Starter",
    price: "$29.99",
    period: "/month",
    popular: false,
    features: [
      "Full store blueprint",
      "20 product suggestions",
      "Basic SEO",
      "Basic integrations",
      "Email support",
    ],
    limits: "2 stores, 20 products, 100 AI edits/day",
    yearlyPrice: "$249.99/year",
  },
  {
    id: "PRO",
    name: "Pro",
    price: "$79.99",
    period: "/month",
    popular: true,
    features: [
      "Full AI store builder",
      "Trending product research",
      "AI ad copy & email flows",
      "Conversion optimization",
      "Priority support",
    ],
    limits: "5 stores, 100 products, 500 AI edits/day",
    yearlyPrice: "$699.99/year",
  },
  {
    id: "AGENCY",
    name: "Agency",
    price: "$199.99",
    period: "/month",
    popular: false,
    features: [
      "Multiple stores",
      "White-label exports",
      "Team members",
      "Advanced analytics",
      "Priority AI generation",
    ],
    limits: "Unlimited stores, products, AI edits",
    yearlyPrice: "$1,799.99/year",
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

      <Card className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <CardContent className="py-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-80">Current Plan</p>
              <p className="text-2xl font-bold">{currentPlan}</p>
            </div>
            <CreditCard className="h-12 w-12 opacity-50" />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {PLANS.map((plan) => {
          const isCurrent = currentPlan === plan.id;
          const isUpgradeable = !isCurrent && currentPlan !== "AGENCY";

          return (
            <Card key={plan.id} className={`relative ${plan.popular ? "border-indigo-600 shadow-lg" : ""}`}>
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-indigo-600 text-white">Most Popular</Badge>
                </div>
              )}
              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
                <div>
                  <span className="text-3xl font-bold">{plan.price}</span>
                  <span className="text-gray-500">{plan.period}</span>
                </div>
                {plan.yearlyPrice && (
                  <p className="text-xs text-gray-500">{plan.yearlyPrice}</p>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <p className="text-xs text-gray-400">{plan.limits}</p>
                {isCurrent ? (
                  <Button variant="outline" className="w-full" disabled>
                    Current Plan
                  </Button>
                ) : isUpgradeable ? (
                  <Button
                    className="w-full"
                    variant={plan.popular ? "default" : "outline"}
                    onClick={() => handleUpgrade(plan.id)}
                    disabled={upgrading === plan.id}
                  >
                    {upgrading === plan.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      `Upgrade to ${plan.name}`
                    )}
                  </Button>
                ) : (
                  <Button variant="outline" className="w-full" disabled>
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

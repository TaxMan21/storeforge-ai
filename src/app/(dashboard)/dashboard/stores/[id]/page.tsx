"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { apiGet } from "@/lib/api-client";
import {
  Store,
  FileText,
  ShoppingCart,
  Puzzle,
  BarChart3,
  Sparkles,
  Settings,
  ExternalLink,
  Crown,
  Palette,
} from "lucide-react";

export default function StoreDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [needsUpgrade, setNeedsUpgrade] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const data = await apiGet(`/api/store-projects/${id}`);
        setProject(data.project);
      } catch (err: any) {
        if (err?.status === 403) {
          setNeedsUpgrade(true);
          setLoading(false);
          return;
        }
        router.push("/dashboard/stores");
      }
      setLoading(false);
    }
    load();
  }, [id, router]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-64 bg-gray-100 rounded-xl animate-pulse" />
        <div className="h-48 bg-gray-100 rounded-2xl animate-pulse" />
        <div className="grid grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="h-32 bg-gray-100 rounded-2xl animate-pulse" />)}
        </div>
      </div>
    );
  }

  if (needsUpgrade) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Card className="max-w-md w-full border-gray-100 overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
          <CardContent className="flex flex-col items-center text-center py-12 px-6">
            <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center mb-6">
              <Crown className="h-10 w-10 text-indigo-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Upgrade to Access Your Store</h2>
            <p className="text-gray-500 mb-8 max-w-sm">
              A paid plan is required to view, edit, and publish your store.
            </p>
            <div className="flex gap-3">
              <Link href="/dashboard/billing">
                <Button className="gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-lg shadow-indigo-500/25 btn-shine">
                  <Crown className="h-4 w-4" /> View Plans
                </Button>
              </Link>
              <Link href="/dashboard/stores">
                <Button variant="outline" className="rounded-xl">Back to Stores</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!project) return null;

  const statusSteps = [
    { key: "DRAFT", label: "Created", done: true },
    { key: "QUESTIONNAIRE_COMPLETE", label: "Questionnaire", done: ["QUESTIONNAIRE_COMPLETE", "BLUEPRINT_GENERATED", "BLUEPRINT_APPROVED", "BUILDING", "READY", "LIVE"].includes(project.status) },
    { key: "BLUEPRINT_GENERATED", label: "Blueprint", done: ["BLUEPRINT_GENERATED", "BLUEPRINT_APPROVED", "BUILDING", "READY", "LIVE"].includes(project.status) },
    { key: "BLUEPRINT_APPROVED", label: "Approved", done: ["BLUEPRINT_APPROVED", "BUILDING", "READY", "LIVE"].includes(project.status) },
    { key: "BUILDING", label: "Building", done: ["BUILDING", "READY", "LIVE"].includes(project.status) },
    { key: "READY", label: "Ready", done: ["READY", "LIVE"].includes(project.status) },
    { key: "LIVE", label: "Live", done: project.status === "LIVE" },
  ];

  const completedSteps = statusSteps.filter((s) => s.done).length;
  const progress = (completedSteps / statusSteps.length) * 100;

  const quickActions = [
    { label: "Questionnaire", href: `/dashboard/stores/${id}/questionnaire`, icon: FileText, color: "from-blue-500 to-cyan-500", description: "Complete the AI store setup questionnaire", disabled: false },
    { label: "Blueprint", href: `/dashboard/stores/${id}/blueprint`, icon: Store, color: "from-purple-500 to-pink-500", description: "View and approve your store blueprint", disabled: !["BLUEPRINT_GENERATED", "BLUEPRINT_APPROVED", "BUILDING", "READY", "LIVE"].includes(project.status) },
    { label: "Products", href: `/dashboard/stores/${id}/products`, icon: ShoppingCart, color: "from-green-500 to-emerald-500", description: "Research and select products", disabled: !["BLUEPRINT_APPROVED", "BUILDING", "READY", "LIVE"].includes(project.status) },
    { label: "Pages", href: `/dashboard/stores/${id}/pages`, icon: FileText, color: "from-orange-500 to-red-500", description: "Manage your store pages", disabled: false },
    { label: "AI Studio", href: `/dashboard/stores/${id}/ai`, icon: Sparkles, color: "from-indigo-500 to-violet-500", description: "Generate content with AI agents", disabled: false },
    { label: "Integrations", href: `/dashboard/stores/${id}/integrations`, icon: Puzzle, color: "from-pink-500 to-rose-500", description: "Connect essential tools", disabled: false },
    { label: "Optimization", href: `/dashboard/stores/${id}/optimization`, icon: BarChart3, color: "from-teal-500 to-cyan-500", description: "View store optimization scores", disabled: !["BLUEPRINT_APPROVED", "BUILDING", "READY", "LIVE"].includes(project.status) },
    { label: "Settings", href: `/dashboard/stores/${id}/settings`, icon: Settings, color: "from-gray-500 to-slate-600", description: "Configure store settings", disabled: false },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
            <Badge variant={project.status === "LIVE" ? "success" : project.status === "DRAFT" ? "warning" : "secondary"}>
              {project.status.replace(/_/g, " ")}
            </Badge>
          </div>
          <p className="text-gray-500 mt-1">{project.platform} &middot; {project.storeType?.replace(/_/g, " ")}</p>
        </div>
        {project.liveUrl && (
          <a href={project.liveUrl} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" className="gap-2 rounded-xl"><ExternalLink className="h-4 w-4" /> View Live Store</Button>
          </a>
        )}
      </div>

      <Card className="border-gray-100 overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
        <CardContent className="pt-6 space-y-4">
          <h3 className="font-bold text-gray-900">Build Progress</h3>
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between text-xs text-gray-500">
            {statusSteps.map((step) => (
              <div key={step.key} className={`flex flex-col items-center gap-1.5 ${step.done ? "text-indigo-600 font-semibold" : ""}`}>
                <div className={`h-3 w-3 rounded-full transition-all ${step.done ? "bg-gradient-to-br from-indigo-500 to-purple-500 shadow-md shadow-indigo-500/30" : "bg-gray-200"}`} />
                <span>{step.label}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <div key={action.label}>
              {action.disabled ? (
                <Card className="opacity-40 h-full border-gray-100">
                  <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="h-12 w-12 rounded-xl bg-gray-100 flex items-center justify-center mb-3">
                      <action.icon className="h-6 w-6 text-gray-400" />
                    </div>
                    <p className="font-semibold text-gray-500">{action.label}</p>
                    <p className="text-xs text-gray-400 mt-1">{action.description}</p>
                  </CardContent>
                </Card>
              ) : (
                <Link href={action.href}>
                  <Card className="card-premium border-gray-100 cursor-pointer h-full">
                    <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                      <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center mb-3 shadow-lg group-hover:scale-110 transition-transform`}>
                        <action.icon className="h-6 w-6 text-white" />
                      </div>
                      <p className="font-semibold text-gray-900">{action.label}</p>
                      <p className="text-xs text-gray-500 mt-1">{action.description}</p>
                    </CardContent>
                  </Card>
                </Link>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

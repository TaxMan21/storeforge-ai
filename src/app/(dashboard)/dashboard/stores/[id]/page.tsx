"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { apiGet, apiPost, apiPatch } from "@/lib/api-client";
import {
  Store,
  FileText,
  ShoppingCart,
  Puzzle,
  BarChart3,
  Sparkles,
  Settings,
  ChevronRight,
  Play,
  ExternalLink,
  Lock,
  Crown,
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
      <div className="space-y-4">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
        <div className="h-64 bg-gray-200 rounded-xl animate-pulse" />
      </div>
    );
  }

  if (needsUpgrade) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Card className="max-w-md w-full">
          <CardContent className="flex flex-col items-center text-center py-12 px-6">
            <div className="h-16 w-16 rounded-full bg-indigo-100 flex items-center justify-center mb-6">
              <Crown className="h-8 w-8 text-indigo-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Upgrade to Access Your Store</h2>
            <p className="text-gray-500 mb-6">
              A paid plan is required to view, edit, and publish your store. Choose a plan that fits your needs.
            </p>
            <div className="flex gap-3">
              <Link href="/dashboard/billing">
                <Button className="gap-2">
                  <Crown className="h-4 w-4" /> View Plans
                </Button>
              </Link>
              <Link href="/dashboard/stores">
                <Button variant="outline">Back to Stores</Button>
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
    {
      label: "Questionnaire",
      href: `/dashboard/stores/${id}/questionnaire`,
      icon: FileText,
      description: "Complete the AI store setup questionnaire",
      disabled: false,
    },
    {
      label: "Blueprint",
      href: `/dashboard/stores/${id}/blueprint`,
      icon: Store,
      description: "View and approve your store blueprint",
      disabled: !["BLUEPRINT_GENERATED", "BLUEPRINT_APPROVED", "BUILDING", "READY", "LIVE"].includes(project.status),
    },
    {
      label: "Products",
      href: `/dashboard/stores/${id}/products`,
      icon: ShoppingCart,
      description: "Research and select products",
      disabled: !["BLUEPRINT_APPROVED", "BUILDING", "READY", "LIVE"].includes(project.status),
    },
    {
      label: "Pages",
      href: `/dashboard/stores/${id}/pages`,
      icon: FileText,
      description: "Manage your store pages",
      disabled: false,
    },
    {
      label: "AI Studio",
      href: `/dashboard/stores/${id}/ai`,
      icon: Sparkles,
      description: "Generate content with AI agents",
      disabled: false,
    },
    {
      label: "Integrations",
      href: `/dashboard/stores/${id}/integrations`,
      icon: Puzzle,
      description: "Connect essential tools",
      disabled: false,
    },
    {
      label: "Optimization",
      href: `/dashboard/stores/${id}/optimization`,
      icon: BarChart3,
      description: "View store optimization scores",
      disabled: !["BLUEPRINT_APPROVED", "BUILDING", "READY", "LIVE"].includes(project.status),
    },
    {
      label: "Settings",
      href: `/dashboard/stores/${id}/settings`,
      icon: Settings,
      description: "Configure store settings",
      disabled: false,
    },
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
            <Button variant="outline" className="gap-2"><ExternalLink className="h-4 w-4" /> View Live Store</Button>
          </a>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Build Progress</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Progress value={progress} />
          <div className="flex justify-between text-xs text-gray-500">
            {statusSteps.map((step) => (
              <div key={step.key} className={`flex flex-col items-center gap-1 ${step.done ? "text-indigo-600 font-medium" : ""}`}>
                <div className={`h-3 w-3 rounded-full ${step.done ? "bg-indigo-600" : "bg-gray-300"}`} />
                <span>{step.label}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <div key={action.label}>
              {action.disabled ? (
                <Card className="opacity-50 h-full">
                  <CardContent className="flex flex-col items-center justify-center py-6 text-center">
                    <action.icon className="h-8 w-8 text-gray-400 mb-2" />
                    <p className="font-medium text-gray-500">{action.label}</p>
                    <p className="text-xs text-gray-400">{action.description}</p>
                  </CardContent>
                </Card>
              ) : (
                <Link href={action.href}>
                  <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                    <CardContent className="flex flex-col items-center justify-center py-6 text-center">
                      <action.icon className="h-8 w-8 text-indigo-600 mb-2" />
                      <p className="font-medium text-gray-900">{action.label}</p>
                      <p className="text-xs text-gray-500">{action.description}</p>
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

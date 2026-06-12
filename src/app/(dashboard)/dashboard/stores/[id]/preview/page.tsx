"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { apiGet, apiPatch } from "@/lib/api-client";
import {
  ArrowLeft,
  Eye,
  Monitor,
  Smartphone,
  Tablet,
  Palette,
  Type,
  Layout,
  Save,
  Undo2,
  Redo2,
  Download,
  Globe,
  Crown,
  Check,
  Loader2,
  Sparkles,
  Package,
  Star,
  Shield,
  Truck,
  RotateCcw,
  Mail,
  Phone,
  MapPin,
  ChevronRight,
} from "lucide-react";

type DeviceView = "desktop" | "tablet" | "mobile";

export default function StorePreviewPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [device, setDevice] = useState<DeviceView>("desktop");
  const [activeTab, setActiveTab] = useState<"preview" | "edit">("preview");
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Record<string, string>>({});
  const [publishing, setPublishing] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await apiGet(`/api/store-projects/${id}`);
        setProject(data.project);
        const bp = data.project?.blueprintData;
        if (bp) {
          setEditValues({
            storeName: bp.storeName || "",
            heroTitle: bp.homepageSections?.[0]?.title || "",
            heroDescription: bp.homepageSections?.[0]?.description || "",
            brandVoice: bp.brandVoice || "",
            primaryColor: bp.brandColors?.primary || "#6366f1",
            secondaryColor: bp.brandColors?.secondary || "#8b5cf6",
            accentColor: bp.brandColors?.accent || "#ec4899",
            backgroundColor: bp.brandColors?.background || "#ffffff",
            textColor: bp.brandColors?.text || "#0f0f23",
            headingFont: bp.fonts?.heading || "Inter",
            bodyFont: bp.fonts?.body || "Inter",
          });
        }
      } catch {
        router.push("/dashboard/stores");
      }
      setLoading(false);
    }
    load();
  }, [id, router]);

  async function saveChanges() {
    setSaving(true);
    try {
      const bp = { ...project.blueprintData };
      bp.storeName = editValues.storeName;
      bp.brandVoice = editValues.brandVoice;
      bp.brandColors = {
        primary: editValues.primaryColor,
        secondary: editValues.secondaryColor,
        accent: editValues.accentColor,
        background: editValues.backgroundColor,
        text: editValues.textColor,
      };
      bp.fonts = { ...bp.fonts, heading: editValues.headingFont, body: editValues.bodyFont };
      if (bp.homepageSections?.[0]) {
        bp.homepageSections[0].title = editValues.heroTitle;
        bp.homepageSections[0].description = editValues.heroDescription;
      }
      await apiPatch(`/api/store-projects/${id}`, { blueprintData: bp });
      setProject((p: any) => ({ ...p, blueprintData: bp }));
    } catch {}
    setSaving(false);
  }

  async function publishStore() {
    setPublishing(true);
    try {
      await apiPatch(`/api/store-projects/${id}`, { status: "LIVE" });
      setProject((p: any) => ({ ...p, status: "LIVE" }));
    } catch {}
    setPublishing(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="relative">
          <div className="h-10 w-10 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin" />
        </div>
      </div>
    );
  }

  if (!project) return null;

  const bp = project.blueprintData;
  const colors = bp?.brandColors || {};
  const fonts = bp?.fonts || {};
  const sections = bp?.homepageSections || [];
  const products = project.selectedProducts || [];
  const pages = project.storePages || [];
  const isLive = project.status === "LIVE";

  const deviceWidths: Record<DeviceView, string> = {
    desktop: "w-full",
    tablet: "w-[768px]",
    mobile: "w-[375px]",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <Link href={`/dashboard/stores/${id}`}>
            <Button variant="ghost" size="icon" className="rounded-xl">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Store Preview</h1>
            <p className="text-sm text-gray-500">Preview and edit your store before publishing</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={isLive ? "success" : "secondary"} className="text-sm">
            {isLive ? "Live" : "Draft"}
          </Badge>
          <Button variant="outline" onClick={saveChanges} disabled={saving} className="rounded-xl gap-2">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save
          </Button>
          {!isLive && (
            <Button onClick={publishStore} disabled={publishing} className="rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg shadow-green-500/25 btn-shine gap-2">
              {publishing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Globe className="h-4 w-4" />}
              Publish Store
            </Button>
          )}
        </div>
      </div>

      <div className="flex gap-6">
        {/* Sidebar Editor */}
        <div className="w-80 flex-shrink-0 space-y-4 hidden lg:block">
          {/* Tabs */}
          <div className="flex gap-1 p-1 bg-gray-100 rounded-xl">
            <button
              onClick={() => setActiveTab("preview")}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${activeTab === "preview" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"}`}
            >
              <Eye className="h-4 w-4 inline mr-1.5" /> Preview
            </button>
            <button
              onClick={() => setActiveTab("edit")}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${activeTab === "edit" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"}`}
            >
              <Palette className="h-4 w-4 inline mr-1.5" /> Edit
            </button>
          </div>

          {activeTab === "edit" && (
            <div className="space-y-4">
              {/* Store Name */}
              <Card className="border-gray-100">
                <CardContent className="p-4 space-y-3">
                  <h3 className="font-semibold text-gray-900 text-sm flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-indigo-500" /> Store Identity
                  </h3>
                  <div>
                    <label className="text-xs font-medium text-gray-500">Store Name</label>
                    <Input
                      value={editValues.storeName}
                      onChange={(e) => setEditValues({ ...editValues, storeName: e.target.value })}
                      className="mt-1 h-10 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500">Brand Voice</label>
                    <Input
                      value={editValues.brandVoice}
                      onChange={(e) => setEditValues({ ...editValues, brandVoice: e.target.value })}
                      className="mt-1 h-10 rounded-lg text-sm"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Hero Section */}
              <Card className="border-gray-100">
                <CardContent className="p-4 space-y-3">
                  <h3 className="font-semibold text-gray-900 text-sm flex items-center gap-2">
                    <Layout className="h-4 w-4 text-purple-500" /> Hero Section
                  </h3>
                  <div>
                    <label className="text-xs font-medium text-gray-500">Title</label>
                    <Input
                      value={editValues.heroTitle}
                      onChange={(e) => setEditValues({ ...editValues, heroTitle: e.target.value })}
                      className="mt-1 h-10 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500">Description</label>
                    <Input
                      value={editValues.heroDescription}
                      onChange={(e) => setEditValues({ ...editValues, heroDescription: e.target.value })}
                      className="mt-1 h-10 rounded-lg text-sm"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Brand Colors */}
              <Card className="border-gray-100">
                <CardContent className="p-4 space-y-3">
                  <h3 className="font-semibold text-gray-900 text-sm flex items-center gap-2">
                    <Palette className="h-4 w-4 text-pink-500" /> Brand Colors
                  </h3>
                  {[
                    { key: "primaryColor", label: "Primary" },
                    { key: "secondaryColor", label: "Secondary" },
                    { key: "accentColor", label: "Accent" },
                    { key: "backgroundColor", label: "Background" },
                    { key: "textColor", label: "Text" },
                  ].map(({ key, label }) => (
                    <div key={key} className="flex items-center gap-2">
                      <input
                        type="color"
                        value={editValues[key]}
                        onChange={(e) => setEditValues({ ...editValues, [key]: e.target.value })}
                        className="h-8 w-8 rounded-lg border border-gray-200 cursor-pointer"
                      />
                      <div className="flex-1">
                        <label className="text-xs font-medium text-gray-500">{label}</label>
                        <Input
                          value={editValues[key]}
                          onChange={(e) => setEditValues({ ...editValues, [key]: e.target.value })}
                          className="mt-0.5 h-8 rounded-lg text-xs font-mono"
                        />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Fonts */}
              <Card className="border-gray-100">
                <CardContent className="p-4 space-y-3">
                  <h3 className="font-semibold text-gray-900 text-sm flex items-center gap-2">
                    <Type className="h-4 w-4 text-blue-500" /> Typography
                  </h3>
                  <div>
                    <label className="text-xs font-medium text-gray-500">Heading Font</label>
                    <Input
                      value={editValues.headingFont}
                      onChange={(e) => setEditValues({ ...editValues, headingFont: e.target.value })}
                      className="mt-1 h-10 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500">Body Font</label>
                    <Input
                      value={editValues.bodyFont}
                      onChange={(e) => setEditValues({ ...editValues, bodyFont: e.target.value })}
                      className="mt-1 h-10 rounded-lg text-sm"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "preview" && (
            <div className="space-y-4">
              <Card className="border-gray-100">
                <CardContent className="p-4 space-y-3">
                  <h3 className="font-semibold text-gray-900 text-sm">Store Stats</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-gray-500">Products</span><span className="font-medium">{products.length}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Pages</span><span className="font-medium">{pages.length}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Status</span><Badge variant={isLive ? "success" : "secondary"} className="text-xs">{isLive ? "Live" : "Draft"}</Badge></div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-gray-100">
                <CardContent className="p-4 space-y-3">
                  <h3 className="font-semibold text-gray-900 text-sm">Quick Pages</h3>
                  <div className="space-y-1">
                    {pages.slice(0, 5).map((page: any) => (
                      <div key={page.id} className="flex items-center justify-between text-sm py-1">
                        <span className="text-gray-600">{page.title}</span>
                        <Badge variant={page.isPublished ? "success" : "secondary"} className="text-xs">
                          {page.isPublished ? "Live" : "Draft"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Preview Area */}
        <div className="flex-1 min-w-0">
          {/* Device Switcher */}
          <div className="flex items-center justify-center gap-2 mb-4">
            {[
              { view: "desktop" as const, icon: Monitor, label: "Desktop" },
              { view: "tablet" as const, icon: Tablet, label: "Tablet" },
              { view: "mobile" as const, icon: Smartphone, label: "Mobile" },
            ].map(({ view, icon: Icon, label }) => (
              <button
                key={view}
                onClick={() => setDevice(view)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${device === view ? "bg-indigo-100 text-indigo-700" : "text-gray-500 hover:bg-gray-100"}`}
              >
                <Icon className="h-4 w-4" /> {label}
              </button>
            ))}
          </div>

          {/* Preview Frame */}
          <div className="flex justify-center overflow-auto">
            <div className={`${deviceWidths[device]} transition-all duration-300`}>
              <div ref={previewRef} className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
                {/* Store Header */}
                <header className="border-b border-gray-100 px-6 py-4 flex items-center justify-between" style={{ backgroundColor: colors.background || "#fff" }}>
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg flex items-center justify-center text-white font-bold text-sm" style={{ backgroundColor: colors.primary || "#6366f1" }}>
                      {editValues.storeName?.[0] || "S"}
                    </div>
                    <span className="font-bold text-lg" style={{ color: colors.text || "#0f0f23", fontFamily: fonts.heading || "Inter" }}>
                      {editValues.storeName || "Your Store"}
                    </span>
                  </div>
                  <nav className="hidden md:flex items-center gap-6 text-sm font-medium" style={{ color: colors.text || "#0f0f23" }}>
                    <span className="cursor-pointer hover:opacity-70">Home</span>
                    <span className="cursor-pointer hover:opacity-70">Shop</span>
                    <span className="cursor-pointer hover:opacity-70">About</span>
                    <span className="cursor-pointer hover:opacity-70">Contact</span>
                  </nav>
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-gray-100 flex items-center justify-center">
                      <svg className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                    </div>
                  </div>
                </header>

                {/* Hero Section */}
                <section className="relative px-8 py-20 text-center" style={{ backgroundColor: colors.background || "#fff" }}>
                  <div className="absolute inset-0 opacity-5" style={{ backgroundImage: `radial-gradient(circle at 2px 2px, ${colors.primary || "#6366f1"} 1px, transparent 0)`, backgroundSize: '32px 32px' }} />
                  <div className="relative z-10 max-w-2xl mx-auto">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight" style={{ color: colors.text || "#0f0f23", fontFamily: fonts.heading || "Inter" }}>
                      {editValues.heroTitle || sections[0]?.title || "Welcome to Our Store"}
                    </h1>
                    <p className="text-lg mb-8 opacity-70" style={{ color: colors.text || "#0f0f23", fontFamily: fonts.body || "Inter" }}>
                      {editValues.heroDescription || sections[0]?.description || "Premium products curated for you"}
                    </p>
                    <button className="px-8 py-3 rounded-xl text-white font-semibold text-sm shadow-lg transition-transform hover:scale-105" style={{ backgroundColor: colors.accent || "#ec4899" }}>
                      Shop Now
                    </button>
                  </div>
                </section>

                {/* Featured Products */}
                {products.length > 0 && (
                  <section className="px-8 py-12" style={{ backgroundColor: colors.background || "#fff" }}>
                    <h2 className="text-2xl font-bold text-center mb-8" style={{ color: colors.text || "#0f0f23", fontFamily: fonts.heading || "Inter" }}>
                      Featured Products
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {products.slice(0, 6).map((p: any) => (
                        <div key={p.id} className="rounded-xl border border-gray-100 overflow-hidden group hover:shadow-lg transition-shadow">
                          <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center">
                            <Package className="h-12 w-12 text-gray-300" />
                          </div>
                          <div className="p-3">
                            <h3 className="font-semibold text-sm truncate" style={{ color: colors.text || "#0f0f23" }}>
                              {p.productCandidate?.name || "Product"}
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="font-bold text-sm" style={{ color: colors.accent || "#ec4899" }}>
                                ${p.sellingPrice?.toFixed(2) || "0.00"}
                              </span>
                              {p.productCandidate?.estimatedMargin && (
                                <span className="text-xs text-green-600 font-medium">
                                  {p.productCandidate.estimatedMargin}% margin
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Trust Badges */}
                <section className="px-8 py-10 border-t border-b border-gray-100" style={{ backgroundColor: colors.background || "#fff" }}>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                    {[
                      { icon: Truck, label: "Free Shipping", desc: "On orders over $50" },
                      { icon: Shield, label: "Secure Payment", desc: "100% protected" },
                      { icon: RotateCcw, label: "Easy Returns", desc: "30-day policy" },
                      { icon: Star, label: "Quality Guaranteed", desc: "Premium products" },
                    ].map(({ icon: Icon, label, desc }, i) => (
                      <div key={i}>
                        <div className="h-12 w-12 rounded-xl mx-auto mb-3 flex items-center justify-center" style={{ backgroundColor: `${colors.primary || "#6366f1"}15` }}>
                          <Icon className="h-6 w-6" style={{ color: colors.primary || "#6366f1" }} />
                        </div>
                        <p className="font-semibold text-sm" style={{ color: colors.text || "#0f0f23" }}>{label}</p>
                        <p className="text-xs opacity-60" style={{ color: colors.text || "#0f0f23" }}>{desc}</p>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Footer */}
                <footer className="px-8 py-10 text-center" style={{ backgroundColor: colors.primary || "#1a1a2e" }}>
                  <p className="text-white font-bold text-lg mb-2">{editValues.storeName || "Your Store"}</p>
                  <p className="text-white/60 text-sm mb-4">Premium products curated just for you.</p>
                  <div className="flex justify-center gap-6 text-sm text-white/50">
                    <span>Privacy</span>
                    <span>Terms</span>
                    <span>Contact</span>
                  </div>
                  <p className="text-white/30 text-xs mt-6">&copy; 2026 {editValues.storeName || "Your Store"}. All rights reserved.</p>
                </footer>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { apiGet, apiPost } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Check, Loader2 } from "lucide-react";

interface Question {
  key: string;
  text: string;
  type: "text" | "textarea" | "select" | "number" | "multiselect";
  options?: string[];
  required?: boolean;
}

const questions: Question[] = [
  { key: "niche", text: "What niche do you want to sell in?", type: "text", required: true },
  { key: "store_name", text: "Do you already have a store name? (Leave blank for AI suggestions)", type: "text" },
  { key: "target_audience", text: "Who is your target customer?", type: "textarea", required: true },
  { key: "target_country", text: "What country do you want to sell to?", type: "select", options: ["United States", "United Kingdom", "Canada", "Australia", "Germany", "France", "Global"], required: true },
  { key: "budget", text: "What is your starting budget? (USD)", type: "number", required: true },
  { key: "ticket_level", text: "Do you prefer low-ticket, mid-ticket, or high-ticket products?", type: "select", options: ["Low ($5-$25)", "Mid ($25-$100)", "High ($100+)"], required: true },
  { key: "brand_style", text: "What brand style do you want?", type: "select", options: ["Luxury", "Minimalist", "Playful", "Tech", "Feminine", "Masculine", "Eco-Friendly", "Modern", "Vintage"], required: true },
  { key: "auto_products", text: "Do you want the AI to choose products automatically?", type: "select", options: ["Yes, full AI control", "AI suggests, I approve", "I'll choose myself"], required: true },
  { key: "create_ads", text: "Do you want AI to create ads, emails, and marketing content?", type: "select", options: ["Yes, generate everything", "Just emails", "Just ads", "Not now"], required: true },
  { key: "auto_fulfillment", text: "Do you want automated order fulfillment?", type: "select", options: ["Yes, fully automated", "Semi-automated", "Manual"], required: true },
  { key: "tiktok_products", text: "Do you want influencer/TikTok-style trending products?", type: "select", options: ["Yes, TikTok viral products", "Yes, Instagram trending", "Both", "Not needed"], required: true },
  { key: "target_margin", text: "What profit margin do you want?", type: "select", options: ["30-40%", "40-60%", "60-80%", "Maximize margin"], required: true },
  { key: "avoid_products", text: "Any products or categories to avoid? (comma-separated, or leave blank)", type: "text" },
];

export default function QuestionnairePage() {
  const params = useParams();
  const router = useRouter();
  const storeId = params.id as string;
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const data = await apiGet(`/api/store-projects/${storeId}`);
        const existing = data.project.questionnaireAnswers || [];
        const map: Record<string, any> = {};
        existing.forEach((a: any) => { map[a.questionKey] = a.answerValue; });
        setAnswers(map);
      } catch {}
      setLoading(false);
    }
    load();
  }, [storeId]);

  const q = questions[currentStep];
  const progress = ((currentStep + 1) / questions.length) * 100;

  function updateAnswer(value: any) {
    setAnswers((prev) => ({ ...prev, [q.key]: value }));
  }

  async function handleSubmit() {
    setSubmitting(true);
    setError("");
    try {
      const payload = {
        storeProjectId: storeId,
        answers: questions.map((q) => ({
          questionKey: q.key,
          questionText: q.text,
          answerValue: answers[q.key] || "",
        })),
      };
      await apiPost("/api/questionnaire", payload);
      router.push(`/dashboard/stores/${storeId}/blueprint`);
    } catch (err: any) {
      setError(err.message || "Failed to save questionnaire");
      setSubmitting(false);
    }
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

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Store Setup Questionnaire</h1>
        <p className="text-gray-500 mt-1">Answer these questions so AI can build the perfect store for you.</p>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm text-gray-500">
          <span>Question {currentStep + 1} of {questions.length}</span>
          <span>{Math.round(progress)}% complete</span>
        </div>
        <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-700">{error}</div>
      )}

      <Card className="border-gray-100">
        <CardHeader>
          <CardTitle>{q.text}</CardTitle>
          {q.required && <CardDescription>* Required</CardDescription>}
        </CardHeader>
        <CardContent>
          {q.type === "text" && (
            <Input
              value={answers[q.key] || ""}
              onChange={(e) => updateAnswer(e.target.value)}
              placeholder="Type your answer..."
              autoFocus
            />
          )}
          {q.type === "textarea" && (
            <Textarea
              value={answers[q.key] || ""}
              onChange={(e) => updateAnswer(e.target.value)}
              placeholder="Describe in detail..."
              rows={4}
              autoFocus
            />
          )}
          {q.type === "number" && (
            <Input
              type="number"
              value={answers[q.key] || ""}
              onChange={(e) => updateAnswer(Number(e.target.value))}
              placeholder="Enter amount in USD"
              min={0}
              autoFocus
            />
          )}
          {q.type === "select" && q.options && (
            <div className="grid grid-cols-2 gap-3">
              {q.options.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => updateAnswer(opt)}
                  className={cn(
                    "rounded-xl border-2 p-3 text-left text-sm transition-all",
                    answers[q.key] === opt
                      ? "border-indigo-500 bg-indigo-50 text-indigo-700 shadow-md shadow-indigo-500/10"
                      : "border-gray-200 hover:border-gray-300"
                  )}
                >
                  <div className="flex items-center gap-2">
                    {answers[q.key] === opt && <Check className="h-4 w-4 text-indigo-600" />}
                    {opt}
                  </div>
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => setCurrentStep((s) => Math.max(0, s - 1))}
          disabled={currentStep === 0}
          className="gap-2 rounded-xl"
        >
          <ChevronLeft className="h-4 w-4" /> Back
        </Button>
        {currentStep < questions.length - 1 ? (
          <Button
            onClick={() => setCurrentStep((s) => Math.min(questions.length - 1, s + 1))}
            disabled={q.required && !answers[q.key]}
            className="gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-lg shadow-indigo-500/25 btn-shine"
          >
            Next <ChevronRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={submitting || questions.filter((q) => q.required).some((q) => !answers[q.key])}
            className="gap-2 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg shadow-green-500/25 btn-shine"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            {submitting ? "Generating Blueprint..." : "Generate Blueprint"}
          </Button>
        )}
      </div>

      <div className="flex gap-2 flex-wrap">
        {questions.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentStep(i)}
            className={cn(
              "h-2 w-2 rounded-full transition-all",
              i === currentStep ? "bg-gradient-to-r from-indigo-500 to-purple-500 w-6 shadow-md shadow-indigo-500/30" : answers[questions[i].key] ? "bg-green-500" : "bg-gray-300"
            )}
          />
        ))}
      </div>
    </div>
  );
}

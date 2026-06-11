"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { apiPost } from "@/lib/api-client";
import { Loader2, Send, Sparkles, Bot } from "lucide-react";

const AGENTS = [
  { id: "store_strategy", label: "Store Strategy", color: "bg-blue-100 text-blue-800" },
  { id: "product_research", label: "Product Research", color: "bg-green-100 text-green-800" },
  { id: "branding", label: "Branding", color: "bg-purple-100 text-purple-800" },
  { id: "web_design", label: "Web Design", color: "bg-pink-100 text-pink-800" },
  { id: "seo", label: "SEO", color: "bg-yellow-100 text-yellow-800" },
  { id: "conversion", label: "Conversion", color: "bg-orange-100 text-orange-800" },
  { id: "marketing", label: "Marketing", color: "bg-red-100 text-red-800" },
  { id: "compliance", label: "Policies & Compliance", color: "bg-gray-100 text-gray-800" },
  { id: "launch_checklist", label: "Launch Checklist", color: "bg-teal-100 text-teal-800" },
];

export default function AIStudioPage() {
  const params = useParams();
  const id = params.id as string;
  const [selectedAgent, setSelectedAgent] = useState("marketing");
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [tokens, setTokens] = useState(0);

  async function generate() {
    if (!prompt.trim() || loading) return;
    setLoading(true);
    setResponse("");
    try {
      const data = await apiPost("/api/ai/generate", {
        storeProjectId: id,
        agentType: selectedAgent,
        prompt: prompt.trim(),
      });
      setResponse(data.response);
      setTokens(data.tokens);
    } catch (err: any) {
      setResponse(`Error: ${err.message}`);
    }
    setLoading(false);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">AI Studio</h1>
        <p className="text-gray-500 mt-1">Chat with specialized AI agents to build and optimize your store.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-indigo-600" />
            Select Agent
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {AGENTS.map((agent) => (
              <button
                key={agent.id}
                onClick={() => setSelectedAgent(agent.id)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                  selectedAgent === agent.id
                    ? "bg-indigo-600 text-white"
                    : agent.color + " hover:opacity-80"
                }`}
              >
                {agent.label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ask the AI agent anything about your store... (e.g., 'Write 5 email subject lines for abandoned cart recovery')"
              rows={4}
              className="resize-none"
            />
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-400">
                {tokens > 0 && `${tokens} tokens used`}
              </p>
              <Button onClick={generate} disabled={loading || !prompt.trim()} className="gap-2">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                {loading ? "Generating..." : "Generate"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {(response || loading) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-indigo-600" />
              AI Response
              <Badge variant="secondary">{AGENTS.find((a) => a.id === selectedAgent)?.label}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center gap-3 py-8 justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
                <p className="text-gray-500">AI is thinking...</p>
              </div>
            ) : (
              <div className="prose prose-sm max-w-none whitespace-pre-wrap text-gray-700">
                {response}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

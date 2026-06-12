export interface PlanLimits {
  stores: number;
  productsPerStore: number;
  pagesPerStore: number;
  aiGenerationsPerDay: number;
  aiAgentsAccess: string[];
  integrationsPerStore: number;
  customDomains: number;
  teamMembers: number;
  exports: boolean;
  whiteLabel: boolean;
  prioritySupport: boolean;
  advancedAnalytics: boolean;
  productResearchDepth: "basic" | "standard" | "advanced" | "unlimited";
  seoTools: boolean;
  emailFlows: boolean;
  adCreatives: boolean;
  abTesting: boolean;
  apiAccess: boolean;
}

export const PLAN_LIMITS: Record<string, PlanLimits> = {
  FREE: {
    stores: 1,
    productsPerStore: 5,
    pagesPerStore: 3,
    aiGenerationsPerDay: 10,
    aiAgentsAccess: ["store_strategy"],
    integrationsPerStore: 1,
    customDomains: 0,
    teamMembers: 0,
    exports: false,
    whiteLabel: false,
    prioritySupport: false,
    advancedAnalytics: false,
    productResearchDepth: "basic",
    seoTools: false,
    emailFlows: false,
    adCreatives: false,
    abTesting: false,
    apiAccess: false,
  },
  STARTER: {
    stores: 2,
    productsPerStore: 20,
    pagesPerStore: 8,
    aiGenerationsPerDay: 100,
    aiAgentsAccess: ["store_strategy", "product_research", "branding", "web_design"],
    integrationsPerStore: 5,
    customDomains: 1,
    teamMembers: 0,
    exports: false,
    whiteLabel: false,
    prioritySupport: false,
    advancedAnalytics: false,
    productResearchDepth: "standard",
    seoTools: true,
    emailFlows: false,
    adCreatives: false,
    abTesting: false,
    apiAccess: false,
  },
  PRO: {
    stores: 5,
    productsPerStore: 100,
    pagesPerStore: 20,
    aiGenerationsPerDay: 500,
    aiAgentsAccess: ["store_strategy", "product_research", "branding", "web_design", "seo", "conversion", "marketing", "compliance", "launch_checklist"],
    integrationsPerStore: 15,
    customDomains: 3,
    teamMembers: 2,
    exports: true,
    whiteLabel: false,
    prioritySupport: true,
    advancedAnalytics: true,
    productResearchDepth: "advanced",
    seoTools: true,
    emailFlows: true,
    adCreatives: true,
    abTesting: false,
    apiAccess: false,
  },
  AGENCY: {
    stores: 999,
    productsPerStore: 999,
    pagesPerStore: 999,
    aiGenerationsPerDay: 9999,
    aiAgentsAccess: ["store_strategy", "product_research", "branding", "web_design", "seo", "conversion", "marketing", "compliance", "launch_checklist"],
    integrationsPerStore: 999,
    customDomains: 999,
    teamMembers: 999,
    exports: true,
    whiteLabel: true,
    prioritySupport: true,
    advancedAnalytics: true,
    productResearchDepth: "unlimited",
    seoTools: true,
    emailFlows: true,
    adCreatives: true,
    abTesting: true,
    apiAccess: true,
  },
};

export function getPlanLimits(plan: string): PlanLimits {
  return PLAN_LIMITS[plan] || PLAN_LIMITS.FREE;
}

export function getPlanDisplayLimits(plan: string) {
  const limits = getPlanLimits(plan);
  return [
    { label: "Stores", value: limits.stores === 999 ? "Unlimited" : limits.stores, icon: "store" },
    { label: "Products per Store", value: limits.productsPerStore === 999 ? "Unlimited" : limits.productsPerStore, icon: "product" },
    { label: "Pages per Store", value: limits.pagesPerStore === 999 ? "Unlimited" : limits.pagesPerStore, icon: "page" },
    { label: "AI Generations/Day", value: limits.aiGenerationsPerDay === 9999 ? "Unlimited" : limits.aiGenerationsPerDay, icon: "ai" },
    { label: "Integrations", value: limits.integrationsPerStore === 999 ? "Unlimited" : limits.integrationsPerStore, icon: "integration" },
    { label: "Custom Domains", value: limits.customDomains === 999 ? "Unlimited" : limits.customDomains, icon: "domain" },
    { label: "Team Members", value: limits.teamMembers === 999 ? "Unlimited" : limits.teamMembers, icon: "team" },
    { label: "AI Agents", value: limits.aiAgentsAccess.length === 9 ? "All 10 Agents" : `${limits.aiAgentsAccess.length} Agents`, icon: "agent" },
  ];
}

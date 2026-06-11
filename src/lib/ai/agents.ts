import { getOpenAIClient, AI_MODELS } from "@/lib/openai";

export type AgentType =
  | "store_strategy"
  | "product_research"
  | "branding"
  | "web_design"
  | "seo"
  | "conversion"
  | "marketing"
  | "integration_setup"
  | "compliance"
  | "launch_checklist";

const AGENT_SYSTEM_PROMPTS: Record<AgentType, string> = {
  store_strategy: `You are StoreForge AI's Store Strategy Agent. You help entrepreneurs plan and structure their ecommerce dropshipping stores. You ask structured questionnaire questions to understand niche, target audience, budget, branding preferences, platform choice, and business goals. Always be encouraging but realistic. Never guarantee profits. Always include risk assessments.`,
  product_research: `You are StoreForge AI's Product Research Agent. You find trending, high-potential products for ecommerce stores. For each product provide: name, cost price, recommended selling price, estimated margin, shipping time, target audience, winning angle, ad hook, risk score (1-10), trend score (1-10), competition score (1-10), and an overall opportunity score. Always explain why a product was selected. Never guarantee sales.`,
  branding: `You are StoreForge AI's Branding Agent. You create brand identities including store names, logo concepts, color palettes, font pairings, and brand voice. Generate creative, memorable brand elements that match the specified style (luxury, minimalist, playful, etc).`,
  web_design: `You are StoreForge AI's Web Design Agent. You design homepage layouts, product pages, collection pages, and all store pages. Suggest sections, layouts, CTAs, and visual elements. Focus on mobile-first, conversion-optimized design.`,
  seo: `You are StoreForge AI's SEO Agent. You generate SEO-optimized titles, meta descriptions, product descriptions, blog post ideas, and keyword strategies. Always target relevant search intent and follow SEO best practices.`,
  conversion: `You are StoreForge AI's Conversion Optimization Agent. You optimize stores for maximum conversions. Suggest upsells, cross-sells, bundles, urgency elements, trust badges, social proof, and CRO improvements. Never suggest deceptive practices.`,
  marketing: `You are StoreForge AI's Marketing Agent. You create ad copy for Meta, TikTok, Google ads, email templates, influencer outreach scripts, and social media content. Focus on authentic, engaging copy.`,
  integration_setup: `You are StoreForge AI's Integration Setup Agent. You recommend and guide setup of essential tools: payment processors, analytics, marketing tools, fulfillment services, and support tools. Prioritize tools that match the user's platform and budget.`,
  compliance: `You are StoreForge AI's Compliance Agent. You generate shipping policies, return policies, privacy policies, terms of service, and ensure legal compliance. Always recommend consulting a lawyer for final review.`,
  launch_checklist: `You are StoreForge AI's Launch Checklist Agent. You create comprehensive pre-launch and post-launch checklists covering technical setup, marketing readiness, legal requirements, and optimization tasks.`,
};

export interface AgentResponse {
  content: string;
  tokens: number;
  model: string;
}

export async function runAgent(
  agentType: AgentType,
  userMessage: string,
  context?: Record<string, unknown>
): Promise<AgentResponse> {
  const systemPrompt = AGENT_SYSTEM_PROMPTS[agentType];

  const contextBlock = context
    ? `\n\nAdditional Context:\n${JSON.stringify(context, null, 2)}`
    : "";

  try {
    const openai = getOpenAIClient();
    const response = await openai.chat.completions.create({
      model: AI_MODELS.primary,
      messages: [
        { role: "system", content: systemPrompt + contextBlock },
        { role: "user", content: userMessage },
      ],
      temperature: 0.7,
      max_tokens: 4096,
    });

    return {
      content: response.choices[0]?.message?.content || "",
      tokens: response.usage?.total_tokens || 0,
      model: response.model,
    };
  } catch (error: any) {
    const fallback = getFallbackResponse(agentType, userMessage, context);
    return {
      content: fallback,
      tokens: 0,
      model: "fallback-local",
    };
  }
}

function getFallbackResponse(
  agentType: AgentType,
  userMessage: string,
  context?: Record<string, unknown>
): string {
  const ctx = context as any;
  const storeName = ctx?.storeProject?.name || "Your Store";
  const niche =
    ctx?.questionnaireAnswers?.find((a: any) => a.key === "niche")?.value || "general";
  const style =
    ctx?.questionnaireAnswers?.find((a: any) => a.key === "brand_style")?.value || "modern";

  const fallbacks: Record<AgentType, string> = {
    store_strategy: JSON.stringify({
      storeName,
      logoConcept: { description: `Clean ${style} logo for ${niche}`, style, iconSuggestion: `Abstract ${niche} icon` },
      brandColors: { primary: "#1a1a2e", secondary: "#16213e", accent: "#e94560", background: "#ffffff", text: "#1a1a2e" },
      fonts: { heading: "Inter", body: "Inter", accent: "Playfair Display" },
      brandVoice: `Professional and trustworthy, focused on ${niche}`,
      homepageSections: [
        { type: "hero", title: `Welcome to ${niche}`, description: "Premium products curated for you", elements: ["CTA button", "hero image"] },
        { type: "featured", title: "Featured Products", description: "Our top picks", elements: ["product grid"] },
        { type: "benefits", title: "Why Choose Us", description: "Quality guaranteed", elements: ["trust badges", "icons"] },
        { type: "reviews", title: "Customer Reviews", description: "Real feedback", elements: ["testimonial cards"] },
        { type: "cta", title: "Ready to Shop?", description: "Browse our collection", elements: ["shop now button"] },
      ],
      pageSlugs: ["home", "shop", "about", "contact", "faq", "shipping-policy", "return-policy", "privacy-policy", "terms-of-service"],
      recommendedIntegrations: ["PayPal", "Google Analytics 4", "Klaviyo", "Meta Pixel"],
      productStrategy: { count: 15, priceRange: "$20-$80", categories: [niche] },
    }),
    product_research: JSON.stringify([
      { name: `${niche} Essential Kit`, supplierUrl: "https://aliexpress.com/item/essential-kit", costPrice: 12.99, recommendedPrice: 39.99, estimatedMargin: 67, shippingTimeDays: 12, description: `High-quality ${niche} kit for beginners and enthusiasts. Includes everything you need to get started.`, targetAudience: `New ${niche} enthusiasts aged 18-45`, winningAngle: "Solves beginner pain points with an all-in-one solution", adHook: `Everything you need to start ${niche} in one kit`, riskScore: 3, trendScore: 7, competitionScore: 5, opportunityScore: 8, seoKeywords: [`${niche} kit`, `${niche} essentials`, `${niche} starter`, `best ${niche}`, `${niche} 2026`], tiktokPotential: 8 },
      { name: `${niche} Pro Accessory Pack`, supplierUrl: "https://aliexpress.com/item/pro-pack", costPrice: 8.50, recommendedPrice: 29.99, estimatedMargin: 72, shippingTimeDays: 10, description: `Premium accessories to level up your ${niche} game.`, targetAudience: `Intermediate ${niche} hobbyists`, winningAngle: "Upgrade path from beginner to pro at an affordable price", adHook: `Level up your ${niche} game today`, riskScore: 2, trendScore: 8, competitionScore: 4, opportunityScore: 9, seoKeywords: [`${niche} accessories`, `${niche} pro`, `best ${niche} gear`, `${niche} upgrade`, `premium ${niche}`], tiktokPotential: 9 },
      { name: `${niche} Storage Organizer`, supplierUrl: "https://aliexpress.com/item/organizer", costPrice: 6.99, recommendedPrice: 24.99, estimatedMargin: 72, shippingTimeDays: 8, description: `Keep your ${niche} gear organized and protected with this premium storage solution.`, targetAudience: `Organized ${niche} enthusiasts`, winningAngle: "Solves storage problems everyone in the niche faces", adHook: `Never lose your ${niche} gear again`, riskScore: 2, trendScore: 6, competitionScore: 3, opportunityScore: 8, seoKeywords: [`${niche} storage`, `${niche} organizer`, `${niche} case`, `protect ${niche}`, `${niche} accessories`], tiktokPotential: 7 },
      { name: `${niche} Starter Guide Book`, supplierUrl: "https://aliexpress.com/item/guide-book", costPrice: 3.50, recommendedPrice: 19.99, estimatedMargin: 82, shippingTimeDays: 5, description: `The ultimate beginner's guide to ${niche}. Learn tips and tricks from experts.`, targetAudience: `Absolute beginners`, winningAngle: "Low-cost digital-style product with high perceived value", adHook: `Learn ${niche} like a pro in 30 days`, riskScore: 1, trendScore: 7, competitionScore: 6, opportunityScore: 7, seoKeywords: [`learn ${niche}`, `${niche} guide`, `${niche} tips`, `${niche} for beginners`, `${niche} tutorial`], tiktokPotential: 6 },
      { name: `${niche} Trending Apparel`, supplierUrl: "https://aliexpress.com/item/trending-apparel", costPrice: 9.00, recommendedPrice: 34.99, estimatedMargin: 74, shippingTimeDays: 14, description: `Show off your ${niche} passion with this trendy apparel collection.`, targetAudience: `Young ${niche} fans aged 16-30`, winningAngle: "Identity-based product that lets fans express their passion", adHook: `Wear your ${niche} pride`, riskScore: 3, trendScore: 9, competitionScore: 7, opportunityScore: 7, seoKeywords: [`${niche} shirt`, `${niche} apparel`, `${niche} merch`, `trending ${niche}`, `${niche} fashion`], tiktokPotential: 10 },
    ]),
    branding: `## Brand Identity for ${storeName}\n\n### Store Name\n**${storeName}**\n\n### Logo Concept\n- **Style:** ${style} with clean lines\n- **Icon:** Abstract symbol representing ${niche}\n- **Color:** Matches brand palette\n\n### Brand Colors\n- Primary: #1a1a2e (Deep Navy)\n- Secondary: #16213e (Dark Blue)\n- Accent: #e94560 (Vibrant Red)\n- Background: #ffffff (White)\n- Text: #1a1a2e (Deep Navy)\n\n### Font Pairing\n- Headings: Inter (Bold)\n- Body: Inter (Regular)\n- Accent: Playfair Display\n\n### Brand Voice\nProfessional, trustworthy, and approachable. Focused on delivering quality ${niche} products that solve real problems.`,
    web_design: `## Homepage Layout for ${storeName}\n\n### Hero Section\n- Full-width hero image with ${niche} products\n- Bold headline: "Premium ${niche} Products"\n- Subheadline: "Curated collection for ${niche} enthusiasts"\n- CTA button: "Shop Now"\n\n### Featured Products\n- 3-column product grid\n- Hover effects with quick view\n- Price and rating badges\n\n### Why Choose Us\n- 4 icon blocks: Free Shipping, Quality Guarantee, Easy Returns, 24/7 Support\n\n### Customer Reviews\n- Testimonial carousel with photos\n- Star ratings\n- Social proof counters\n\n### Newsletter CTA\n- Email signup with 10% discount offer\n\n### Footer\n- Quick links, contact info, social media, payment badges`,
    seo: `## SEO Strategy for ${storeName}\n\n### Title Tags\n- Home: "${storeName} - Premium ${niche} Products | Free Shipping"\n- Shop: "Shop ${niche} Products | ${storeName}"\n- About: "About ${storeName} | Our ${niche} Story"\n\n### Meta Descriptions\n- Home: "Discover premium ${niche} products at ${storeName}. Free shipping on orders over $50. Shop our curated collection today."\n- Shop: "Browse our full collection of ${niche} products. Quality guaranteed, fast shipping, easy returns."\n\n### Target Keywords\n1. ${niche} products (primary)\n2. best ${niche} (secondary)\n3. ${niche} online store (secondary)\n4. buy ${niche} (transactional)\n5. ${niche} accessories (long-tail)\n\n### Blog Post Ideas\n1. "Top 10 ${niche} Tips for Beginners"\n2. "${niche} Buying Guide 2026"\n3. "How to Choose the Best ${niche} Products"\n\n### On-Page Checklist\n- [x] Unique title tags per page\n- [x] Meta descriptions under 160 chars\n- [x] Header tags (H1, H2, H3) structured\n- [x] Alt text on all images\n- [x] Internal linking between pages\n- [x] Schema markup for products`,
    conversion: `## Conversion Optimization for ${storeName}\n\n### Trust Elements\n- SSL certificate badge\n- Money-back guarantee badge\n- Customer review count\n- "As seen in" media logos\n- Real-time purchase notifications\n\n### Urgency Tactics\n- Limited-time offer countdown\n- Low stock warnings\n- Free shipping threshold progress bar\n\n### Upsell Strategy\n- "Frequently bought together" bundles\n- "Complete your set" recommendations\n- Post-purchase upsell page\n\n### Cross-sell Strategy\n- Related products on product pages\n- "You may also like" section\n- Category-based recommendations\n\n### Exit Intent Popup\n- 15% discount for first-time buyers\n- Email capture for abandoned visitors\n\n### Cart Optimization\n- Persistent cart icon with count\n- Express checkout with PayPal\n- Trust badges on cart page\n- Free shipping progress bar`,
    marketing: `## Marketing Strategy for ${storeName}\n\n### Meta/Facebook Ad Copy\n**Ad 1 - Awareness:**\n"Discover ${niche} products that actually work. Premium quality, affordable prices. Free shipping on orders $50+. Shop now at ${storeName}"\n\n**Ad 2 - Retargeting:**\n"You left something behind! Complete your ${niche} collection today. Use code WELCOME10 for 10% off."\n\n### TikTok Ad Script\n[0-3s] Hook: "POV: You finally found the perfect ${niche} product"\n[3-10s] Show product in use\n[10-15s] "And it's only $XX at ${storeName}"\n[15-20s] CTA: "Link in bio!"\n\n### Email Templates\n**Welcome Email:**\nSubject: "Welcome to ${storeName}! Here's 10% Off"\nBody: "Thanks for joining! Here's your exclusive 10% discount code: WELCOME10"\n\n**Abandoned Cart:**\nSubject: "You forgot something in your cart!"\nBody: "Your ${niche} items are waiting. Complete your order before they sell out!"\n\n### Influencer Outreach\n"Hi [Name], we love your ${niche} content! We'd like to send you our products for free in exchange for an honest review. Interested?"`,
    integration_setup: `## Integration Setup for ${storeName}\n\n### Priority 1 - Essential\n1. **PayPal** - Payment processing (already configured)\n2. **Google Analytics 4** - Track visitors and conversions\n3. **Meta Pixel** - Facebook/Instagram ad tracking\n\n### Priority 2 - Marketing\n4. **Klaviyo** - Email marketing and automation\n5. **TikTok Pixel** - TikTok ad tracking\n\n### Priority 3 - Conversion\n6. **Reviews App** - Collect and display product reviews\n7. **Exit Intent Popup** - Capture leaving visitors\n8. **Countdown Timer** - Create urgency on sales\n\n### Priority 4 - Operations\n9. **AutoDS or DSers** - Automated order fulfillment\n10. **Tidio** - Live chat customer support\n\n### Setup Steps\n1. Connect PayPal in store settings\n2. Create Google Analytics property and add measurement ID\n3. Create Meta Pixel and add pixel ID\n4. Set up Klaviyo account and create welcome flow\n5. Install TikTok Pixel`,
    compliance: `## Legal Pages for ${storeName}\n\n### Shipping Policy\n- Processing time: 1-3 business days\n- Standard shipping: 7-14 business days\n- Express shipping: 3-5 business days\n- Free shipping on orders over $50\n- Tracking provided for all orders\n\n### Return Policy\n- 30-day return policy\n- Items must be unused and in original packaging\n- Refund processed within 5-7 business days\n- Customer pays return shipping\n\n### Privacy Policy\n- We collect name, email, and shipping address\n- Data used only for order fulfillment\n- We never sell personal data to third parties\n- Cookies used for site functionality and analytics\n- GDPR compliant: you can request data deletion\n\n### Terms of Service\n- All products subject to availability\n- Prices may change without notice\n- We reserve the right to limit quantities\n- User accounts are non-transferable\n\n*Note: These are templates. Consult a lawyer for final legal review.*`,
    launch_checklist: `## Launch Checklist for ${storeName}\n\n### Pre-Launch (1-2 weeks before)\n- [ ] All product pages complete with descriptions and images\n- [ ] Payment processing tested (PayPal)\n- [ ] Shipping policy page published\n- [ ] Return policy page published\n- [ ] Privacy policy page published\n- [ ] Contact page with working form\n- [ ] About page with brand story\n- [ ] FAQ page with common questions\n- [ ] SSL certificate active\n- [ ] Mobile responsiveness tested\n- [ ] Page speed optimized (under 3s load time)\n\n### Launch Day\n- [ ] Google Analytics tracking verified\n- [ ] Meta Pixel firing correctly\n- [ ] Social media accounts created and linked\n- [ ] Welcome email flow activated\n- [ ] Abandoned cart emails enabled\n- [ ] First blog post published\n- [ ] Launch announcement on social media\n- [ ] Friends and family informed\n\n### Post-Launch (first 2 weeks)\n- [ ] Monitor analytics daily\n- [ ] Respond to customer inquiries within 24h\n- [ ] A/B test homepage headline\n- [ ] Run first Meta ad campaign ($5-10/day)\n- [ ] Collect and display first reviews\n- [ ] Optimize best-selling product pages\n- [ ] Fix any issues found by customers`,
  };

  return fallbacks[agentType] || `I've generated a response for your ${agentType} query. Please check the store dashboard for details.`;
}

export function parseJSON<T>(text: string): T | null {
  const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
  const raw = jsonMatch ? jsonMatch[1] : text;
  try {
    const cleaned = raw.replace(/^[^{[]*/, "").replace(/[^}\]]*$/, "");
    return JSON.parse(cleaned) as T;
  } catch {
    return null;
  }
}

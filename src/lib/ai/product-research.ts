import { runAgent, parseJSON } from "./agents";

export interface ProductCandidateData {
  name: string;
  supplierUrl: string;
  costPrice: number;
  recommendedPrice: number;
  estimatedMargin: number;
  shippingTimeDays: number;
  description: string;
  targetAudience: string;
  winningAngle: string;
  adHook: string;
  riskScore: number;
  trendScore: number;
  competitionScore: number;
  opportunityScore: number;
  seoKeywords: string[];
  tiktokPotential: number;
}

export async function researchProducts(
  niche: string,
  preferences: {
    ticketLevel?: string;
    targetCountry?: string;
    budget?: number;
    avoidProducts?: string[];
  }
): Promise<ProductCandidateData[]> {
  try {
    const prompt = `Research 10 trending, high-potential dropshipping products for the "${niche}" niche.
Target country: ${preferences.targetCountry || "US"}
Budget: ${preferences.budget ? `$${preferences.budget}` : "any"}
Ticket level: ${preferences.ticketLevel || "mid"}
${preferences.avoidProducts?.length ? `Avoid these products: ${preferences.avoidProducts.join(", ")}` : ""}

For each product, return JSON with these fields:
- name: product name
- supplierUrl: placeholder supplier link
- costPrice: suggested cost in USD
- recommendedPrice: suggested selling price in USD
- estimatedMargin: profit margin percentage
- shippingTimeDays: estimated shipping days
- description: compelling product description
- targetAudience: who this product appeals to
- winningAngle: why this product wins
- adHook: catchy ad headline
- riskScore: 1-10 (10=highest risk)
- trendScore: 1-10 (10=hottest trend)
- competitionScore: 1-10 (10=most competitive)
- opportunityScore: 1-10 (10=best opportunity)
- seoKeywords: array of 5 SEO keywords
- tiktokPotential: 1-10

Return as a JSON array inside a \`\`\`json code block.`;

    const result = await runAgent("product_research", prompt, { niche, preferences });
    const parsed = parseJSON<ProductCandidateData[]>(result.content);

    return parsed || getDefaultProducts(niche);
  } catch {
    return getDefaultProducts(niche);
  }
}

function getDefaultProducts(niche: string): ProductCandidateData[] {
  const products: ProductCandidateData[] = [
    {
      name: `${niche} Premium Starter Kit`,
      supplierUrl: "https://aliexpress.com/item/starter-kit",
      costPrice: 12.99,
      recommendedPrice: 39.99,
      estimatedMargin: 67,
      shippingTimeDays: 12,
      description: `Complete ${niche} starter kit with premium quality components. Everything you need to get started.`,
      targetAudience: `New ${niche} enthusiasts aged 18-45`,
      winningAngle: "All-in-one solution that eliminates decision paralysis for beginners",
      adHook: `Everything you need to start ${niche} — in one kit`,
      riskScore: 3,
      trendScore: 7,
      competitionScore: 5,
      opportunityScore: 8,
      seoKeywords: [`${niche} kit`, `${niche} starter`, `best ${niche}`, `${niche} essentials`, `${niche} 2026`],
      tiktokPotential: 8,
    },
    {
      name: `${niche} Pro Upgrade Pack`,
      supplierUrl: "https://aliexpress.com/item/pro-pack",
      costPrice: 8.50,
      recommendedPrice: 29.99,
      estimatedMargin: 72,
      shippingTimeDays: 10,
      description: `Level up your ${niche} experience with professional-grade accessories.`,
      targetAudience: `Intermediate ${niche} hobbyists`,
      winningAngle: "Affordable upgrade path that keeps customers in your ecosystem",
      adHook: `Level up your ${niche} game today`,
      riskScore: 2,
      trendScore: 8,
      competitionScore: 4,
      opportunityScore: 9,
      seoKeywords: [`${niche} accessories`, `${niche} pro`, `${niche} upgrade`, `premium ${niche}`, `best ${niche} gear`],
      tiktokPotential: 9,
    },
    {
      name: `${niche} Storage & Organizer`,
      supplierUrl: "https://aliexpress.com/item/organizer",
      costPrice: 6.99,
      recommendedPrice: 24.99,
      estimatedMargin: 72,
      shippingTimeDays: 8,
      description: `Keep your ${niche} gear organized and protected with this premium storage solution.`,
      targetAudience: `Organized ${niche} enthusiasts`,
      winningAngle: "Solves a universal pain point — nobody likes messy gear",
      adHook: `Never lose your ${niche} gear again`,
      riskScore: 2,
      trendScore: 6,
      competitionScore: 3,
      opportunityScore: 8,
      seoKeywords: [`${niche} storage`, `${niche} organizer`, `${niche} case`, `protect ${niche}`, `${niche} accessories`],
      tiktokPotential: 7,
    },
    {
      name: `${niche} Expert Guide Book`,
      supplierUrl: "https://aliexpress.com/item/guide-book",
      costPrice: 3.50,
      recommendedPrice: 19.99,
      estimatedMargin: 82,
      shippingTimeDays: 5,
      description: `The ultimate guide to ${niche}. Learn tips, tricks, and techniques from experts.`,
      targetAudience: `Absolute beginners who want to learn fast`,
      winningAngle: "Low cost, high perceived value — knowledge sells",
      adHook: `Learn ${niche} like a pro in 30 days`,
      riskScore: 1,
      trendScore: 7,
      competitionScore: 6,
      opportunityScore: 7,
      seoKeywords: [`learn ${niche}`, `${niche} guide`, `${niche} tips`, `${niche} for beginners`, `${niche} tutorial`],
      tiktokPotential: 6,
    },
    {
      name: `${niche} Trending Apparel`,
      supplierUrl: "https://aliexpress.com/item/apparel",
      costPrice: 9.00,
      recommendedPrice: 34.99,
      estimatedMargin: 74,
      shippingTimeDays: 14,
      description: `Show off your ${niche} passion with this trendy apparel collection. Bold designs, premium comfort.`,
      targetAudience: `Young ${niche} fans aged 16-30`,
      winningAngle: "Identity product — people love wearing their interests",
      adHook: `Wear your ${niche} pride`,
      riskScore: 3,
      trendScore: 9,
      competitionScore: 7,
      opportunityScore: 7,
      seoKeywords: [`${niche} shirt`, `${niche} apparel`, `${niche} merch`, `trending ${niche}`, `${niche} fashion`],
      tiktokPotential: 10,
    },
    {
      name: `${niche} Gift Bundle`,
      supplierUrl: "https://aliexpress.com/item/gift-bundle",
      costPrice: 15.00,
      recommendedPrice: 49.99,
      estimatedMargin: 70,
      shippingTimeDays: 12,
      description: `The perfect gift for any ${niche} lover. Beautifully packaged, ready to impress.`,
      targetAudience: `People shopping for ${niche} lovers`,
      winningAngle: "Gift-giving is emotional — premium packaging increases perceived value",
      adHook: `The gift every ${niche} lover wants`,
      riskScore: 2,
      trendScore: 8,
      competitionScore: 4,
      opportunityScore: 8,
      seoKeywords: [`${niche} gift`, `${niche} bundle`, `gift for ${niche}`, `${niche} present`, `${niche} care package`],
      tiktokPotential: 8,
    },
    {
      name: `${niche} Mini Travel Set`,
      supplierUrl: "https://aliexpress.com/item/travel-set",
      costPrice: 7.50,
      recommendedPrice: 27.99,
      estimatedMargin: 73,
      shippingTimeDays: 10,
      description: `Take your ${niche} on the go with this compact travel set. Perfect for trips and commuting.`,
      targetAudience: `Active ${niche} enthusiasts who travel`,
      winningAngle: "Portable version of a popular product — travel is always trending",
      adHook: `${niche} that goes where you go`,
      riskScore: 2,
      trendScore: 7,
      competitionScore: 3,
      opportunityScore: 8,
      seoKeywords: [`${niche} travel`, `portable ${niche}`, `${niche} set`, `travel ${niche}`, `${niche} on the go`],
      tiktokPotential: 8,
    },
    {
      name: `${niche} Limited Edition`,
      supplierUrl: "https://aliexpress.com/item/limited-edition",
      costPrice: 18.00,
      recommendedPrice: 59.99,
      estimatedMargin: 70,
      shippingTimeDays: 14,
      description: `Exclusive limited edition ${niche} collectible. Only 500 made. Once they're gone, they're gone.`,
      targetAudience: `Collectors and hardcore ${niche} fans`,
      winningAngle: "Scarcity drives urgency — limited editions sell fast",
      adHook: `Only 500 made. Get yours before they sell out`,
      riskScore: 4,
      trendScore: 9,
      competitionScore: 6,
      opportunityScore: 8,
      seoKeywords: [`${niche} limited edition`, `exclusive ${niche}`, `rare ${niche}`, `${niche} collectible`, `limited ${niche}`],
      tiktokPotential: 9,
    },
    {
      name: `${niche} Custom Personalizer`,
      supplierUrl: "https://aliexpress.com/item/personalizer",
      costPrice: 10.00,
      recommendedPrice: 34.99,
      estimatedMargin: 71,
      shippingTimeDays: 12,
      description: `Make it yours with custom ${niche} personalization. Add names, dates, or custom designs.`,
      targetAudience: `People who want unique, personalized items`,
      winningAngle: "Personalized products have 30% higher conversion rates",
      adHook: `Make it uniquely yours`,
      riskScore: 2,
      trendScore: 8,
      competitionScore: 5,
      opportunityScore: 8,
      seoKeywords: [`${niche} custom`, `personalized ${niche}`, `${niche} gift idea`, `custom ${niche} design`, `unique ${niche}`],
      tiktokPotential: 9,
    },
    {
      name: `${niche} Subscription Box`,
      supplierUrl: "https://aliexpress.com/item/subscription-box",
      costPrice: 20.00,
      recommendedPrice: 49.99,
      estimatedMargin: 60,
      shippingTimeDays: 14,
      description: `Monthly surprise ${niche} box delivered to your door. New products every month.`,
      targetAudience: `Dedicated ${niche} fans who love surprises`,
      winningAngle: "Recurring revenue model — subscription boxes retain customers",
      adHook: `A monthly dose of ${niche} happiness`,
      riskScore: 4,
      trendScore: 8,
      competitionScore: 5,
      opportunityScore: 7,
      seoKeywords: [`${niche} subscription`, `${niche} monthly box`, `${niche} box`, `monthly ${niche}`, `${niche} membership`],
      tiktokPotential: 9,
    },
  ];

  return products;
}

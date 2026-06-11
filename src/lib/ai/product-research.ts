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
}

function getDefaultProducts(niche: string): ProductCandidateData[] {
  return [
    {
      name: `${niche} Premium Kit`,
      supplierUrl: "https://example-supplier.com/product/1",
      costPrice: 15.99,
      recommendedPrice: 49.99,
      estimatedMargin: 68,
      shippingTimeDays: 7,
      description: `Premium ${niche} kit with everything you need.`,
      targetAudience: `${niche} enthusiasts`,
      winningAngle: "Solves a common problem in a premium way",
      adHook: `Stop settling for less. Get the ${niche} kit everyone's talking about.`,
      riskScore: 3,
      trendScore: 8,
      competitionScore: 5,
      opportunityScore: 8,
      seoKeywords: [niche, `${niche} kit`, "premium", "best seller", "trending"],
      tiktokPotential: 9,
    },
  ];
}

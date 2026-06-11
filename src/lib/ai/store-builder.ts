import { runAgent, type AgentType } from "./agents";

export interface QuestionnaireAnswer {
  questionKey: string;
  questionText: string;
  answerValue: string | number | boolean | string[];
}

export interface StoreBlueprint {
  storeName: string;
  logoConcept: {
    description: string;
    style: string;
    iconSuggestion: string;
  };
  brandColors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  fonts: {
    heading: string;
    body: string;
    accent: string;
  };
  brandVoice: string;
  homepageSections: {
    type: string;
    title: string;
    description: string;
    elements: string[];
  }[];
  pageSlugs: string[];
  recommendedIntegrations: string[];
  productStrategy: {
    count: number;
    priceRange: string;
    categories: string[];
  };
}

export async function generateBlueprint(
  answers: QuestionnaireAnswer[]
): Promise<StoreBlueprint> {
  const answersText = answers
    .map((a) => `${a.questionText}: ${JSON.stringify(a.answerValue)}`)
    .join("\n");

  const result = await runAgent(
    "store_strategy",
    `Based on these questionnaire answers, generate a complete store blueprint as JSON. Include store name, logo concept, brand colors (hex), font pairing, homepage sections, page slugs, recommended integrations, and product strategy.\n\n${answersText}`,
    { answers }
  );

  try {
    const jsonMatch = result.content.match(/```json\s*([\s\S]*?)\s*```/);
    const raw = jsonMatch ? jsonMatch[1] : result.content;
    const cleaned = raw.replace(/^[^{[]*/, "").replace(/[^}\]]*$/, "");
    return JSON.parse(cleaned) as StoreBlueprint;
  } catch {
    return getDefaultBlueprint(answers);
  }
}

function getDefaultBlueprint(answers: QuestionnaireAnswer[]): StoreBlueprint {
  const nicheAnswer = answers.find((a) => a.questionKey === "niche");
  const styleAnswer = answers.find((a) => a.questionKey === "brand_style");
  const niche = typeof nicheAnswer?.answerValue === "string" ? nicheAnswer.answerValue : "General";

  return {
    storeName: `${niche} Store`,
    logoConcept: {
      description: `Modern logo for ${niche} ecommerce store`,
      style: typeof styleAnswer?.answerValue === "string" ? styleAnswer.answerValue : "minimalist",
      iconSuggestion: `A clean icon representing ${niche}`,
    },
    brandColors: {
      primary: "#1a1a2e",
      secondary: "#16213e",
      accent: "#e94560",
      background: "#ffffff",
      text: "#1a1a2e",
    },
    fonts: {
      heading: "Inter",
      body: "Inter",
      accent: "Playfair Display",
    },
    brandVoice: `Professional and trustworthy, focused on ${niche}`,
    homepageSections: [
      { type: "hero", title: `Welcome to ${niche}`, description: "Premium products curated for you", elements: ["CTA button", "hero image"] },
      { type: "featured", title: "Featured Products", description: "Our top picks", elements: ["product grid"] },
      { type: "benefits", title: "Why Choose Us", description: "Quality guaranteed", elements: ["trust badges", "icons"] },
      { type: "reviews", title: "Customer Reviews", description: "Real feedback", elements: ["testimonial cards"] },
    ],
    pageSlugs: ["home", "shop", "about", "contact", "faq", "shipping-policy", "return-policy", "privacy-policy", "terms-of-service"],
    recommendedIntegrations: ["PayPal", "Google Analytics 4", "Klaviyo", "Meta Pixel"],
    productStrategy: {
      count: 15,
      priceRange: "$20-$80",
      categories: [niche],
    },
  };
}

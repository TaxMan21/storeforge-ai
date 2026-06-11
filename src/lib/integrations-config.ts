export interface IntegrationDef {
  name: string;
  category: string;
  description: string;
  url: string;
  icon: string;
}

export const defaultIntegrations: IntegrationDef[] = [
  { name: "PayPal", category: "PAYMENTS", description: "Accept payments globally", url: "https://paypal.com", icon: "💳" },
  { name: "PayPal Credit", category: "PAYMENTS", description: "Buy now pay later for customers", url: "https://paypal.com/business/credit", icon: "💳" },
  { name: "Google Analytics 4", category: "ANALYTICS", description: "Website analytics", url: "https://analytics.google.com", icon: "📊" },
  { name: "Meta Pixel", category: "ANALYTICS", description: "Facebook/Instagram tracking", url: "https://facebook.com", icon: "📱" },
  { name: "TikTok Pixel", category: "ANALYTICS", description: "TikTok ad tracking", url: "https://tiktok.com", icon: "🎵" },
  { name: "Google Tag Manager", category: "ANALYTICS", description: "Tag management", url: "https://tagmanager.google.com", icon: "🏷️" },
  { name: "Microsoft Clarity", category: "ANALYTICS", description: "Session recordings", url: "https://clarity.microsoft.com", icon: "🔍" },
  { name: "Klaviyo", category: "MARKETING", description: "Email marketing", url: "https://klaviyo.com", icon: "📧" },
  { name: "Mailchimp", category: "MARKETING", description: "Email marketing alternative", url: "https://mailchimp.com", icon: "📧" },
  { name: "Meta Ads", category: "MARKETING", description: "Facebook & Instagram ads", url: "https://facebook.com/ads", icon: "📢" },
  { name: "TikTok Ads", category: "MARKETING", description: "TikTok advertising", url: "https://tiktok.com/business", icon: "📢" },
  { name: "Google Ads", category: "MARKETING", description: "Google advertising", url: "https://ads.google.com", icon: "📢" },
  { name: "Reviews App", category: "CONVERSION", description: "Product review system", url: "#", icon: "⭐" },
  { name: "Upsell/Cross-sell", category: "CONVERSION", description: "Increase average order value", url: "#", icon: "🛒" },
  { name: "Bundle Builder", category: "CONVERSION", description: "Create product bundles", url: "#", icon: "📦" },
  { name: "Countdown Timer", category: "CONVERSION", description: "Urgency & scarcity", url: "#", icon: "⏰" },
  { name: "Trust Badges", category: "CONVERSION", description: "Build customer trust", url: "#", icon: "🛡️" },
  { name: "Exit Intent Popup", category: "CONVERSION", description: "Capture leaving visitors", url: "#", icon: "🖱️" },
  { name: "AutoDS", category: "FULFILLMENT", description: "Automated dropshipping", url: "https://autods.com", icon: "🚚" },
  { name: "DSers", category: "FULFILLMENT", description: "AliExpress order automation", url: "https://dsers.com", icon: "🚚" },
  { name: "CJdropshipping", category: "FULFILLMENT", description: "Direct fulfillment", url: "https://cjdropshipping.com", icon: "🚚" },
  { name: "Zendrop", category: "FULFILLMENT", description: "US-based fulfillment", url: "https://zendrop.com", icon: "🚚" },
  { name: "Spocket", category: "FULFILLMENT", description: "US/EU suppliers", url: "https://spocket.com", icon: "🚚" },
  { name: "Printful", category: "FULFILLMENT", description: "Print on demand", url: "https://printful.com", icon: "👕" },
  { name: "Tidio", category: "SUPPORT", description: "Live chat & chatbot", url: "https://tidio.com", icon: "💬" },
  { name: "Crisp", category: "SUPPORT", description: "Customer messaging", url: "https://crisp.chat", icon: "💬" },
  { name: "SEO Optimizer", category: "SEO", description: "On-page SEO tools", url: "#", icon: "🔍" },
  { name: "Schema Markup", category: "SEO", description: "Structured data", url: "#", icon: "🔍" },
  { name: "Blog Generator", category: "SEO", description: "AI blog content", url: "#", icon: "✍️" },
];

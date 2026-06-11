import { Client, Environment } from "@paypal/paypal-server-sdk";

const paypalClient = new Client({
  clientId: process.env.PAYPAL_CLIENT_ID || "",
  clientSecret: process.env.PAYPAL_CLIENT_SECRET || "",
  environment:
    process.env.PAYPAL_ENV === "live"
      ? Environment.Production
      : Environment.Sandbox,
} as any);

export default paypalClient;

export const PLAN_PRICES = {
  STARTER: { monthly: 29.99, yearly: 249.99 },
  PRO: { monthly: 79.99, yearly: 699.99 },
  AGENCY: { monthly: 199.99, yearly: 1799.99 },
} as const;

export const PLAN_LIMITS = {
  FREE: { stores: 1, products: 5, aiEdits: 10 },
  STARTER: { stores: 2, products: 20, aiEdits: 100 },
  PRO: { stores: 5, products: 100, aiEdits: 500 },
  AGENCY: { stores: 999, products: 999, aiEdits: 9999 },
} as const;

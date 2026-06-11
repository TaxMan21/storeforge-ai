import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(128)
    .regex(/[A-Z]/, "Must contain uppercase")
    .regex(/[a-z]/, "Must contain lowercase")
    .regex(/[0-9]/, "Must contain number")
    .regex(/[^A-Za-z0-9]/, "Must contain special character"),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const storeProjectSchema = z.object({
  name: z.string().min(1).max(100),
  platform: z.enum(["SHOPIFY", "WOOCOMMERCE", "CUSTOM"]).default("SHOPIFY"),
  storeType: z.enum(["ONE_PRODUCT", "NICHE", "GENERAL"]).default("NICHE"),
});

export const questionnaireSchema = z.object({
  storeProjectId: z.string(),
  answers: z.array(z.object({
    questionKey: z.string(),
    questionText: z.string(),
    answerValue: z.union([z.string(), z.number(), z.boolean(), z.array(z.string())]),
  })).min(1),
});

export const productSelectionSchema = z.object({
  storeProjectId: z.string(),
  productCandidateId: z.string().optional(),
  sellingPrice: z.number().positive(),
  customName: z.string().max(200).optional(),
  customDescription: z.string().max(5000).optional(),
  isFeatured: z.boolean().default(false),
});

export const pageUpdateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  content: z.any().optional(),
  seoTitle: z.string().max(70).optional(),
  seoDescription: z.string().max(160).optional(),
  isPublished: z.boolean().optional(),
});

export const integrationSchema = z.object({
  name: z.string(),
  category: z.enum(["PAYMENTS", "ANALYTICS", "MARKETING", "CONVERSION", "FULFILLMENT", "SUPPORT", "SEO"]),
  config: z.any().optional(),
});

export const aiRequestSchema = z.object({
  storeProjectId: z.string(),
  agentType: z.string(),
  prompt: z.string().min(1).max(10000),
});

export const subscriptionSchema = z.object({
  plan: z.enum(["STARTER", "PRO", "AGENCY"]),
});

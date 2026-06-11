import { NextRequest } from "next/server";
import { getAuthPayload } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ok, fail, serverError } from "@/lib/api/response";
import { pageUpdateSchema } from "@/lib/validation";

const DEFAULT_PAGES = [
  { slug: "home", title: "Home", sortOrder: 0 },
  { slug: "shop", title: "Shop", sortOrder: 1 },
  { slug: "about", title: "About Us", sortOrder: 2 },
  { slug: "contact", title: "Contact", sortOrder: 3 },
  { slug: "faq", title: "FAQ", sortOrder: 4 },
  { slug: "shipping-policy", title: "Shipping Policy", sortOrder: 5 },
  { slug: "return-policy", title: "Return Policy", sortOrder: 6 },
  { slug: "privacy-policy", title: "Privacy Policy", sortOrder: 7 },
  { slug: "terms-of-service", title: "Terms of Service", sortOrder: 8 },
];

export async function POST(request: NextRequest) {
  try {
    const payload = await getAuthPayload();
    if (!payload) return fail("Unauthorized", 401);

    const body = await request.json();
    const { storeProjectId } = body;

    if (!storeProjectId) return fail("storeProjectId is required");

    const project = await prisma.storeProject.findFirst({
      where: { id: storeProjectId, userId: payload.sub },
    });
    if (!project) return fail("Project not found", 404);

    const existingPages = await prisma.storePage.findMany({
      where: { storeProjectId },
      select: { slug: true },
    });

    const existingSlugs = new Set(existingPages.map((p) => p.slug));

    const pagesToCreate = DEFAULT_PAGES.filter((p) => !existingSlugs.has(p.slug));

    if (pagesToCreate.length > 0) {
      await prisma.storePage.createMany({
        data: pagesToCreate.map((p) => ({
          storeProjectId,
          slug: p.slug,
          title: p.title,
          sortOrder: p.sortOrder,
          content: getDefaultContent(p.slug, project.name),
          seoTitle: `${p.title} | ${project.name}`,
          seoDescription: `${p.title} for ${project.name}`,
          isPublished: ["home", "shop", "about", "contact", "faq"].includes(p.slug),
        })),
      });
    }

    const allPages = await prisma.storePage.findMany({
      where: { storeProjectId },
      orderBy: { sortOrder: "asc" },
    });

    return ok({ pages: allPages });
  } catch (error) {
    console.error("[Pages/POST]", error);
    return serverError();
  }
}

export async function GET(request: NextRequest) {
  try {
    const payload = await getAuthPayload();
    if (!payload) return fail("Unauthorized", 401);

    const url = new URL(request.url);
    const storeProjectId = url.searchParams.get("storeProjectId");
    if (!storeProjectId) return fail("storeProjectId is required");

    const project = await prisma.storeProject.findFirst({
      where: { id: storeProjectId, userId: payload.sub },
    });
    if (!project) return fail("Project not found", 404);

    const pages = await prisma.storePage.findMany({
      where: { storeProjectId },
      orderBy: { sortOrder: "asc" },
    });

    return ok({ pages });
  } catch (error) {
    console.error("[Pages/GET]", error);
    return serverError();
  }
}

function getDefaultContent(slug: string, storeName: string): any {
  const contents: Record<string, any> = {
    home: {
      sections: [
        { type: "hero", title: `Welcome to ${storeName}`, subtitle: "Discover our curated collection" },
        { type: "featured_products", title: "Featured Products" },
        { type: "benefits", title: "Why Choose Us", items: ["Free Shipping", "Secure Payment", "24/7 Support", "Easy Returns"] },
        { type: "testimonials", title: "What Our Customers Say" },
        { type: "newsletter", title: "Stay in the Loop" },
      ],
    },
    about: { content: `About ${storeName} - Your trusted destination for quality products.` },
    contact: { content: "Get in touch with our team.", email: "support@" + storeName.toLowerCase().replace(/\s/g, "") + ".com" },
    faq: {
      questions: [
        { q: "How long does shipping take?", a: "Standard shipping takes 5-10 business days." },
        { q: "Do you offer returns?", a: "Yes, we offer 30-day returns on all products." },
        { q: "How can I contact support?", a: "Email us at support@example.com" },
      ],
    },
    "shipping-policy": { content: "We offer standard and express shipping options. Standard shipping takes 5-10 business days. Express shipping takes 2-4 business days." },
    "return-policy": { content: "We accept returns within 30 days of purchase. Items must be unused and in original packaging." },
    "privacy-policy": { content: "We respect your privacy and protect your personal information." },
    "terms-of-service": { content: "By using our website, you agree to these terms of service." },
  };

  return contents[slug] || {};
}

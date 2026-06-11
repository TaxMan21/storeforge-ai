-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "SubscriptionPlan" AS ENUM ('FREE', 'STARTER', 'PRO', 'AGENCY');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'CANCELED', 'PAST_DUE', 'TRIALING');

-- CreateEnum
CREATE TYPE "StorePlatform" AS ENUM ('SHOPIFY', 'WOOCOMMERCE', 'CUSTOM');

-- CreateEnum
CREATE TYPE "StoreType" AS ENUM ('ONE_PRODUCT', 'NICHE', 'GENERAL');

-- CreateEnum
CREATE TYPE "BrandStyle" AS ENUM ('LUXURY', 'MINIMALIST', 'PLAYFUL', 'TECH', 'FEMININE', 'MASCULINE', 'ECO_FRIENDLY', 'MODERN', 'VINTAGE');

-- CreateEnum
CREATE TYPE "TicketLevel" AS ENUM ('LOW', 'MID', 'HIGH');

-- CreateEnum
CREATE TYPE "FulfillmentType" AS ENUM ('MANUAL', 'AUTO', 'DROPSHIP', 'POD');

-- CreateEnum
CREATE TYPE "StoreStatus" AS ENUM ('DRAFT', 'QUESTIONNAIRE_COMPLETE', 'BLUEPRINT_GENERATED', 'BLUEPRINT_APPROVED', 'BUILDING', 'READY', 'LIVE');

-- CreateEnum
CREATE TYPE "ProductStatus" AS ENUM ('SUGGESTED', 'SELECTED', 'REJECTED', 'LIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "IntegrationCategory" AS ENUM ('PAYMENTS', 'ANALYTICS', 'MARKETING', 'CONVERSION', 'FULFILLMENT', 'SUPPORT', 'SEO');

-- CreateEnum
CREATE TYPE "IntegrationStatus" AS ENUM ('RECOMMENDED', 'CONNECTED', 'DISCONNECTED', 'ERROR');

-- CreateEnum
CREATE TYPE "AIAssetType" AS ENUM ('STORE_NAME', 'LOGO_CONCEPT', 'BRAND_COLORS', 'HOMEPAGE_COPY', 'PRODUCT_DESCRIPTION', 'SEO_TITLE', 'SEO_META', 'EMAIL_TEMPLATE', 'AD_COPY', 'POLICY', 'BLOG_POST', 'TIKTOK_SCRIPT', 'FAQ_CONTENT');

-- CreateEnum
CREATE TYPE "OptimizationCategory" AS ENUM ('STORE_READINESS', 'PRODUCT_OPPORTUNITY', 'SEO', 'CONVERSION', 'SPEED', 'TRUST', 'MARKETING');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "passwordHash" TEXT,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "avatarUrl" TEXT,
    "googleId" TEXT,
    "emailVerified" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RefreshToken" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "lastActiveAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApiKey" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "keyHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "lastUsed" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ApiKey_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "plan" "SubscriptionPlan" NOT NULL DEFAULT 'FREE',
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'ACTIVE',
    "paypalSubscriptionId" TEXT,
    "paypalPlanId" TEXT,
    "currentPeriodStart" TIMESTAMP(3),
    "currentPeriodEnd" TIMESTAMP(3),
    "cancelAtPeriodEnd" BOOLEAN,
    "trialEndsAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BillingHistory" (
    "id" TEXT NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "paypalOrderId" TEXT,
    "status" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BillingHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Niche" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Niche_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StoreProject" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "platform" "StorePlatform" NOT NULL DEFAULT 'SHOPIFY',
    "storeType" "StoreType" NOT NULL DEFAULT 'NICHE',
    "status" "StoreStatus" NOT NULL DEFAULT 'DRAFT',
    "customDomain" TEXT,
    "shopifyUrl" TEXT,
    "wooCommerceUrl" TEXT,
    "liveUrl" TEXT,
    "blueprintData" JSONB,
    "settings" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StoreProject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuestionnaireAnswer" (
    "id" TEXT NOT NULL,
    "storeProjectId" TEXT NOT NULL,
    "questionKey" TEXT NOT NULL,
    "questionText" TEXT NOT NULL,
    "answerValue" JSONB NOT NULL,
    "answeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuestionnaireAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductCandidate" (
    "id" TEXT NOT NULL,
    "nicheId" TEXT,
    "name" TEXT NOT NULL,
    "supplierUrl" TEXT,
    "costPrice" DOUBLE PRECISION NOT NULL,
    "recommendedPrice" DOUBLE PRECISION NOT NULL,
    "estimatedMargin" DOUBLE PRECISION NOT NULL,
    "shippingTimeDays" INTEGER,
    "shippingCost" DOUBLE PRECISION,
    "images" JSONB,
    "description" TEXT,
    "seoKeywords" JSONB,
    "targetAudience" TEXT,
    "winningAngle" TEXT,
    "adHook" TEXT,
    "upsellId" TEXT,
    "riskScore" DOUBLE PRECISION,
    "trendScore" DOUBLE PRECISION,
    "competitionScore" DOUBLE PRECISION,
    "opportunityScore" DOUBLE PRECISION,
    "supplierRating" DOUBLE PRECISION,
    "saturationScore" DOUBLE PRECISION,
    "seasonalDemand" TEXT,
    "tiktokPotential" DOUBLE PRECISION,
    "instagramPotential" DOUBLE PRECISION,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductCandidate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SelectedProduct" (
    "id" TEXT NOT NULL,
    "storeProjectId" TEXT NOT NULL,
    "productCandidateId" TEXT,
    "customName" TEXT,
    "customDescription" TEXT,
    "sellingPrice" DOUBLE PRECISION NOT NULL,
    "costPrice" DOUBLE PRECISION NOT NULL,
    "status" "ProductStatus" NOT NULL DEFAULT 'SELECTED',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SelectedProduct_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StorePage" (
    "id" TEXT NOT NULL,
    "storeProjectId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" JSONB,
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StorePage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Integration" (
    "id" TEXT NOT NULL,
    "storeProjectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" "IntegrationCategory" NOT NULL,
    "status" "IntegrationStatus" NOT NULL DEFAULT 'RECOMMENDED',
    "config" JSONB,
    "apiKeyEnc" TEXT,
    "installedAt" TIMESTAMP(3),
    "lastSyncAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Integration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AIRecommendation" (
    "id" TEXT NOT NULL,
    "storeProjectId" TEXT NOT NULL,
    "agentType" TEXT NOT NULL,
    "assetType" "AIAssetType" NOT NULL,
    "content" JSONB NOT NULL,
    "isAccepted" BOOLEAN,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AIRecommendation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OptimizationScore" (
    "id" TEXT NOT NULL,
    "storeProjectId" TEXT NOT NULL,
    "category" "OptimizationCategory" NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "maxScore" DOUBLE PRECISION NOT NULL DEFAULT 100,
    "breakdown" JSONB,
    "recommendations" JSONB,
    "calculatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OptimizationScore_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MarketingAsset" (
    "id" TEXT NOT NULL,
    "storeProjectId" TEXT NOT NULL,
    "assetType" "AIAssetType" NOT NULL,
    "title" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "platform" TEXT,
    "isApproved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MarketingAsset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AIUsageLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "agentType" TEXT NOT NULL,
    "tokens" INTEGER NOT NULL,
    "model" TEXT NOT NULL,
    "duration" INTEGER,
    "success" BOOLEAN NOT NULL DEFAULT true,
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AIUsageLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "resource" TEXT NOT NULL,
    "resourceId" TEXT,
    "details" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "link" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_googleId_key" ON "User"("googleId");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "RefreshToken_token_key" ON "RefreshToken"("token");

-- CreateIndex
CREATE INDEX "RefreshToken_userId_idx" ON "RefreshToken"("userId");

-- CreateIndex
CREATE INDEX "RefreshToken_token_idx" ON "RefreshToken"("token");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ApiKey_keyHash_key" ON "ApiKey"("keyHash");

-- CreateIndex
CREATE INDEX "ApiKey_userId_idx" ON "ApiKey"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_userId_key" ON "Subscription"("userId");

-- CreateIndex
CREATE INDEX "BillingHistory_subscriptionId_idx" ON "BillingHistory"("subscriptionId");

-- CreateIndex
CREATE UNIQUE INDEX "Niche_name_key" ON "Niche"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Niche_slug_key" ON "Niche"("slug");

-- CreateIndex
CREATE INDEX "StoreProject_userId_idx" ON "StoreProject"("userId");

-- CreateIndex
CREATE INDEX "QuestionnaireAnswer_storeProjectId_idx" ON "QuestionnaireAnswer"("storeProjectId");

-- CreateIndex
CREATE UNIQUE INDEX "QuestionnaireAnswer_storeProjectId_questionKey_key" ON "QuestionnaireAnswer"("storeProjectId", "questionKey");

-- CreateIndex
CREATE INDEX "ProductCandidate_nicheId_idx" ON "ProductCandidate"("nicheId");

-- CreateIndex
CREATE INDEX "ProductCandidate_opportunityScore_idx" ON "ProductCandidate"("opportunityScore");

-- CreateIndex
CREATE UNIQUE INDEX "ProductCandidate_nicheId_name_key" ON "ProductCandidate"("nicheId", "name");

-- CreateIndex
CREATE INDEX "SelectedProduct_storeProjectId_idx" ON "SelectedProduct"("storeProjectId");

-- CreateIndex
CREATE INDEX "StorePage_storeProjectId_idx" ON "StorePage"("storeProjectId");

-- CreateIndex
CREATE UNIQUE INDEX "StorePage_storeProjectId_slug_key" ON "StorePage"("storeProjectId", "slug");

-- CreateIndex
CREATE INDEX "Integration_storeProjectId_idx" ON "Integration"("storeProjectId");

-- CreateIndex
CREATE UNIQUE INDEX "Integration_storeProjectId_name_key" ON "Integration"("storeProjectId", "name");

-- CreateIndex
CREATE INDEX "AIRecommendation_storeProjectId_idx" ON "AIRecommendation"("storeProjectId");

-- CreateIndex
CREATE INDEX "OptimizationScore_storeProjectId_idx" ON "OptimizationScore"("storeProjectId");

-- CreateIndex
CREATE UNIQUE INDEX "OptimizationScore_storeProjectId_category_key" ON "OptimizationScore"("storeProjectId", "category");

-- CreateIndex
CREATE INDEX "MarketingAsset_storeProjectId_idx" ON "MarketingAsset"("storeProjectId");

-- CreateIndex
CREATE INDEX "AIUsageLog_userId_idx" ON "AIUsageLog"("userId");

-- CreateIndex
CREATE INDEX "AIUsageLog_createdAt_idx" ON "AIUsageLog"("createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");

-- CreateIndex
CREATE INDEX "AuditLog_action_idx" ON "AuditLog"("action");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- CreateIndex
CREATE INDEX "Notification_userId_idx" ON "Notification"("userId");

-- CreateIndex
CREATE INDEX "Notification_isRead_idx" ON "Notification"("isRead");

-- AddForeignKey
ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApiKey" ADD CONSTRAINT "ApiKey_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillingHistory" ADD CONSTRAINT "BillingHistory_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "Subscription"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoreProject" ADD CONSTRAINT "StoreProject_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionnaireAnswer" ADD CONSTRAINT "QuestionnaireAnswer_storeProjectId_fkey" FOREIGN KEY ("storeProjectId") REFERENCES "StoreProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductCandidate" ADD CONSTRAINT "ProductCandidate_nicheId_fkey" FOREIGN KEY ("nicheId") REFERENCES "Niche"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SelectedProduct" ADD CONSTRAINT "SelectedProduct_storeProjectId_fkey" FOREIGN KEY ("storeProjectId") REFERENCES "StoreProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SelectedProduct" ADD CONSTRAINT "SelectedProduct_productCandidateId_fkey" FOREIGN KEY ("productCandidateId") REFERENCES "ProductCandidate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StorePage" ADD CONSTRAINT "StorePage_storeProjectId_fkey" FOREIGN KEY ("storeProjectId") REFERENCES "StoreProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Integration" ADD CONSTRAINT "Integration_storeProjectId_fkey" FOREIGN KEY ("storeProjectId") REFERENCES "StoreProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIRecommendation" ADD CONSTRAINT "AIRecommendation_storeProjectId_fkey" FOREIGN KEY ("storeProjectId") REFERENCES "StoreProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OptimizationScore" ADD CONSTRAINT "OptimizationScore_storeProjectId_fkey" FOREIGN KEY ("storeProjectId") REFERENCES "StoreProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarketingAsset" ADD CONSTRAINT "MarketingAsset_storeProjectId_fkey" FOREIGN KEY ("storeProjectId") REFERENCES "StoreProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIUsageLog" ADD CONSTRAINT "AIUsageLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

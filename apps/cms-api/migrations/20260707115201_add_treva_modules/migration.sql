-- CreateEnum
CREATE TYPE "Role" AS ENUM ('admin', 'sales_rep');

-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('draft', 'published', 'archived');

-- CreateEnum
CREATE TYPE "InfoStatus" AS ENUM ('draft', 'published');

-- CreateEnum
CREATE TYPE "Channel" AS ENUM ('web', 'whatsapp', 'telegram', 'instagram', 'phone');

-- CreateEnum
CREATE TYPE "Language" AS ENUM ('en', 'ru', 'az');

-- CreateEnum
CREATE TYPE "ConversationStatus" AS ENUM ('active', 'waiting_for_human', 'assigned', 'resolved', 'closed', 'spam');

-- CreateEnum
CREATE TYPE "MessageRole" AS ENUM ('user', 'bot', 'human', 'system');

-- CreateEnum
CREATE TYPE "HandoffStatus" AS ENUM ('new', 'active', 'assigned', 'resolved', 'cancelled');

-- CreateEnum
CREATE TYPE "HandoffPriority" AS ENUM ('normal', 'high', 'urgent');

-- CreateEnum
CREATE TYPE "SlaState" AS ENUM ('on_track', 'due_soon', 'breached');

-- CreateEnum
CREATE TYPE "ContactRequestStatus" AS ENUM ('new', 'assigned', 'contacted', 'scheduled', 'completed', 'no_answer', 'cancelled');

-- CreateEnum
CREATE TYPE "LeadStatus" AS ENUM ('new', 'qualified', 'contact_requested', 'assigned', 'in_follow_up', 'visit_scheduled', 'negotiation', 'won', 'lost', 'invalid');

-- CreateEnum
CREATE TYPE "Temperature" AS ENUM ('hot', 'warm', 'cold');

-- CreateEnum
CREATE TYPE "LeadTimelineType" AS ENUM ('created', 'phone_captured', 'project_suggested', 'handoff_created', 'contact_requested', 'status_changed', 'note_added');

-- AlterTable
ALTER TABLE "product_owners" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "lastActivityAt" TIMESTAMP(3),
ADD COLUMN     "name" TEXT,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'admin';

-- CreateTable
CREATE TABLE "projects" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT,
    "location" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "status" "ProjectStatus" NOT NULL DEFAULT 'draft',
    "aboutProject" TEXT,
    "advantages" TEXT,
    "targetAudience" TEXT,
    "investmentAdvantages" TEXT,
    "services" TEXT,
    "pricePerM2Min" DOUBLE PRECISION,
    "pricePerM2Max" DOUBLE PRECISION,
    "areaMin" DOUBLE PRECISION,
    "areaMax" DOUBLE PRECISION,
    "totalPriceMin" DOUBLE PRECISION,
    "totalPriceMax" DOUBLE PRECISION,
    "readyToMoveIn" BOOLEAN NOT NULL DEFAULT false,
    "completionYear" INTEGER,
    "handoverCondition" TEXT,
    "paymentPlanAvailable" BOOLEAN NOT NULL DEFAULT false,
    "bulkDiscountAvailable" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bedroom_pricing" (
    "id" SERIAL NOT NULL,
    "projectId" INTEGER NOT NULL,
    "label" TEXT NOT NULL,
    "areaMin" DOUBLE PRECISION,
    "areaMax" DOUBLE PRECISION,
    "priceMin" DOUBLE PRECISION,
    "priceMax" DOUBLE PRECISION,
    "note" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "bedroom_pricing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "standard_payment_plans" (
    "id" SERIAL NOT NULL,
    "projectId" INTEGER NOT NULL,
    "downPaymentPct" DOUBLE PRECISION,
    "discountPct" DOUBLE PRECISION,
    "installmentMonths" INTEGER,
    "optionDiscountPct" DOUBLE PRECISION,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "standard_payment_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "international_plan_tiers" (
    "id" SERIAL NOT NULL,
    "projectId" INTEGER NOT NULL,
    "downPaymentPct" DOUBLE PRECISION,
    "discountPct" DOUBLE PRECISION,
    "interestFreeMonths" INTEGER,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "international_plan_tiers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "treva_info" (
    "id" SERIAL NOT NULL,
    "mission" TEXT,
    "vision" TEXT,
    "whoWeAre" TEXT,
    "whyChoose" TEXT,
    "website" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "hotline" TEXT,
    "status" "InfoStatus" NOT NULL DEFAULT 'draft',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "treva_info_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversations" (
    "id" SERIAL NOT NULL,
    "threadId" TEXT NOT NULL,
    "channel" "Channel" NOT NULL,
    "language" "Language" NOT NULL DEFAULT 'en',
    "status" "ConversationStatus" NOT NULL DEFAULT 'active',
    "customerHandle" TEXT,
    "customerPhone" TEXT,
    "stage" TEXT,
    "budget" TEXT,
    "botActive" BOOLEAN NOT NULL DEFAULT true,
    "unreadCount" INTEGER NOT NULL DEFAULT 0,
    "lastMessageAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "assignedToId" INTEGER,
    "leadId" INTEGER,

    CONSTRAINT "conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "messages" (
    "id" SERIAL NOT NULL,
    "conversationId" INTEGER NOT NULL,
    "role" "MessageRole" NOT NULL,
    "content" TEXT NOT NULL,
    "channel" "Channel",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "internal_notes" (
    "id" SERIAL NOT NULL,
    "conversationId" INTEGER NOT NULL,
    "authorId" INTEGER,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "internal_notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "handoffs" (
    "id" SERIAL NOT NULL,
    "conversationId" INTEGER NOT NULL,
    "status" "HandoffStatus" NOT NULL DEFAULT 'new',
    "priority" "HandoffPriority" NOT NULL DEFAULT 'normal',
    "slaState" "SlaState" NOT NULL DEFAULT 'on_track',
    "reason" TEXT,
    "notes" TEXT,
    "dueAt" TIMESTAMP(3),
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "assignedToId" INTEGER,

    CONSTRAINT "handoffs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contact_requests" (
    "id" SERIAL NOT NULL,
    "customerPhone" TEXT NOT NULL,
    "preferredChannel" "Channel" NOT NULL DEFAULT 'phone',
    "availabilityText" TEXT,
    "availabilityAt" TIMESTAMP(3),
    "isFlexible" BOOLEAN NOT NULL DEFAULT false,
    "status" "ContactRequestStatus" NOT NULL DEFAULT 'new',
    "customerWords" TEXT,
    "followUpOutcome" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ownerId" INTEGER,
    "conversationId" INTEGER,
    "leadId" INTEGER,

    CONSTRAINT "contact_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leads" (
    "id" SERIAL NOT NULL,
    "phone" TEXT,
    "threadId" TEXT,
    "channel" "Channel" NOT NULL,
    "topProject" TEXT,
    "budget" TEXT,
    "budgetFlexible" BOOLEAN NOT NULL DEFAULT false,
    "budgetRaw" TEXT,
    "purpose" TEXT,
    "bedrooms" TEXT,
    "location" TEXT,
    "timeframe" TEXT,
    "language" "Language" NOT NULL DEFAULT 'en',
    "interestedProjects" TEXT[],
    "botNotes" TEXT,
    "salesStatus" "LeadStatus" NOT NULL DEFAULT 'new',
    "temperature" "Temperature" NOT NULL DEFAULT 'warm',
    "nextAction" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ownerId" INTEGER,

    CONSTRAINT "leads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lead_timeline_events" (
    "id" SERIAL NOT NULL,
    "leadId" INTEGER NOT NULL,
    "type" "LeadTimelineType" NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lead_timeline_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "projects_slug_key" ON "projects"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "conversations_threadId_key" ON "conversations"("threadId");

-- CreateIndex
CREATE UNIQUE INDEX "handoffs_conversationId_key" ON "handoffs"("conversationId");

-- AddForeignKey
ALTER TABLE "bedroom_pricing" ADD CONSTRAINT "bedroom_pricing_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "standard_payment_plans" ADD CONSTRAINT "standard_payment_plans_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "international_plan_tiers" ADD CONSTRAINT "international_plan_tiers_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "product_owners"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "leads"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "internal_notes" ADD CONSTRAINT "internal_notes_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "internal_notes" ADD CONSTRAINT "internal_notes_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "product_owners"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "handoffs" ADD CONSTRAINT "handoffs_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "product_owners"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "handoffs" ADD CONSTRAINT "handoffs_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contact_requests" ADD CONSTRAINT "contact_requests_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "product_owners"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contact_requests" ADD CONSTRAINT "contact_requests_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "conversations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contact_requests" ADD CONSTRAINT "contact_requests_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "leads"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "product_owners"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lead_timeline_events" ADD CONSTRAINT "lead_timeline_events_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "leads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

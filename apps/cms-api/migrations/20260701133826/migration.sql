/*
  Warnings:

  - The `title` column on the `pulse_articles` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `category` column on the `pulse_articles` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `excerpt` column on the `pulse_articles` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `metaTitle` column on the `pulse_articles` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `metaDescription` column on the `pulse_articles` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `name` column on the `pulse_categories` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `contact_budget_options` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `contact_settings` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `contact_social_links` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `contact_timeline_options` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "contact_budget_options" DROP CONSTRAINT "contact_budget_options_contactId_fkey";

-- DropForeignKey
ALTER TABLE "contact_social_links" DROP CONSTRAINT "contact_social_links_contactId_fkey";

-- DropForeignKey
ALTER TABLE "contact_timeline_options" DROP CONSTRAINT "contact_timeline_options_contactId_fkey";

-- DropIndex
DROP INDEX "pulse_categories_name_key";

-- AlterTable
ALTER TABLE "contact_submissions" ALTER COLUMN "service" DROP NOT NULL,
ALTER COLUMN "budget" DROP NOT NULL,
ALTER COLUMN "timeline" DROP NOT NULL;

-- AlterTable
ALTER TABLE "pulse_articles" DROP COLUMN "title",
ADD COLUMN     "title" JSONB NOT NULL DEFAULT '{}',
DROP COLUMN "category",
ADD COLUMN     "category" JSONB NOT NULL DEFAULT '{}',
DROP COLUMN "excerpt",
ADD COLUMN     "excerpt" JSONB,
DROP COLUMN "metaTitle",
ADD COLUMN     "metaTitle" JSONB,
DROP COLUMN "metaDescription",
ADD COLUMN     "metaDescription" JSONB;

-- AlterTable
ALTER TABLE "pulse_categories" DROP COLUMN "name",
ADD COLUMN     "name" JSONB NOT NULL DEFAULT '{}';

-- DropTable
DROP TABLE "contact_budget_options";

-- DropTable
DROP TABLE "contact_settings";

-- DropTable
DROP TABLE "contact_social_links";

-- DropTable
DROP TABLE "contact_timeline_options";

-- CreateTable
CREATE TABLE "layihelerimiz_categories" (
    "id" TEXT NOT NULL,
    "title" JSONB NOT NULL DEFAULT '{}',
    "slug" TEXT NOT NULL,
    "image" TEXT,
    "brandImage" TEXT,
    "description" JSONB,
    "brand" JSONB,
    "brandTextColor" TEXT DEFAULT 'white',
    "order" INTEGER NOT NULL DEFAULT 0,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "layihelerimiz_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "layihelerimiz_project_details" (
    "id" TEXT NOT NULL,
    "categorySlug" TEXT NOT NULL,
    "heroTitle" JSONB,
    "heroDesktopDesc" JSONB,
    "heroMobileDesc" JSONB,
    "heroImages" JSONB,
    "heroCtaText" JSONB,
    "heroCtaLink" TEXT,
    "overviewTitleLight" JSONB,
    "overviewTitleBold" JSONB,
    "overviewBrandName" JSONB,
    "overviewDebutText" JSONB,
    "overviewLocationText" JSONB,
    "overviewDebutTextEnd" JSONB,
    "overviewDescription" JSONB,
    "overviewImageLarge" TEXT,
    "overviewImageLargeLabel" JSONB,
    "overviewImageMedium" TEXT,
    "overviewImageMediumLabel" JSONB,
    "overviewImageSmall" TEXT,
    "overviewImageSmallLabel" JSONB,
    "overviewDataRows" JSONB,
    "featuresHeaderMain" JSONB,
    "featuresHeaderSub" JSONB,
    "featuresTitleLight" JSONB,
    "featuresTitleBold" JSONB,
    "featuresSections" JSONB,
    "brochureFile" TEXT,
    "locationTitleLight" JSONB,
    "locationTitleBold" JSONB,
    "locationBrandName" JSONB,
    "locationMainLead" JSONB,
    "locationSubText" JSONB,
    "locationMapImage" TEXT,
    "locationFooterAddress" JSONB,
    "locationGoogleMapsUrl" TEXT,
    "seoTitle" JSONB,
    "seoDescription" JSONB,
    "ogImage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "layihelerimiz_project_details_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "callback_requests" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "callback_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "broker_registrations" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "city" TEXT,
    "brokerType" TEXT,
    "experience" TEXT,
    "website" TEXT,
    "message" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "broker_registrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ArticleSelections" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ArticleSelections_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "layihelerimiz_categories_slug_key" ON "layihelerimiz_categories"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "layihelerimiz_project_details_categorySlug_key" ON "layihelerimiz_project_details"("categorySlug");

-- CreateIndex
CREATE INDEX "_ArticleSelections_B_index" ON "_ArticleSelections"("B");

-- AddForeignKey
ALTER TABLE "_ArticleSelections" ADD CONSTRAINT "_ArticleSelections_A_fkey" FOREIGN KEY ("A") REFERENCES "pulse_articles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ArticleSelections" ADD CONSTRAINT "_ArticleSelections_B_fkey" FOREIGN KEY ("B") REFERENCES "pulse_articles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

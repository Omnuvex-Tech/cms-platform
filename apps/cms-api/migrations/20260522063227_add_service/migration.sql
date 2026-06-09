-- CreateTable
CREATE TABLE "services" (
    "id" SERIAL NOT NULL,
    "number" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "badge" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "imageAlt" TEXT,
    "gif" TEXT,
    "features" JSONB NOT NULL DEFAULT '[]',
    "portfolioButtonText" TEXT,
    "portfolioButtonLink" TEXT,
    "portfolioButtonNewTab" BOOLEAN NOT NULL DEFAULT false,
    "detailButtonText" TEXT,
    "detailButtonLink" TEXT,
    "detailButtonNewTab" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "sections" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "services_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "services_slug_key" ON "services"("slug");

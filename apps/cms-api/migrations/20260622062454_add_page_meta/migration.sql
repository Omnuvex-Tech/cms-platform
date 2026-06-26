-- CreateTable
CREATE TABLE "PageMeta" (
    "id" TEXT NOT NULL,
    "pageKey" TEXT NOT NULL,
    "seoTitle" JSONB,
    "seoDescription" JSONB,
    "seoKeywords" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PageMeta_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PageMeta_pageKey_key" ON "PageMeta"("pageKey");

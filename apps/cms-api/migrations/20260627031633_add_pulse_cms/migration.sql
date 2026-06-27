-- CreateTable
CREATE TABLE "pulse_articles" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "coverImage" TEXT,
    "excerpt" TEXT,
    "authorId" TEXT,
    "blocks" JSONB NOT NULL DEFAULT '[]',
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "headerPosition" TEXT,
    "headerOrder" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pulse_articles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pulse_authors" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT,
    "avatar" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pulse_authors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pulse_keywords" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,

    CONSTRAINT "pulse_keywords_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pulse_categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pulse_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_PulseArticleToPulseKeyword" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_PulseArticleToPulseKeyword_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "pulse_articles_slug_key" ON "pulse_articles"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "pulse_authors_slug_key" ON "pulse_authors"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "pulse_keywords_name_key" ON "pulse_keywords"("name");

-- CreateIndex
CREATE UNIQUE INDEX "pulse_keywords_slug_key" ON "pulse_keywords"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "pulse_categories_name_key" ON "pulse_categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "pulse_categories_slug_key" ON "pulse_categories"("slug");

-- CreateIndex
CREATE INDEX "_PulseArticleToPulseKeyword_B_index" ON "_PulseArticleToPulseKeyword"("B");

-- AddForeignKey
ALTER TABLE "pulse_articles" ADD CONSTRAINT "pulse_articles_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "pulse_authors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PulseArticleToPulseKeyword" ADD CONSTRAINT "_PulseArticleToPulseKeyword_A_fkey" FOREIGN KEY ("A") REFERENCES "pulse_articles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PulseArticleToPulseKeyword" ADD CONSTRAINT "_PulseArticleToPulseKeyword_B_fkey" FOREIGN KEY ("B") REFERENCES "pulse_keywords"("id") ON DELETE CASCADE ON UPDATE CASCADE;

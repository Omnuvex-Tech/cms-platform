-- CreateTable
CREATE TABLE "about_settings" (
    "id" SERIAL NOT NULL,
    "heroImage" TEXT,
    "heroImageAlt" TEXT,
    "heroBadge" TEXT,
    "heroTitle" TEXT,
    "heroParagraphs" JSONB NOT NULL DEFAULT '[]',
    "storyBlocks" JSONB NOT NULL DEFAULT '[]',
    "teamTitle" TEXT,
    "teamDescription" TEXT,
    "teamCtaLabel" TEXT,
    "teamCtaHref" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "about_settings_pkey" PRIMARY KEY ("id")
);

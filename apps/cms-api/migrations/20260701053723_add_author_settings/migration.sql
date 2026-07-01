-- CreateTable
CREATE TABLE "author_settings" (
    "id" SERIAL NOT NULL,
    "readArticleLabel" JSONB NOT NULL DEFAULT '{}',
    "recentBlogsTitle" JSONB NOT NULL DEFAULT '{}',
    "otherBlogsTitle" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "author_settings_pkey" PRIMARY KEY ("id")
);

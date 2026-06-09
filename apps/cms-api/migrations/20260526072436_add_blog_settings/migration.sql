-- CreateTable
CREATE TABLE "blog_settings" (
    "id" SERIAL NOT NULL,
    "pageTitle" TEXT NOT NULL DEFAULT 'Bloglar',
    "buttonText" TEXT NOT NULL DEFAULT 'Portfolio',
    "buttonLink" TEXT NOT NULL DEFAULT '/portfolio',
    "quoteText" TEXT NOT NULL DEFAULT '',
    "quoteImage" TEXT NOT NULL DEFAULT '',
    "quoteImageAlt" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "blog_settings_pkey" PRIMARY KEY ("id")
);

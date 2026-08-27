-- AlterTable
ALTER TABLE "about_settings" ADD COLUMN     "quoteAuthorId" INTEGER,
ADD COLUMN     "quoteDescription" JSONB,
ADD COLUMN     "quoteImage" TEXT,
ADD COLUMN     "quoteImageAlt" JSONB,
ADD COLUMN     "quoteTitle" JSONB;

-- AddForeignKey
ALTER TABLE "about_settings" ADD CONSTRAINT "about_settings_quoteAuthorId_fkey" FOREIGN KEY ("quoteAuthorId") REFERENCES "blog_authors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

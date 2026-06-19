-- AlterTable
ALTER TABLE "contact_settings" ADD COLUMN     "image" TEXT,
ADD COLUMN     "imageAlt" JSONB NOT NULL DEFAULT '{}';

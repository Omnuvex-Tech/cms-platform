/*
  Warnings:

  - The `badge` column on the `services` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `title` column on the `services` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `description` column on the `services` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `imageAlt` column on the `services` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `portfolioButtonText` column on the `services` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `detailButtonText` column on the `services` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "services" DROP COLUMN "badge",
ADD COLUMN     "badge" JSONB NOT NULL DEFAULT '{}',
DROP COLUMN "title",
ADD COLUMN     "title" JSONB NOT NULL DEFAULT '{}',
DROP COLUMN "description",
ADD COLUMN     "description" JSONB NOT NULL DEFAULT '{}',
DROP COLUMN "imageAlt",
ADD COLUMN     "imageAlt" JSONB NOT NULL DEFAULT '{}',
DROP COLUMN "portfolioButtonText",
ADD COLUMN     "portfolioButtonText" JSONB NOT NULL DEFAULT '{}',
DROP COLUMN "detailButtonText",
ADD COLUMN     "detailButtonText" JSONB NOT NULL DEFAULT '{}';

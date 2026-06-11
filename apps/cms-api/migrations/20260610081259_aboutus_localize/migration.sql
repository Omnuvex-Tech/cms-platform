/*
  Warnings:

  - The `heroImageAlt` column on the `about_settings` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `heroBadge` column on the `about_settings` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `heroTitle` column on the `about_settings` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `teamTitle` column on the `about_settings` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `teamDescription` column on the `about_settings` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `teamCtaLabel` column on the `about_settings` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "about_settings" DROP COLUMN "heroImageAlt",
ADD COLUMN     "heroImageAlt" JSONB NOT NULL DEFAULT '{}',
DROP COLUMN "heroBadge",
ADD COLUMN     "heroBadge" JSONB NOT NULL DEFAULT '{}',
DROP COLUMN "heroTitle",
ADD COLUMN     "heroTitle" JSONB NOT NULL DEFAULT '{}',
DROP COLUMN "teamTitle",
ADD COLUMN     "teamTitle" JSONB NOT NULL DEFAULT '{}',
DROP COLUMN "teamDescription",
ADD COLUMN     "teamDescription" JSONB NOT NULL DEFAULT '{}',
DROP COLUMN "teamCtaLabel",
ADD COLUMN     "teamCtaLabel" JSONB NOT NULL DEFAULT '{}';

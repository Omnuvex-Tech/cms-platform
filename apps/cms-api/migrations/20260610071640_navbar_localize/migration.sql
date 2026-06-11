/*
  Warnings:

  - The `label` column on the `nav_links` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `logoText` column on the `navbar_settings` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "nav_links" DROP COLUMN "label",
ADD COLUMN     "label" JSONB NOT NULL DEFAULT '{}';

-- AlterTable
ALTER TABLE "navbar_settings" ADD COLUMN     "logoImageAlt" JSONB NOT NULL DEFAULT '{}',
DROP COLUMN "logoText",
ADD COLUMN     "logoText" JSONB NOT NULL DEFAULT '{}';

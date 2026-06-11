/*
  Warnings:

  - The `label` column on the `footer_nav_links` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `logoAlt` column on the `footer_settings` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `description` column on the `footer_settings` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `copyrightText` column on the `footer_settings` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `privacyText` column on the `footer_settings` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `locationLabel` column on the `footer_settings` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `phoneLabel` column on the `footer_settings` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `emailLabel` column on the `footer_settings` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `locationValue` column on the `footer_settings` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `phoneValue` column on the `footer_settings` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `emailValue` column on the `footer_settings` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "footer_nav_links" DROP COLUMN "label",
ADD COLUMN     "label" JSONB NOT NULL DEFAULT '{}';

-- AlterTable
ALTER TABLE "footer_settings" DROP COLUMN "logoAlt",
ADD COLUMN     "logoAlt" JSONB NOT NULL DEFAULT '{}',
DROP COLUMN "description",
ADD COLUMN     "description" JSONB NOT NULL DEFAULT '{}',
DROP COLUMN "copyrightText",
ADD COLUMN     "copyrightText" JSONB NOT NULL DEFAULT '{}',
DROP COLUMN "privacyText",
ADD COLUMN     "privacyText" JSONB NOT NULL DEFAULT '{}',
DROP COLUMN "locationLabel",
ADD COLUMN     "locationLabel" JSONB NOT NULL DEFAULT '{}',
DROP COLUMN "phoneLabel",
ADD COLUMN     "phoneLabel" JSONB NOT NULL DEFAULT '{}',
DROP COLUMN "emailLabel",
ADD COLUMN     "emailLabel" JSONB NOT NULL DEFAULT '{}',
DROP COLUMN "locationValue",
ADD COLUMN     "locationValue" JSONB NOT NULL DEFAULT '{}',
DROP COLUMN "phoneValue",
ADD COLUMN     "phoneValue" JSONB NOT NULL DEFAULT '{}',
DROP COLUMN "emailValue",
ADD COLUMN     "emailValue" JSONB NOT NULL DEFAULT '{}';

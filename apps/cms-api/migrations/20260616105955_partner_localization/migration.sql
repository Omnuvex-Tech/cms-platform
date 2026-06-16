/*
  Warnings:

  - The `title` column on the `partner_sections` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `description` column on the `partner_sections` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `linkText` column on the `partner_sections` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `altText` column on the `partners` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `name` column on the `partners` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "partner_sections" DROP COLUMN "title",
ADD COLUMN     "title" JSONB NOT NULL DEFAULT '{}',
DROP COLUMN "description",
ADD COLUMN     "description" JSONB NOT NULL DEFAULT '{}',
DROP COLUMN "linkText",
ADD COLUMN     "linkText" JSONB NOT NULL DEFAULT '{}';

-- AlterTable
ALTER TABLE "partners" DROP COLUMN "altText",
ADD COLUMN     "altText" JSONB NOT NULL DEFAULT '{}',
DROP COLUMN "name",
ADD COLUMN     "name" JSONB NOT NULL DEFAULT '{}';

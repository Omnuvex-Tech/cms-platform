/*
  Warnings:

  - You are about to drop the column `linkHref` on the `partner_sections` table. All the data in the column will be lost.
  - You are about to drop the column `linkText` on the `partner_sections` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "partner_sections" DROP COLUMN "linkHref",
DROP COLUMN "linkText";

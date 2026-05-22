/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `Vacancy` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `slug` to the `Vacancy` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Vacancy" ADD COLUMN     "slug" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Vacancy_slug_key" ON "Vacancy"("slug");

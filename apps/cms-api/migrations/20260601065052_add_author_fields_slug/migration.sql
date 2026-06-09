/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `blog_authors` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "blog_authors" ADD COLUMN     "slug" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "blog_authors_slug_key" ON "blog_authors"("slug");

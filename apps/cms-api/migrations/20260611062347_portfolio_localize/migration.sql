/*
  Warnings:

  - The `title` column on the `portfolios` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `coverImageAlt` column on the `portfolios` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "portfolios" DROP COLUMN "title",
ADD COLUMN     "title" JSONB NOT NULL DEFAULT '{}',
DROP COLUMN "coverImageAlt",
ADD COLUMN     "coverImageAlt" JSONB NOT NULL DEFAULT '{}';

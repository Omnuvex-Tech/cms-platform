/*
  Warnings:

  - The `question` column on the `faqs` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `answer` column on the `faqs` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "faqs" DROP COLUMN "question",
ADD COLUMN     "question" JSONB NOT NULL DEFAULT '{}',
DROP COLUMN "answer",
ADD COLUMN     "answer" JSONB NOT NULL DEFAULT '{}';

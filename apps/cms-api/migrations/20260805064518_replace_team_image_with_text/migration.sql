/*
  Warnings:

  - You are about to drop the column `teamImage` on the `home_settings` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "home_settings" DROP COLUMN "teamImage",
ADD COLUMN     "teamText" JSONB NOT NULL DEFAULT '{}';

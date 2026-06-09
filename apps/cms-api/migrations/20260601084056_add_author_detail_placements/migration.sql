-- AlterTable
ALTER TABLE "blogs" ADD COLUMN     "isAuthorList" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isAuthorPreview" BOOLEAN NOT NULL DEFAULT false;

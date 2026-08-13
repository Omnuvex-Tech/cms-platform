-- CreateEnum
CREATE TYPE "ProjectAudience" AS ENUM ('investor', 'end_user', 'mixed');

-- AlterTable
ALTER TABLE "projects" ADD COLUMN     "audience" "ProjectAudience",
ADD COLUMN     "tags" TEXT[];

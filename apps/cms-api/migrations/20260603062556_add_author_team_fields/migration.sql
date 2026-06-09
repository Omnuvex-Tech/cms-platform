-- AlterTable
ALTER TABLE "blog_authors" ADD COLUMN     "isOurTeam" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isVisible" BOOLEAN NOT NULL DEFAULT true;

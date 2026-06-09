-- AlterTable
ALTER TABLE "blog_authors" ADD COLUMN     "bio" TEXT,
ADD COLUMN     "linkedinHref" TEXT,
ADD COLUMN     "skills" TEXT[],
ADD COLUMN     "skillsTitle" TEXT;

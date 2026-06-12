/*
  Warnings:

  - The `name` column on the `blog_authors` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `role` column on the `blog_authors` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `bio` column on the `blog_authors` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `skills` column on the `blog_authors` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `skillsTitle` column on the `blog_authors` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `avatarAlt` column on the `blog_authors` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `label` column on the `blog_categories` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `pageTitle` column on the `blog_settings` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `buttonText` column on the `blog_settings` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `quoteText` column on the `blog_settings` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `quoteImage` column on the `blog_settings` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `quoteImageAlt` column on the `blog_settings` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `title` column on the `blogs` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `badge` column on the `blogs` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `excerpt` column on the `blogs` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `coverImage` column on the `blogs` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `coverImageAlt` column on the `blogs` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "blog_authors" DROP COLUMN "name",
ADD COLUMN     "name" JSONB NOT NULL DEFAULT '{}',
DROP COLUMN "role",
ADD COLUMN     "role" JSONB NOT NULL DEFAULT '{}',
DROP COLUMN "bio",
ADD COLUMN     "bio" JSONB NOT NULL DEFAULT '{}',
DROP COLUMN "skills",
ADD COLUMN     "skills" JSONB NOT NULL DEFAULT '[]',
DROP COLUMN "skillsTitle",
ADD COLUMN     "skillsTitle" JSONB NOT NULL DEFAULT '{}',
DROP COLUMN "avatarAlt",
ADD COLUMN     "avatarAlt" JSONB NOT NULL DEFAULT '{}';

-- AlterTable
ALTER TABLE "blog_categories" DROP COLUMN "label",
ADD COLUMN     "label" JSONB NOT NULL DEFAULT '{}';

-- AlterTable
ALTER TABLE "blog_settings" DROP COLUMN "pageTitle",
ADD COLUMN     "pageTitle" JSONB NOT NULL DEFAULT '{}',
DROP COLUMN "buttonText",
ADD COLUMN     "buttonText" JSONB NOT NULL DEFAULT '{}',
DROP COLUMN "quoteText",
ADD COLUMN     "quoteText" JSONB NOT NULL DEFAULT '{}',
DROP COLUMN "quoteImage",
ADD COLUMN     "quoteImage" JSONB NOT NULL DEFAULT '{}',
DROP COLUMN "quoteImageAlt",
ADD COLUMN     "quoteImageAlt" JSONB NOT NULL DEFAULT '{}';

-- AlterTable
ALTER TABLE "blogs" DROP COLUMN "title",
ADD COLUMN     "title" JSONB NOT NULL DEFAULT '{}',
DROP COLUMN "badge",
ADD COLUMN     "badge" JSONB NOT NULL DEFAULT '{}',
DROP COLUMN "excerpt",
ADD COLUMN     "excerpt" JSONB NOT NULL DEFAULT '{}',
DROP COLUMN "coverImage",
ADD COLUMN     "coverImage" JSONB NOT NULL DEFAULT '{}',
DROP COLUMN "coverImageAlt",
ADD COLUMN     "coverImageAlt" JSONB NOT NULL DEFAULT '{}';

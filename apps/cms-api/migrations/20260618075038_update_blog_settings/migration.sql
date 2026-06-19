-- AlterTable
ALTER TABLE "blog_settings" ADD COLUMN     "categoriesLabel" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN     "moreBlogsButtonText" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN     "pickOfWeekLabel" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN     "searchPlaceholder" JSONB NOT NULL DEFAULT '{}';

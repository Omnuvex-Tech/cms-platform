-- AlterTable
ALTER TABLE "layihelerimiz_categories"
ADD COLUMN IF NOT EXISTS "banks" TEXT,
ADD COLUMN IF NOT EXISTS "infrastructure" TEXT,
ADD COLUMN IF NOT EXISTS "salesDepartment" TEXT;

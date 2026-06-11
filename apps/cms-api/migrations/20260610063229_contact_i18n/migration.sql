/*
  Warnings:

  - The `label` column on the `contact_budget_options` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `title` column on the `contact_settings` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `description` column on the `contact_settings` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `emailLabel` column on the `contact_settings` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `emailValue` column on the `contact_settings` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `phoneLabel` column on the `contact_settings` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `phoneValue` column on the `contact_settings` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `locationLabel` column on the `contact_settings` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `locationValue` column on the `contact_settings` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `hoursLabel` column on the `contact_settings` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `hoursValue` column on the `contact_settings` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `followUsLabel` column on the `contact_settings` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `formNameLabel` column on the `contact_settings` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `formNamePlaceholder` column on the `contact_settings` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `formEmailLabel` column on the `contact_settings` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `formEmailPlaceholder` column on the `contact_settings` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `formPhoneLabel` column on the `contact_settings` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `formPhonePlaceholder` column on the `contact_settings` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `formServiceLabel` column on the `contact_settings` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `formBudgetLabel` column on the `contact_settings` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `formTimelineLabel` column on the `contact_settings` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `formMessageLabel` column on the `contact_settings` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `formMessagePlaceholder` column on the `contact_settings` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `formSubmitLabel` column on the `contact_settings` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `label` column on the `contact_timeline_options` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `company` column on the `testimonials` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `quote` column on the `testimonials` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `name` column on the `testimonials` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `role` column on the `testimonials` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `title` column on the `testimonials_sections` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `description` column on the `testimonials_sections` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "contact_budget_options" DROP COLUMN "label",
ADD COLUMN     "label" JSONB NOT NULL DEFAULT '{}';

-- AlterTable
ALTER TABLE "contact_settings" ADD COLUMN     "formBudgetPlaceholder" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN     "formTimelinePlaceholder" JSONB NOT NULL DEFAULT '{}',
DROP COLUMN "title",
ADD COLUMN     "title" JSONB NOT NULL DEFAULT '{}',
DROP COLUMN "description",
ADD COLUMN     "description" JSONB NOT NULL DEFAULT '{}',
DROP COLUMN "emailLabel",
ADD COLUMN     "emailLabel" JSONB NOT NULL DEFAULT '{}',
DROP COLUMN "emailValue",
ADD COLUMN     "emailValue" JSONB NOT NULL DEFAULT '{}',
DROP COLUMN "phoneLabel",
ADD COLUMN     "phoneLabel" JSONB NOT NULL DEFAULT '{}',
DROP COLUMN "phoneValue",
ADD COLUMN     "phoneValue" JSONB NOT NULL DEFAULT '{}',
DROP COLUMN "locationLabel",
ADD COLUMN     "locationLabel" JSONB NOT NULL DEFAULT '{}',
DROP COLUMN "locationValue",
ADD COLUMN     "locationValue" JSONB NOT NULL DEFAULT '{}',
DROP COLUMN "hoursLabel",
ADD COLUMN     "hoursLabel" JSONB NOT NULL DEFAULT '{}',
DROP COLUMN "hoursValue",
ADD COLUMN     "hoursValue" JSONB NOT NULL DEFAULT '{}',
DROP COLUMN "followUsLabel",
ADD COLUMN     "followUsLabel" JSONB NOT NULL DEFAULT '{}',
DROP COLUMN "formNameLabel",
ADD COLUMN     "formNameLabel" JSONB NOT NULL DEFAULT '{}',
DROP COLUMN "formNamePlaceholder",
ADD COLUMN     "formNamePlaceholder" JSONB NOT NULL DEFAULT '{}',
DROP COLUMN "formEmailLabel",
ADD COLUMN     "formEmailLabel" JSONB NOT NULL DEFAULT '{}',
DROP COLUMN "formEmailPlaceholder",
ADD COLUMN     "formEmailPlaceholder" JSONB NOT NULL DEFAULT '{}',
DROP COLUMN "formPhoneLabel",
ADD COLUMN     "formPhoneLabel" JSONB NOT NULL DEFAULT '{}',
DROP COLUMN "formPhonePlaceholder",
ADD COLUMN     "formPhonePlaceholder" JSONB NOT NULL DEFAULT '{}',
DROP COLUMN "formServiceLabel",
ADD COLUMN     "formServiceLabel" JSONB NOT NULL DEFAULT '{}',
DROP COLUMN "formBudgetLabel",
ADD COLUMN     "formBudgetLabel" JSONB NOT NULL DEFAULT '{}',
DROP COLUMN "formTimelineLabel",
ADD COLUMN     "formTimelineLabel" JSONB NOT NULL DEFAULT '{}',
DROP COLUMN "formMessageLabel",
ADD COLUMN     "formMessageLabel" JSONB NOT NULL DEFAULT '{}',
DROP COLUMN "formMessagePlaceholder",
ADD COLUMN     "formMessagePlaceholder" JSONB NOT NULL DEFAULT '{}',
DROP COLUMN "formSubmitLabel",
ADD COLUMN     "formSubmitLabel" JSONB NOT NULL DEFAULT '{}';

-- AlterTable
ALTER TABLE "contact_timeline_options" DROP COLUMN "label",
ADD COLUMN     "label" JSONB NOT NULL DEFAULT '{}';

-- AlterTable
ALTER TABLE "testimonials" DROP COLUMN "company",
ADD COLUMN     "company" JSONB NOT NULL DEFAULT '{}',
DROP COLUMN "quote",
ADD COLUMN     "quote" JSONB NOT NULL DEFAULT '{}',
DROP COLUMN "name",
ADD COLUMN     "name" JSONB NOT NULL DEFAULT '{}',
DROP COLUMN "role",
ADD COLUMN     "role" JSONB NOT NULL DEFAULT '{}';

-- AlterTable
ALTER TABLE "testimonials_sections" DROP COLUMN "title",
ADD COLUMN     "title" JSONB NOT NULL DEFAULT '{}',
DROP COLUMN "description",
ADD COLUMN     "description" JSONB NOT NULL DEFAULT '{}';

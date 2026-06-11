/*
  Warnings:

  - The `title` column on the `Vacancy` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `tags` column on the `Vacancy` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `aboutRole` column on the `Vacancy` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `newLabel` column on the `Vacancy` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `requirements` column on the `Vacancy` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `responsible` column on the `Vacancy` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `skills` column on the `Vacancy` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `name` column on the `VacancyCategory` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `title` column on the `VacancyPageHeader` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `backLabel` column on the `vacancy_settings` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `applyTitle` column on the `vacancy_settings` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `aboutRoleLabel` column on the `vacancy_settings` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `skillsLabel` column on the `vacancy_settings` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `responsibleLabel` column on the `vacancy_settings` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `requirementsLabel` column on the `vacancy_settings` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `location` column on the `vacancy_settings` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `emailLabel` column on the `vacancy_settings` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `phoneLabel` column on the `vacancy_settings` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `locationLabel` column on the `vacancy_settings` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `formCvLabel` column on the `vacancy_settings` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `formCvPlaceholder` column on the `vacancy_settings` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `formEmailLabel` column on the `vacancy_settings` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `formEmailPlaceholder` column on the `vacancy_settings` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `formMessageLabel` column on the `vacancy_settings` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `formMessagePlaceholder` column on the `vacancy_settings` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `formNameLabel` column on the `vacancy_settings` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `formNamePlaceholder` column on the `vacancy_settings` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `formPhoneLabel` column on the `vacancy_settings` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `formPhonePlaceholder` column on the `vacancy_settings` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `formSubmitLabel` column on the `vacancy_settings` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Vacancy" DROP COLUMN "title",
ADD COLUMN     "title" JSONB NOT NULL DEFAULT '{}',
DROP COLUMN "tags",
ADD COLUMN     "tags" JSONB NOT NULL DEFAULT '[]',
DROP COLUMN "aboutRole",
ADD COLUMN     "aboutRole" JSONB,
DROP COLUMN "newLabel",
ADD COLUMN     "newLabel" JSONB,
DROP COLUMN "requirements",
ADD COLUMN     "requirements" JSONB NOT NULL DEFAULT '[]',
DROP COLUMN "responsible",
ADD COLUMN     "responsible" JSONB NOT NULL DEFAULT '[]',
DROP COLUMN "skills",
ADD COLUMN     "skills" JSONB NOT NULL DEFAULT '[]';

-- AlterTable
ALTER TABLE "VacancyCategory" DROP COLUMN "name",
ADD COLUMN     "name" JSONB NOT NULL DEFAULT '{}';

-- AlterTable
ALTER TABLE "VacancyPageHeader" DROP COLUMN "title",
ADD COLUMN     "title" JSONB NOT NULL DEFAULT '{}';

-- AlterTable
ALTER TABLE "vacancy_settings" DROP COLUMN "backLabel",
ADD COLUMN     "backLabel" JSONB NOT NULL DEFAULT '{}',
DROP COLUMN "applyTitle",
ADD COLUMN     "applyTitle" JSONB NOT NULL DEFAULT '{}',
DROP COLUMN "aboutRoleLabel",
ADD COLUMN     "aboutRoleLabel" JSONB NOT NULL DEFAULT '{}',
DROP COLUMN "skillsLabel",
ADD COLUMN     "skillsLabel" JSONB NOT NULL DEFAULT '{}',
DROP COLUMN "responsibleLabel",
ADD COLUMN     "responsibleLabel" JSONB NOT NULL DEFAULT '{}',
DROP COLUMN "requirementsLabel",
ADD COLUMN     "requirementsLabel" JSONB NOT NULL DEFAULT '{}',
DROP COLUMN "location",
ADD COLUMN     "location" JSONB NOT NULL DEFAULT '{}',
DROP COLUMN "emailLabel",
ADD COLUMN     "emailLabel" JSONB NOT NULL DEFAULT '{}',
DROP COLUMN "phoneLabel",
ADD COLUMN     "phoneLabel" JSONB NOT NULL DEFAULT '{}',
DROP COLUMN "locationLabel",
ADD COLUMN     "locationLabel" JSONB NOT NULL DEFAULT '{}',
DROP COLUMN "formCvLabel",
ADD COLUMN     "formCvLabel" JSONB NOT NULL DEFAULT '{}',
DROP COLUMN "formCvPlaceholder",
ADD COLUMN     "formCvPlaceholder" JSONB NOT NULL DEFAULT '{}',
DROP COLUMN "formEmailLabel",
ADD COLUMN     "formEmailLabel" JSONB NOT NULL DEFAULT '{}',
DROP COLUMN "formEmailPlaceholder",
ADD COLUMN     "formEmailPlaceholder" JSONB NOT NULL DEFAULT '{}',
DROP COLUMN "formMessageLabel",
ADD COLUMN     "formMessageLabel" JSONB NOT NULL DEFAULT '{}',
DROP COLUMN "formMessagePlaceholder",
ADD COLUMN     "formMessagePlaceholder" JSONB NOT NULL DEFAULT '{}',
DROP COLUMN "formNameLabel",
ADD COLUMN     "formNameLabel" JSONB NOT NULL DEFAULT '{}',
DROP COLUMN "formNamePlaceholder",
ADD COLUMN     "formNamePlaceholder" JSONB NOT NULL DEFAULT '{}',
DROP COLUMN "formPhoneLabel",
ADD COLUMN     "formPhoneLabel" JSONB NOT NULL DEFAULT '{}',
DROP COLUMN "formPhonePlaceholder",
ADD COLUMN     "formPhonePlaceholder" JSONB NOT NULL DEFAULT '{}',
DROP COLUMN "formSubmitLabel",
ADD COLUMN     "formSubmitLabel" JSONB NOT NULL DEFAULT '{}';

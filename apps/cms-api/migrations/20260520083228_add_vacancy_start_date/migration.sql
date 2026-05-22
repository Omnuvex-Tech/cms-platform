-- AlterTable
ALTER TABLE "Vacancy" ADD COLUMN     "isStartDateVisible" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "startDate" TIMESTAMP(3);

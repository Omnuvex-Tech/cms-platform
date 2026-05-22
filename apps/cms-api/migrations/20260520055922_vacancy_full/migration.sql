-- CreateEnum
CREATE TYPE "BulletType" AS ENUM ('BULLET', 'NUMBERED', 'DASH');

-- AlterTable
ALTER TABLE "Vacancy" ADD COLUMN     "aboutRole" TEXT,
ADD COLUMN     "closingDate" TIMESTAMP(3),
ADD COLUMN     "isDateVisible" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "newLabel" TEXT,
ADD COLUMN     "requirements" TEXT[],
ADD COLUMN     "requirementsType" "BulletType" NOT NULL DEFAULT 'BULLET',
ADD COLUMN     "responsible" TEXT[],
ADD COLUMN     "responsibleType" "BulletType" NOT NULL DEFAULT 'BULLET',
ADD COLUMN     "skills" TEXT[];

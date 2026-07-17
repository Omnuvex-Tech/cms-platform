-- AlterTable
ALTER TABLE "treva_info" DROP COLUMN "email",
DROP COLUMN "hotline",
DROP COLUMN "mission",
DROP COLUMN "phone",
DROP COLUMN "vision",
DROP COLUMN "website",
DROP COLUMN "whoWeAre",
DROP COLUMN "whyChoose";

-- CreateTable
CREATE TABLE "treva_info_sections" (
    "id" SERIAL NOT NULL,
    "trevaInfoId" INTEGER NOT NULL,
    "heading" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "treva_info_sections_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "treva_info_sections" ADD CONSTRAINT "treva_info_sections_trevaInfoId_fkey" FOREIGN KEY ("trevaInfoId") REFERENCES "treva_info"("id") ON DELETE CASCADE ON UPDATE CASCADE;


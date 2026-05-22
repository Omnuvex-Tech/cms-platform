-- CreateTable
CREATE TABLE "partner_sections" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "linkText" TEXT NOT NULL DEFAULT '',
    "linkHref" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "partner_sections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "partners" (
    "id" SERIAL NOT NULL,
    "image" TEXT NOT NULL,
    "altText" TEXT NOT NULL DEFAULT '',
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isHomepage" BOOLEAN NOT NULL DEFAULT false,
    "sectionId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "partners_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "partners" ADD CONSTRAINT "partners_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "partner_sections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

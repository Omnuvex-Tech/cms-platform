-- CreateTable
CREATE TABLE "VacancyFilterTag" (
    "id" SERIAL NOT NULL,
    "label" JSONB NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VacancyFilterTag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_VacancyFilterTags" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_VacancyFilterTags_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_VacancyFilterTags_B_index" ON "_VacancyFilterTags"("B");

-- AddForeignKey
ALTER TABLE "_VacancyFilterTags" ADD CONSTRAINT "_VacancyFilterTags_A_fkey" FOREIGN KEY ("A") REFERENCES "Vacancy"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_VacancyFilterTags" ADD CONSTRAINT "_VacancyFilterTags_B_fkey" FOREIGN KEY ("B") REFERENCES "VacancyFilterTag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

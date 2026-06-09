-- AlterTable
ALTER TABLE "vacancy_settings" ADD COLUMN     "formCvLabel" TEXT NOT NULL DEFAULT 'CV yüklə*',
ADD COLUMN     "formCvPlaceholder" TEXT NOT NULL DEFAULT 'pdf, png, jpg',
ADD COLUMN     "formEmailLabel" TEXT NOT NULL DEFAULT 'Email',
ADD COLUMN     "formEmailPlaceholder" TEXT NOT NULL DEFAULT 'Your email*',
ADD COLUMN     "formMessageLabel" TEXT NOT NULL DEFAULT 'Message',
ADD COLUMN     "formMessagePlaceholder" TEXT NOT NULL DEFAULT 'Your message',
ADD COLUMN     "formNameLabel" TEXT NOT NULL DEFAULT 'Name',
ADD COLUMN     "formNamePlaceholder" TEXT NOT NULL DEFAULT 'Your name*',
ADD COLUMN     "formPhoneLabel" TEXT NOT NULL DEFAULT 'Phone',
ADD COLUMN     "formPhonePlaceholder" TEXT NOT NULL DEFAULT 'Your phone*',
ADD COLUMN     "formSubmitLabel" TEXT NOT NULL DEFAULT 'Göndər';

-- CreateTable
CREATE TABLE "vacancy_submissions" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "message" TEXT,
    "cvUrl" TEXT NOT NULL,
    "vacancyId" INTEGER,
    "vacancyTitle" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vacancy_submissions_pkey" PRIMARY KEY ("id")
);

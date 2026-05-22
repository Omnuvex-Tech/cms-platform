-- CreateTable
CREATE TABLE "vacancy_settings" (
    "id" SERIAL NOT NULL,
    "backLabel" TEXT NOT NULL DEFAULT 'Vakansiya',
    "applyTitle" TEXT NOT NULL DEFAULT 'APPLY NOW',
    "aboutRoleLabel" TEXT NOT NULL DEFAULT 'About the Role',
    "skillsLabel" TEXT NOT NULL DEFAULT 'Skills',
    "responsibleLabel" TEXT NOT NULL DEFAULT 'Responsible',
    "requirementsLabel" TEXT NOT NULL DEFAULT 'Requirements',
    "email" TEXT NOT NULL DEFAULT '',
    "emailHref" TEXT NOT NULL DEFAULT '',
    "phone" TEXT NOT NULL DEFAULT '',
    "phoneHref" TEXT NOT NULL DEFAULT '',
    "location" TEXT NOT NULL DEFAULT '',
    "emailLabel" TEXT NOT NULL DEFAULT 'Email Adres',
    "phoneLabel" TEXT NOT NULL DEFAULT 'Phone',
    "locationLabel" TEXT NOT NULL DEFAULT 'Location',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vacancy_settings_pkey" PRIMARY KEY ("id")
);

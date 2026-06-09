-- CreateTable
CREATE TABLE "footer_settings" (
    "id" SERIAL NOT NULL,
    "logoImage" TEXT,
    "logoAlt" TEXT NOT NULL DEFAULT 'trenders',
    "description" TEXT NOT NULL DEFAULT '',
    "copyrightText" TEXT NOT NULL DEFAULT '© 2023 Trenders',
    "privacyText" TEXT NOT NULL DEFAULT 'Məxfilik siyasəti | Bütün hüquqlar qorunur',
    "locationLabel" TEXT NOT NULL DEFAULT 'Location',
    "phoneLabel" TEXT NOT NULL DEFAULT 'Phone',
    "emailLabel" TEXT NOT NULL DEFAULT 'Email Adress',
    "locationValue" TEXT NOT NULL DEFAULT '',
    "phoneValue" TEXT NOT NULL DEFAULT '',
    "emailValue" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "footer_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "footer_nav_links" (
    "id" SERIAL NOT NULL,
    "label" TEXT NOT NULL,
    "href" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "openInNewTab" BOOLEAN NOT NULL DEFAULT false,
    "footerId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "footer_nav_links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "footer_social_links" (
    "id" SERIAL NOT NULL,
    "icon" TEXT,
    "href" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "footerId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "footer_social_links_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "footer_nav_links" ADD CONSTRAINT "footer_nav_links_footerId_fkey" FOREIGN KEY ("footerId") REFERENCES "footer_settings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "footer_social_links" ADD CONSTRAINT "footer_social_links_footerId_fkey" FOREIGN KEY ("footerId") REFERENCES "footer_settings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

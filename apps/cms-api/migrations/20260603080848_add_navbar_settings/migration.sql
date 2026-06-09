-- CreateTable
CREATE TABLE "navbar_settings" (
    "id" SERIAL NOT NULL,
    "logoText" TEXT NOT NULL DEFAULT 'trenders',
    "logoImage" TEXT,
    "showSearch" BOOLEAN NOT NULL DEFAULT true,
    "showLang" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "navbar_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nav_links" (
    "id" SERIAL NOT NULL,
    "label" TEXT NOT NULL,
    "href" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "openInNewTab" BOOLEAN NOT NULL DEFAULT false,
    "navbarId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "nav_links_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "nav_links" ADD CONSTRAINT "nav_links_navbarId_fkey" FOREIGN KEY ("navbarId") REFERENCES "navbar_settings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

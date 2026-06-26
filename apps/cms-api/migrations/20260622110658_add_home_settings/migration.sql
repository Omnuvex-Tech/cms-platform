-- CreateTable
CREATE TABLE "home_settings" (
    "id" SERIAL NOT NULL,
    "projectsTitle" JSONB NOT NULL DEFAULT '{}',
    "projectsBtnText" JSONB NOT NULL DEFAULT '{}',
    "projectsBtnLink" TEXT NOT NULL DEFAULT '/portfolio',
    "projectsBtnNewTab" BOOLEAN NOT NULL DEFAULT false,
    "teamTitle" JSONB NOT NULL DEFAULT '{}',
    "teamBtnText" JSONB NOT NULL DEFAULT '{}',
    "teamBtnLink" TEXT NOT NULL DEFAULT '/team',
    "teamBtnNewTab" BOOLEAN NOT NULL DEFAULT false,
    "teamImage" TEXT,
    "blogsTitle" JSONB NOT NULL DEFAULT '{}',
    "blogsBtnText" JSONB NOT NULL DEFAULT '{}',
    "blogsBtnLink" TEXT NOT NULL DEFAULT '/blog',
    "blogsBtnNewTab" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "home_settings_pkey" PRIMARY KEY ("id")
);

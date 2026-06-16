-- CreateTable
CREATE TABLE "our_team_settings" (
    "id" SERIAL NOT NULL,
    "title" JSONB NOT NULL DEFAULT '{}',
    "description" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "our_team_settings_pkey" PRIMARY KEY ("id")
);

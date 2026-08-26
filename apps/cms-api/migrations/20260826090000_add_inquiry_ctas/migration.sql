-- CreateTable
CREATE TABLE "project_inquiries" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "projectSlug" TEXT,
    "projectName" TEXT,
    "message" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "project_inquiries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "off_plan_inquiries" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "projectSlug" TEXT,
    "projectName" TEXT,
    "tower" TEXT,
    "unitNumber" TEXT,
    "message" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "off_plan_inquiries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resale_inquiries" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "listingId" TEXT,
    "rooms" TEXT,
    "area" TEXT,
    "floor" TEXT,
    "price" TEXT,
    "agentName" TEXT,
    "message" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "resale_inquiries_pkey" PRIMARY KEY ("id")
);

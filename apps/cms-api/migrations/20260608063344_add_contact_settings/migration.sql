-- CreateTable
CREATE TABLE "contact_settings" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL DEFAULT 'Contact us',
    "description" TEXT NOT NULL DEFAULT '',
    "emailLabel" TEXT NOT NULL DEFAULT 'Email Adress',
    "emailValue" TEXT NOT NULL DEFAULT '',
    "phoneLabel" TEXT NOT NULL DEFAULT 'Phone',
    "phoneValue" TEXT NOT NULL DEFAULT '',
    "locationLabel" TEXT NOT NULL DEFAULT 'Location',
    "locationValue" TEXT NOT NULL DEFAULT '',
    "hoursLabel" TEXT NOT NULL DEFAULT 'Hours',
    "hoursValue" TEXT NOT NULL DEFAULT '',
    "followUsLabel" TEXT NOT NULL DEFAULT 'Follow Us',
    "tags" TEXT[],
    "formNameLabel" TEXT NOT NULL DEFAULT 'Name',
    "formNamePlaceholder" TEXT NOT NULL DEFAULT 'Your name*',
    "formEmailLabel" TEXT NOT NULL DEFAULT 'Email',
    "formEmailPlaceholder" TEXT NOT NULL DEFAULT 'Your email*',
    "formPhoneLabel" TEXT NOT NULL DEFAULT 'Phone',
    "formPhonePlaceholder" TEXT NOT NULL DEFAULT 'Your phone*',
    "formServiceLabel" TEXT NOT NULL DEFAULT 'Service',
    "formBudgetLabel" TEXT NOT NULL DEFAULT 'Budget',
    "formTimelineLabel" TEXT NOT NULL DEFAULT 'Project Timeline',
    "formMessageLabel" TEXT NOT NULL DEFAULT 'Message',
    "formMessagePlaceholder" TEXT NOT NULL DEFAULT 'Your message',
    "formSubmitLabel" TEXT NOT NULL DEFAULT 'Submit Inquiry',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contact_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contact_social_links" (
    "id" SERIAL NOT NULL,
    "icon" TEXT,
    "href" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "contactId" INTEGER NOT NULL,

    CONSTRAINT "contact_social_links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contact_budget_options" (
    "id" SERIAL NOT NULL,
    "label" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "contactId" INTEGER NOT NULL,

    CONSTRAINT "contact_budget_options_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contact_timeline_options" (
    "id" SERIAL NOT NULL,
    "label" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "contactId" INTEGER NOT NULL,

    CONSTRAINT "contact_timeline_options_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contact_submissions" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "service" TEXT NOT NULL,
    "budget" TEXT NOT NULL,
    "timeline" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contact_submissions_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "contact_social_links" ADD CONSTRAINT "contact_social_links_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "contact_settings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contact_budget_options" ADD CONSTRAINT "contact_budget_options_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "contact_settings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contact_timeline_options" ADD CONSTRAINT "contact_timeline_options_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "contact_settings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

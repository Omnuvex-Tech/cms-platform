-- Add optional LinkedIn profile URL for Pulse authors
ALTER TABLE "pulse_authors"
ADD COLUMN "linkedin" TEXT;

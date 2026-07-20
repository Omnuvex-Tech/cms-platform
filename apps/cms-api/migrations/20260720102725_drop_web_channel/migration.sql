-- AlterEnum
BEGIN;
CREATE TYPE "Channel_new" AS ENUM ('webchat', 'whatsapp', 'telegram', 'instagram', 'phone');
ALTER TABLE "public"."contact_requests" ALTER COLUMN "preferredChannel" DROP DEFAULT;
ALTER TABLE "conversations" ALTER COLUMN "channel" TYPE "Channel_new" USING ("channel"::text::"Channel_new");
ALTER TABLE "messages" ALTER COLUMN "channel" TYPE "Channel_new" USING ("channel"::text::"Channel_new");
ALTER TABLE "contact_requests" ALTER COLUMN "preferredChannel" TYPE "Channel_new" USING ("preferredChannel"::text::"Channel_new");
ALTER TABLE "leads" ALTER COLUMN "channel" TYPE "Channel_new" USING ("channel"::text::"Channel_new");
ALTER TYPE "Channel" RENAME TO "Channel_old";
ALTER TYPE "Channel_new" RENAME TO "Channel";
DROP TYPE "public"."Channel_old";
ALTER TABLE "contact_requests" ALTER COLUMN "preferredChannel" SET DEFAULT 'phone';
COMMIT;


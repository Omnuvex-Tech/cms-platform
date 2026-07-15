import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

/**
 * Ingestion contract for a contact request pushed by the treva_sales_bot.
 *
 * Mirrors the bot's `ContactRequestRecord` (see
 * treva_bot/contact_request_store.py) so the bot's outbox can POST its record
 * near-verbatim. Unknown extras (lead_snapshot, comment_status, …) are accepted
 * and ignored by the global ValidationPipe.
 */
export class IngestContactRequestDto {
  /** The bot's stable dedup key for the active request; our idempotency key. */
  @IsString() @IsNotEmpty() request_id!: string;

  @IsString() @IsNotEmpty() phone!: string;

  @IsOptional() @IsString() source_channel?: string;
  /** "phone" | "whatsapp" — how the customer wants to be reached. */
  @IsOptional() @IsString() preferred_channel?: string | null;

  /** ISO-8601 with offset, e.g. "2026-07-04T15:00:00+04:00". */
  @IsOptional() @IsString() availability_datetime?: string | null;
  @IsOptional() @IsString() availability_text?: string | null;
  @IsOptional() @IsBoolean() availability_flexible?: boolean;

  @IsOptional() @IsString() latest_user_message?: string | null;
  @IsOptional() @IsString() notes?: string | null;
  @IsOptional() @IsString() language?: string | null;
  @IsOptional() @IsString() thread_id?: string | null;
}

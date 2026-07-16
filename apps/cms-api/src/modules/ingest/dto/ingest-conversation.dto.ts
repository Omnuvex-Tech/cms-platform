import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { IngestLeadPreferencesDto } from './ingest-lead.dto';

/**
 * One transcript turn pushed by the bot. `role` is the bot's raw role string
 * (user | bot | assistant | human | system); the service coerces it into the
 * MessageRole enum. `ts` is an optional ISO-8601 timestamp for the message.
 */
export class IngestMessageDto {
  @IsString() @IsNotEmpty() role!: string;
  @IsString() content!: string;
  @IsOptional() @IsString() ts?: string | null;
}

/**
 * Ingestion contract for a conversation transcript pushed by the treva_sales_bot.
 *
 * Mirrors the bot's conversation record (see treva_bot/message_store.py) so the
 * bot's outbox can POST its record near-verbatim. Idempotent by `thread_id`
 * (already unique on the Conversation model); the full transcript is sent on
 * every push and the panel appends only messages it does not yet have. Unknown
 * extras are accepted and ignored by the global ValidationPipe.
 */
export class IngestConversationDto {
  /** Bot's per-conversation thread id; our idempotency key. */
  @IsString() @IsNotEmpty() thread_id!: string;

  /** web | whatsapp | telegram | instagram | phone (coerced, defaults to web). */
  @IsString() @IsNotEmpty() channel!: string;

  /** The channel-native sender id (wa_id / igsid / chat_id / dialog_id). */
  @IsOptional() @IsString() user_id?: string | null;
  @IsOptional() @IsString() phone?: string | null;
  /** Customer's full name once the bot has captured it; preferred over user_id
   *  as the display handle. */
  @IsOptional() @IsString() name?: string | null;
  @IsOptional() @IsString() language?: string | null;
  @IsOptional() @IsString() stage?: string | null;
  @IsOptional() @IsBoolean() escalated?: boolean;
  /** ISO-8601 timestamp of the latest turn. */
  @IsOptional() @IsString() last_message_at?: string | null;

  /** Same shape the bot sends on /ingest/leads, so budget renders identically. */
  @IsOptional()
  @ValidateNested()
  @Type(() => IngestLeadPreferencesDto)
  preferences?: IngestLeadPreferencesDto;

  /** The project the customer is currently focused on (lead.focus_project). */
  @IsOptional() @IsString() top_project?: string | null;
  /** Customer-facing apartment numbers the customer picked (e.g. "C-410"). */
  @IsOptional() @IsArray() @IsString({ each: true }) interested_unit_ids?: string[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => IngestMessageDto)
  messages!: IngestMessageDto[];
}

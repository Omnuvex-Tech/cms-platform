import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

/**
 * Ingestion contract for a lead pushed by the treva_sales_bot.
 *
 * The field names deliberately mirror the bot's `LeadRecord` (see
 * treva_bot/lead_store.py) so the bot's outbox can POST its persisted record
 * almost verbatim. Unknown extra fields (e.g. `bitrix`, `created_at`) are
 * accepted and ignored — the global ValidationPipe does not strip them.
 */
export class IngestLeadPreferencesDto {
  @IsOptional() budget_usd?: number | null;
  @IsOptional() @IsBoolean() budget_flexible?: boolean;
  @IsOptional() @IsString() budget_input?: string | null;
  // int | "studio" | null — accepted loosely, coerced to string on our side.
  @IsOptional() bedrooms?: number | string | null;
  @IsOptional() @IsString() location?: string | null;
}

export class IngestLeadDto {
  /** Bot's dedup key: the customer's phone reduced to digits. */
  @IsString() @IsNotEmpty() lead_id!: string;

  @IsString() channel!: string;

  @IsOptional() @IsString() lead_type?: string;
  @IsOptional() @IsString() phone?: string | null;
  @IsOptional() @IsString() thread_id?: string | null;
  @IsOptional() @IsBoolean() contactable?: boolean;
  @IsOptional() @IsString() name?: string | null;
  @IsOptional() @IsString() surname?: string | null;
  @IsOptional() @IsString() language?: string | null;

  @IsOptional()
  @ValidateNested()
  @Type(() => IngestLeadPreferencesDto)
  preferences?: IngestLeadPreferencesDto;

  @IsOptional() @IsArray() @IsString({ each: true }) interested_projects?: string[];
  @IsOptional() @IsArray() @IsString({ each: true }) interested_unit_ids?: string[];
  @IsOptional() @IsString() selected_payment_plan?: string | null;
  @IsOptional() @IsString() llm_notes?: string | null;

  @IsOptional() @IsBoolean() escalated?: boolean;
  @IsOptional() @IsBoolean() requested_human_followup?: boolean;
  @IsOptional() @IsBoolean() accepted?: boolean;
}

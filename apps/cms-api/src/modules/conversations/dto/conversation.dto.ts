import {
  IsBoolean,
  IsEnum,
  IsIn,
  IsInt,
  IsNumberString,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { Channel, ConversationStatus } from '@prisma/client';
import { ExportFormat } from '../conversation-export';

const EXPORT_FORMATS: ExportFormat[] = ['html', 'md', 'json'];

export class ReplyDto {
  @IsString()
  @MinLength(1)
  content: string;
}

export class SetStatusDto {
  @IsEnum(ConversationStatus)
  status: ConversationStatus;
}

export class AssignDto {
  @IsOptional()
  @IsInt()
  assignedToId?: number | null;
}

export class AddNoteDto {
  @IsString()
  @MinLength(1)
  body: string;
}

export class SetBotDto {
  @IsBoolean()
  active: boolean;
}

/** `GET /conversations/:id/export` — one thread. */
export class ExportThreadDto {
  @IsOptional()
  @IsIn(EXPORT_FORMATS)
  format?: ExportFormat;
}

/**
 * `GET /conversations/export` — the whole inbox.
 *
 * `since` / `until` bound the thread's *last activity* and accept either a plain
 * `YYYY-MM-DD` (expanded to cover that whole UTC day) or a full ISO timestamp.
 * The inbox filters are accepted too so "export what I am looking at" works.
 */
export class ExportThreadsDto {
  @IsOptional()
  @IsIn(EXPORT_FORMATS)
  format?: ExportFormat;

  @IsOptional()
  @IsString()
  since?: string;

  @IsOptional()
  @IsString()
  until?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(ConversationStatus)
  status?: ConversationStatus;

  @IsOptional()
  @IsEnum(Channel)
  channel?: Channel;

  @IsOptional()
  @IsNumberString()
  assignedToId?: string;
}

import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { ConversationStatus } from '@prisma/client';

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

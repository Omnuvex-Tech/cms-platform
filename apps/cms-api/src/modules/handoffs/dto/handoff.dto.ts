import { IsEnum, IsOptional, IsString } from 'class-validator';

export enum BotAction {
  pause = 'pause',
  resume = 'resume',
  return_to_bot = 'return_to_bot',
}

export class BotControlDto {
  @IsEnum(BotAction)
  action: BotAction;
}

export class HandoffNotesDto {
  @IsOptional()
  @IsString()
  notes?: string;
}

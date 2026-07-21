import { IsObject, IsOptional, IsString, ValidateIf } from 'class-validator';

type LocalizedTextInput = string | { az?: string; en?: string; ru?: string };

export class CreatePulseKeywordDto {
  @ValidateIf((_, value) => typeof value === 'string')
  @IsString()
  @ValidateIf((_, value) => typeof value === 'object' && value !== null)
  @IsObject()
  name: LocalizedTextInput;

  @IsString()
  @IsOptional()
  slug?: string;
}

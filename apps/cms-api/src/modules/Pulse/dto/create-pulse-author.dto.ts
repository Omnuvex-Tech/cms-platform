import { IsObject, IsOptional, IsString, ValidateIf } from 'class-validator';

type LocalizedTextInput = string | { az?: string; en?: string; ru?: string };

export class CreatePulseAuthorDto {
  @ValidateIf((_, value) => typeof value === 'string')
  @IsString()
  @ValidateIf((_, value) => typeof value === 'object' && value !== null)
  @IsObject()
  name: LocalizedTextInput;

  @IsString()
  @IsOptional()
  slug?: string;

  @IsOptional()
  @ValidateIf((_, value) => typeof value === 'string')
  @IsString()
  @ValidateIf((_, value) => typeof value === 'object' && value !== null)
  @IsObject()
  title?: LocalizedTextInput;

  @IsString()
  @IsOptional()
  linkedin?: string;

  @IsString()
  @IsOptional()
  avatar?: string;

  @IsOptional()
  @ValidateIf((_, value) => typeof value === 'string')
  @IsString()
  @ValidateIf((_, value) => typeof value === 'object' && value !== null)
  @IsObject()
  description?: LocalizedTextInput;
}

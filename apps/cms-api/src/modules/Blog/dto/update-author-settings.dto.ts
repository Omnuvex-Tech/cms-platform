import { IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class LocalizedStringDto {
  [key: string]: any;

  @IsOptional() @IsString() az?: string;
  @IsOptional() @IsString() en?: string;
  @IsOptional() @IsString() ru?: string;
}

export class UpdateAuthorSettingsDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => LocalizedStringDto)
  readArticleLabel?: LocalizedStringDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => LocalizedStringDto)
  recentBlogsTitle?: LocalizedStringDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => LocalizedStringDto)
  otherBlogsTitle?: LocalizedStringDto;
}
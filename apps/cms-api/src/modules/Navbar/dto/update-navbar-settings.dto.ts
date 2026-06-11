import { IsObject, IsString, IsOptional, IsBoolean } from 'class-validator';

export class UpdateNavbarSettingsDto {
  @IsOptional()
  @IsObject()
  logoImageAlt?: Record<string, string>;

  @IsOptional()
  @IsString()
  logoImage?: string;

  @IsOptional()
  @IsBoolean()
  showSearch?: boolean;

  @IsOptional()
  @IsBoolean()
  showLang?: boolean;
}
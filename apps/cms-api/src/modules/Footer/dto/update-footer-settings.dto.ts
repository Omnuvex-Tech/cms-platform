import { IsObject, IsString, IsOptional } from 'class-validator';

export class UpdateFooterSettingsDto {
  @IsOptional()
  @IsString()
  logoImage?: string;

  @IsOptional()
  @IsObject()
  logoAlt?: Record<string, string>;

  @IsOptional()
  @IsObject()
  description?: Record<string, string>;

  @IsOptional()
  @IsObject()
  copyrightText?: Record<string, string>;

  @IsOptional()
  @IsObject()
  privacyText?: Record<string, string>;

  @IsOptional()
  @IsObject()
  locationLabel?: Record<string, string>;


  @IsOptional()
  @IsString()
  locationMapUrl?: string;

  @IsOptional()
  @IsObject()
  phoneLabel?: Record<string, string>;

  @IsOptional()
  @IsObject()
  emailLabel?: Record<string, string>;

  @IsOptional()
  @IsObject()
  locationValue?: Record<string, string>;

  @IsOptional()
  @IsObject()
  phoneValue?: Record<string, string>;

  @IsOptional()
  @IsObject()
  emailValue?: Record<string, string>;
}
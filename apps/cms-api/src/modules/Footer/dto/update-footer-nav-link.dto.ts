import { IsObject, IsString, IsOptional, IsBoolean, IsInt } from 'class-validator';

export class UpdateFooterNavLinkDto {
  @IsOptional()
  @IsObject()
  label?: Record<string, string>;

  @IsOptional()
  @IsString()
  href?: string;

  @IsOptional()
  @IsInt()
  order?: number;

  @IsOptional()
  @IsBoolean()
  isVisible?: boolean;

  @IsOptional()
  @IsBoolean()
  openInNewTab?: boolean;
}
import { IsString, IsOptional } from 'class-validator';

export class UpdatePartnerSectionDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  linkText?: string;

  @IsOptional()
  @IsString()
  linkHref?: string;
}
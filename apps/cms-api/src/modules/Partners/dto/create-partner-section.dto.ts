import { IsString, IsOptional } from 'class-validator';

export class CreatePartnerSectionDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  linkText?: string;

  @IsOptional()
  @IsString()
  linkHref?: string;
}
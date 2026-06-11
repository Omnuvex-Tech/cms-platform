import { IsString, IsOptional, IsBoolean, IsInt } from 'class-validator';

export class UpdateContactSocialLinkDto {
  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @IsString()
  href?: string;

  @IsOptional()
  @IsInt()
  order?: number;

  @IsOptional()
  @IsBoolean()
  isVisible?: boolean;
}
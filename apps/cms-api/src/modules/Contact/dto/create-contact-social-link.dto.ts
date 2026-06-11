import { IsString, IsOptional, IsBoolean, IsInt } from 'class-validator';

export class CreateContactSocialLinkDto {
  @IsOptional()
  @IsString()
  icon?: string;

  @IsString()
  href: string;

  @IsOptional()
  @IsInt()
  order?: number;

  @IsOptional()
  @IsBoolean()
  isVisible?: boolean;
}
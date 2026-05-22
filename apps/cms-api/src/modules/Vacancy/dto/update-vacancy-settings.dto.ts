import { IsOptional, IsString } from 'class-validator';

export class UpdateVacancySettingsDto {
  @IsOptional()
  @IsString()
  backLabel?: string;

  @IsOptional()
  @IsString()
  applyTitle?: string;

  @IsOptional()
  @IsString()
  aboutRoleLabel?: string;

  @IsOptional()
  @IsString()
  skillsLabel?: string;

  @IsOptional()
  @IsString()
  responsibleLabel?: string;

  @IsOptional()
  @IsString()
  requirementsLabel?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  emailHref?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  phoneHref?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  emailLabel?: string;

  @IsOptional()
  @IsString()
  phoneLabel?: string;

  @IsOptional()
  @IsString()
  locationLabel?: string;
}
import { IsOptional, IsString, IsObject } from 'class-validator';

export class UpdateVacancySettingsDto {
  @IsOptional() @IsObject() detailButtonLabel?: Record<string, string>;
  @IsOptional() @IsObject() backLabel?: Record<string, string>;
  @IsOptional() @IsObject() dropdownLabel?: Record<string, string>;
  @IsOptional() @IsObject() applyTitle?: Record<string, string>;
  @IsOptional() @IsObject() aboutRoleLabel?: Record<string, string>;
  @IsOptional() @IsObject() skillsLabel?: Record<string, string>;
  @IsOptional() @IsObject() responsibleLabel?: Record<string, string>;
  @IsOptional() @IsObject() requirementsLabel?: Record<string, string>;
  @IsOptional() @IsString() email?: string;
  @IsOptional() @IsString() emailHref?: string;
  @IsOptional() @IsString() phone?: string;
  @IsOptional() @IsString() phoneHref?: string;
  @IsOptional() @IsObject() location?: Record<string, string>;
  @IsOptional() @IsObject() emailLabel?: Record<string, string>;
  @IsOptional() @IsObject() phoneLabel?: Record<string, string>;
  @IsOptional() @IsObject() locationLabel?: Record<string, string>;
  @IsOptional() @IsObject() formNameLabel?: Record<string, string>;
  @IsOptional() @IsObject() formNamePlaceholder?: Record<string, string>;
  @IsOptional() @IsObject() formEmailLabel?: Record<string, string>;
  @IsOptional() @IsObject() formEmailPlaceholder?: Record<string, string>;
  @IsOptional() @IsObject() formPhoneLabel?: Record<string, string>;
  @IsOptional() @IsObject() formPhonePlaceholder?: Record<string, string>;
  @IsOptional() @IsObject() formMessageLabel?: Record<string, string>;
  @IsOptional() @IsObject() formMessagePlaceholder?: Record<string, string>;
  @IsOptional() @IsObject() formCvLabel?: Record<string, string>;
  @IsOptional() @IsObject() formCvPlaceholder?: Record<string, string>;
  @IsOptional() @IsObject() formSubmitLabel?: Record<string, string>;
}
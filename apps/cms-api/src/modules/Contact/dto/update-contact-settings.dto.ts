import { IsObject, IsOptional, IsArray, IsString } from 'class-validator';

export class UpdateContactSettingsDto {
  @IsOptional() @IsObject() title?: Record<string, string>;
  @IsOptional() @IsObject() description?: Record<string, string>;
  @IsOptional() @IsString() image?: string;
  @IsOptional() @IsObject() imageAlt?: Record<string, string>;
  @IsOptional() @IsObject() emailLabel?: Record<string, string>;
  @IsOptional() @IsObject() emailValue?: Record<string, string>;
  @IsOptional() @IsObject() phoneLabel?: Record<string, string>;
  @IsOptional() @IsObject() phoneValue?: Record<string, string>;
  @IsOptional() @IsObject() locationLabel?: Record<string, string>;
  @IsOptional() @IsObject() locationValue?: Record<string, string>;
  @IsOptional() @IsObject() hoursLabel?: Record<string, string>;
  @IsOptional() @IsObject() hoursValue?: Record<string, string>;
  @IsOptional() @IsObject() followUsLabel?: Record<string, string>;
  @IsOptional()             tags?:          Record<string, string>[];
  @IsOptional() @IsObject() formNameLabel?: Record<string, string>;
  @IsOptional() @IsObject() formNamePlaceholder?: Record<string, string>;
  @IsOptional() @IsObject() formEmailLabel?: Record<string, string>;
  @IsOptional() @IsObject() formEmailPlaceholder?: Record<string, string>;
  @IsOptional() @IsObject() formPhoneLabel?: Record<string, string>;
  @IsOptional() @IsObject() formPhonePlaceholder?: Record<string, string>;
 @IsOptional() @IsObject() formServiceLabel?: Record<string, string>;
  @IsOptional() @IsObject() formServicePlaceholder?: Record<string, string>;
  @IsOptional() @IsObject() formBudgetLabel?: Record<string, string>;
  @IsOptional() @IsObject() formBudgetPlaceholder?: Record<string, string>;
  @IsOptional() @IsObject() formTimelineLabel?: Record<string, string>;
  @IsOptional() @IsObject() formTimelinePlaceholder?: Record<string, string>;
  @IsOptional() @IsObject() formMessageLabel?: Record<string, string>;
  @IsOptional() @IsObject() formMessagePlaceholder?: Record<string, string>;
  @IsOptional() @IsObject() formSubmitLabel?: Record<string, string>;
}
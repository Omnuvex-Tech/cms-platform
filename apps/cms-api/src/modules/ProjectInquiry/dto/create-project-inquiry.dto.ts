import { IsString, IsNotEmpty, IsOptional, IsEmail } from 'class-validator';

export class CreateProjectInquiryDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  /** Slug of the LayihelerimizCategory the inquiry was submitted from, if known. */
  @IsString()
  @IsOptional()
  projectSlug?: string;

  /** Human-readable project name, in case the frontend doesn't resolve a slug. */
  @IsString()
  @IsOptional()
  projectName?: string;

  @IsString()
  @IsOptional()
  message?: string;
}

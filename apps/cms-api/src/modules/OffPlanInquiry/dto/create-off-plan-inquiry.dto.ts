import { IsString, IsNotEmpty, IsOptional, IsEmail } from 'class-validator';

export class CreateOffPlanInquiryDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  /** Slug of the LayihelerimizCategory this off-plan unit belongs to, if known. */
  @IsString()
  @IsOptional()
  projectSlug?: string;

  /** Human-readable project name, in case the frontend doesn't resolve a slug. */
  @IsString()
  @IsOptional()
  projectName?: string;

  @IsString()
  @IsOptional()
  tower?: string;

  /** e.g. "D-1406" from a unit page like "Tower 4 · D-1406". */
  @IsString()
  @IsOptional()
  unitNumber?: string;

  @IsString()
  @IsOptional()
  message?: string;
}

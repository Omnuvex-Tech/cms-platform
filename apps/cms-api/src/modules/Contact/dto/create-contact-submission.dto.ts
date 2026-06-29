import { IsString, IsOptional } from 'class-validator';

export class CreateContactSubmissionDto {
  @IsString()
  name: string;

  @IsString()
  email: string;

  @IsString()
  phone: string;

  @IsString()
  @IsOptional()
  service?: string;

  @IsString()
  @IsOptional()
  budget?: string;

  @IsString()
  @IsOptional()
  timeline?: string;

  @IsString()
  message: string;
}
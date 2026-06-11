import { IsString } from 'class-validator';

export class CreateContactSubmissionDto {
  @IsString()
  name: string;

  @IsString()
  email: string;

  @IsString()
  phone: string;

  @IsString()
  service: string;

  @IsString()
  budget: string;

  @IsString()
  timeline: string;

  @IsString()
  message: string;
}
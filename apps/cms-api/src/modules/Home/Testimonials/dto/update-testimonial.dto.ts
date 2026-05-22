import { IsString, IsInt, IsOptional } from 'class-validator';

export class UpdateTestimonialDto {
  @IsOptional()
  @IsString()
  company?: string;

  @IsOptional()
  @IsString()
  quote?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  role?: string;

  @IsOptional()
  @IsString()
  image?: string;
}
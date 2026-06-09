import { IsString, IsInt, IsOptional, IsObject } from 'class-validator';

export class UpdateTestimonialDto {
  @IsOptional()
  @IsObject()
  company?: Record<string, string>;

  @IsOptional()
  @IsObject()
  quote?: Record<string, string>;

  @IsOptional()
  @IsObject()
  name?: Record<string, string>;

  @IsOptional()
  @IsObject()
  role?: Record<string, string>;

  @IsOptional()
  @IsString()
  image?: string;

  @IsOptional()
  @IsString()
  altText?: string;
}

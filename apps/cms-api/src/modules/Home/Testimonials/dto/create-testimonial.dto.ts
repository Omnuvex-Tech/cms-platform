import { IsString, IsInt, IsOptional } from 'class-validator';

export class CreateTestimonialDto {
  @IsString()
  company: string;

  @IsString()
  quote: string;

  @IsString()
  name: string;

  @IsString()
  role: string;

  @IsString()
  image: string;

  @IsOptional()
  @IsInt()
  order?: number;

  @IsInt()
  sectionId: number;

  @IsOptional()
  @IsString()
  altText?: string;
}
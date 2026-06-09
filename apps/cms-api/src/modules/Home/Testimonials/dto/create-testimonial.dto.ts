import { IsString, IsInt, IsOptional, IsObject } from 'class-validator';

export class CreateTestimonialDto {
  @IsObject()
  company: Record<string, string>;

  @IsObject()
  quote: Record<string, string>;

  @IsObject()
  name: Record<string, string>;

  @IsObject()
  role: Record<string, string>;

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

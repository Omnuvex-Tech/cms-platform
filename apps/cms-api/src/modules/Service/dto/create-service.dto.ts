import { IsString, IsObject, IsOptional, IsBoolean, IsInt, IsArray, Min } from 'class-validator';

export class CreateServiceDto {
  @IsString()
  number: string;

  @IsString()
  slug: string;

  @IsObject()
  badge: Record<string, string>;

  @IsObject()
  title: Record<string, string>;

  @IsObject()
  description: Record<string, string>;

  @IsString()
  image: string;

  @IsOptional()
  @IsObject()
  imageAlt?: Record<string, string>;

@IsOptional()
  @IsString()
  gif?: string;

  @IsOptional()
  @IsString()
  homeCoverImage?: string;
  @IsOptional()
  features?: any[];

  @IsOptional()
  @IsObject()
  portfolioButtonText?: Record<string, string>;

  @IsOptional()
  @IsString()
  portfolioButtonLink?: string;

  @IsOptional()
  @IsBoolean()
  portfolioButtonNewTab?: boolean;

  @IsOptional()
  @IsObject()
  detailButtonText?: Record<string, string>;

  @IsOptional()
  @IsString()
  detailButtonLink?: string;

  @IsOptional()
  @IsBoolean()
  detailButtonNewTab?: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;

  @IsOptional()
  sections?: any[];
}
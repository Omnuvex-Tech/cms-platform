import { IsString, IsOptional, IsBoolean, IsInt, IsArray, Min } from 'class-validator';

export class CreateServiceDto {
  @IsString()
  number: string;

  @IsString()
  slug: string;

  @IsString()
  badge: string;

  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsString()
  image: string;

  @IsOptional()
  @IsString()
  imageAlt?: string;

  @IsOptional()
  @IsString()
  gif?: string;

  @IsOptional()
  features?: any[];

  @IsOptional()
  @IsString()
  portfolioButtonText?: string;

  @IsOptional()
  @IsString()
  portfolioButtonLink?: string;

  @IsOptional()
  @IsBoolean()
  portfolioButtonNewTab?: boolean;

  @IsOptional()
  @IsString()
  detailButtonText?: string;

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
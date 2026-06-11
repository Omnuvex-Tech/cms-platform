import { IsObject, IsString, IsArray, IsOptional, IsBoolean, IsInt, Min } from 'class-validator';

export class UpdatePortfolioDto {
  @IsOptional()
  @IsObject()
  title?: Record<string, string>;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsString()
  coverImage?: string;

  @IsOptional()
  @IsObject()
  coverImageAlt?: Record<string, string>;

  @IsOptional()
  sections?: any[];

  @IsOptional()
  @IsBoolean()
  isVisible?: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;
}
import { IsString, IsObject, IsOptional, IsBoolean, IsInt, Min } from 'class-validator';

export class UpdateServiceDto {
  @IsOptional() @IsString() number?: string;
  @IsOptional() @IsString() slug?: string;
  @IsOptional() @IsObject() badge?: Record<string, string>;
  @IsOptional() @IsObject() title?: Record<string, string>;
  @IsOptional() @IsObject() description?: Record<string, string>;
  @IsOptional() @IsString() image?: string;
  @IsOptional() @IsObject() imageAlt?: Record<string, string>;
  @IsOptional() @IsString() gif?: string;
  @IsOptional() features?: any[];
  @IsOptional() @IsObject() portfolioButtonText?: Record<string, string>;
  @IsOptional() @IsString() portfolioButtonLink?: string;
  @IsOptional() @IsBoolean() portfolioButtonNewTab?: boolean;
  @IsOptional() @IsObject() detailButtonText?: Record<string, string>;
  @IsOptional() @IsString() detailButtonLink?: string;
  @IsOptional() @IsBoolean() detailButtonNewTab?: boolean;
  @IsOptional() @IsInt() @Min(0) order?: number;
  @IsOptional() @IsBoolean() isVisible?: boolean;
  @IsOptional() @IsObject() seoTitle?: Record<string, string>;
  @IsOptional() @IsObject() seoDescription?: Record<string, string>;
  @IsOptional() @IsObject() seoKeywords?: Record<string, string>;
  @IsOptional() sections?: any[];
}
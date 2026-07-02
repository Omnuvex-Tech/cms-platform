import { IsString, IsObject, IsBoolean, IsOptional, IsArray, IsNumber } from 'class-validator';

export class CreatePulseArticleDto {
  @IsString()
  slug?: string;

  @IsObject()
  title: Record<string, string>;

  @IsObject()
  category: Record<string, string>;

  @IsString()
  @IsOptional()
  date?: string;

  @IsString()
  @IsOptional()
  coverImage?: string;

  @IsObject()
  @IsOptional()
  excerpt?: Record<string, string>;

  @IsString()
  @IsOptional()
  authorId?: string;

  @IsArray()
  @IsOptional()
  blocks?: any[];

  @IsObject()
  @IsOptional()
  metaTitle?: Record<string, string>;

  @IsObject()
  @IsOptional()
  metaDescription?: Record<string, string>;

  @IsBoolean()
  @IsOptional()
  featured?: boolean;

  @IsBoolean()
  @IsOptional()
  published?: boolean;

  @IsArray()
  @IsOptional()
  headerPositions?: string[];

  @IsNumber()
  @IsOptional()
  headerOrder?: number;

  @IsArray()
  @IsOptional()
  keywordIds?: string[];

  @IsArray()
  @IsOptional()
  selectedArticleIds?: string[];

  @IsObject()
  @IsOptional()
  socialLinks?: Record<string, string>;
}

import { IsString, IsBoolean, IsOptional, IsArray, IsNumber } from 'class-validator';

export class CreatePulseArticleDto {
  @IsString()
  slug?: string;

  @IsString()
  title: string;

  @IsString()
  category: string;

  @IsString()
  @IsOptional()
  date?: string;

  @IsString()
  @IsOptional()
  coverImage?: string;

  @IsString()
  @IsOptional()
  excerpt?: string;

  @IsString()
  @IsOptional()
  authorId?: string;

  @IsArray()
  @IsOptional()
  blocks?: any[];

  @IsString()
  @IsOptional()
  metaTitle?: string;

  @IsString()
  @IsOptional()
  metaDescription?: string;

  @IsBoolean()
  @IsOptional()
  featured?: boolean;

  @IsBoolean()
  @IsOptional()
  published?: boolean;

  @IsString()
  @IsOptional()
  headerPosition?: string;

  @IsNumber()
  @IsOptional()
  headerOrder?: number;

  @IsArray()
  @IsOptional()
  keywordIds?: string[];
}

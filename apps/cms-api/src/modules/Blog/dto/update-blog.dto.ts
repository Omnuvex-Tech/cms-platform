import { IsObject, IsString, IsOptional, IsBoolean, IsArray, IsInt, IsDateString } from 'class-validator';

export class UpdateBlogDto {
  @IsOptional() @IsObject() title?: Record<string, string>;
  @IsOptional() @IsString() slug?: string;
  @IsOptional() @IsObject() badge?: Record<string, string>;
  @IsOptional() @IsObject() excerpt?: Record<string, string>;
  @IsOptional() @IsObject() coverImage?: Record<string, string>;
  @IsOptional() @IsObject() coverImageAlt?: Record<string, string>;
  @IsOptional() @IsDateString() publishedAt?: string;
  @IsOptional() @IsBoolean() isVisible?: boolean;
  @IsOptional() @IsBoolean() isFeaturedMain?: boolean;
  @IsOptional() @IsBoolean() isFeaturedSide?: boolean;
  @IsOptional() @IsBoolean() isPickOfWeek?: boolean;
  @IsOptional() @IsBoolean() isPreview?: boolean;
  @IsOptional() @IsBoolean() isGrid?: boolean;
  @IsOptional() @IsBoolean() isHomeVisible?: boolean;
  @IsOptional() sections?: any[];
  @IsOptional() @IsInt() authorId?: number;
  @IsOptional() @IsInt() categoryId?: number;
  @IsOptional() @IsInt() order?: number;
  @IsOptional() authorListPinnedAt?: string | null;
  @IsOptional() @IsObject() seoTitle?: Record<string, string>;
@IsOptional() @IsObject() seoDescription?: Record<string, string>;
@IsOptional() @IsObject() seoKeywords?: Record<string, string>;
}
import { IsObject, IsString, IsOptional, IsBoolean, IsArray, IsInt, IsDateString } from 'class-validator';

export class CreateBlogDto {
  @IsObject()
  title: Record<string, string>;

  @IsString()
  slug: string;

  @IsObject()
  badge: Record<string, string>;

  @IsObject()
  excerpt: Record<string, string>;

  @IsObject()
  coverImage: Record<string, string>;

  @IsOptional() @IsObject()
  coverImageAlt?: Record<string, string>;

  @IsOptional() @IsDateString()
  publishedAt?: string;

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
    @IsOptional()
  @IsString()
  gif?: string;
}
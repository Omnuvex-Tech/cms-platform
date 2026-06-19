import { IsObject, IsString, IsOptional, IsBoolean } from 'class-validator';

export class UpdateBlogSettingsDto {
  @IsOptional() @IsObject() pageTitle?: Record<string, string>;
  @IsOptional() @IsObject() buttonText?: Record<string, string>;
  @IsOptional() @IsString() buttonLink?: string;
  @IsOptional() @IsBoolean() buttonNewTab?: boolean;
  @IsOptional() @IsObject() quoteText?: Record<string, string>;
  @IsOptional() @IsObject() quoteImage?: Record<string, string>;
  @IsOptional() @IsObject() quoteImageAlt?: Record<string, string>;
  @IsOptional()
  @IsObject()
  searchPlaceholder?: Record<string, string>;

  @IsOptional()
  @IsObject()
  categoriesLabel?: Record<string, string>;

  @IsOptional()
  @IsObject()
  pickOfWeekLabel?: Record<string, string>;

  @IsOptional()
  @IsObject()
  moreBlogsButtonText?: Record<string, string>;
}
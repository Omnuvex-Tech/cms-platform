import { IsString, IsOptional, IsBoolean, IsArray, IsInt, IsDateString } from 'class-validator';

export class UpdateBlogDto {
  @IsOptional() @IsString() title?: string;
  @IsOptional() @IsString() slug?: string;
  @IsOptional() @IsString() badge?: string;
  @IsOptional() @IsString() excerpt?: string;
  @IsOptional() @IsString() coverImage?: string;
  @IsOptional() @IsString() coverImageAlt?: string;
  @IsOptional() @IsDateString() publishedAt?: string;
  @IsOptional() @IsBoolean() isVisible?: boolean;
  @IsOptional() @IsBoolean() isFeaturedMain?: boolean;
  @IsOptional() @IsBoolean() isFeaturedSide?: boolean;
  @IsOptional() @IsBoolean() isPickOfWeek?: boolean;
  @IsOptional() @IsBoolean() isPreview?: boolean;
  @IsOptional() @IsBoolean() isGrid?: boolean;
  @IsOptional() @IsArray() @IsString({ each: true }) hashtags?: string[];
  @IsOptional() sections?: any[];
  @IsOptional() @IsInt() authorId?: number;
  @IsOptional() @IsInt() categoryId?: number;
  @IsOptional()
  @IsBoolean()
  isHomeVisible?: boolean;
  @IsOptional() @IsInt() order?: number;
@IsOptional() authorListPinnedAt?: string | null;


}
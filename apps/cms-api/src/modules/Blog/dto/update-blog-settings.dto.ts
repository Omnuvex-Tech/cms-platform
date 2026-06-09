import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class UpdateBlogSettingsDto {
  @IsOptional() @IsString() pageTitle?: string;
  @IsOptional() @IsString() buttonText?: string;
  @IsOptional() @IsString() buttonLink?: string;
  @IsOptional() @IsString() quoteText?: string;
  @IsOptional() @IsString() quoteImage?: string;
  @IsOptional() @IsString() quoteImageAlt?: string;
    @IsOptional() @IsBoolean() buttonNewTab?: boolean;
}
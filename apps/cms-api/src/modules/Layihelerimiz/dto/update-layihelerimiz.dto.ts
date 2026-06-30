import { IsString, IsOptional, IsInt, IsBoolean } from 'class-validator';

export class UpdateLayihelerimizDto {
  @IsOptional()
  title?: any;

  @IsString()
  @IsOptional()
  slug?: string;

  @IsString()
  @IsOptional()
  image?: string;

  @IsString()
  @IsOptional()
  brandImage?: string;

  @IsOptional()
  description?: any;

  @IsOptional()
  brand?: any;

  @IsString()
  @IsOptional()
  brandTextColor?: string;

  @IsInt()
  @IsOptional()
  order?: number;

  @IsBoolean()
  @IsOptional()
  isVisible?: boolean;
}

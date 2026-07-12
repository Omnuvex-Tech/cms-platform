import { IsString, IsOptional, IsInt, IsBoolean, IsObject } from 'class-validator';

export class CreateLayihelerimizDto {
  @IsObject()
  title: any;

  @IsString()
  @IsOptional()
  slug?: string;

  @IsString()
  @IsOptional()
  image?: string;

  @IsString()
  @IsOptional()
  brandImage?: string;

  @IsObject()
  @IsOptional()
  description?: any;

  @IsObject()
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

  @IsString()
  @IsOptional()
  banks?: string;

  @IsString()
  @IsOptional()
  infrastructure?: string;

  @IsString()
  @IsOptional()
  salesDepartment?: string;
}

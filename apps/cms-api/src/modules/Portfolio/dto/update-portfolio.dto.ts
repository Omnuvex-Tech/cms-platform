import {
  IsObject, IsString, IsArray, IsOptional, IsBoolean, IsInt, Min, ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PortfolioServiceInputDto } from './portfolio-service-input.dto';

export class UpdatePortfolioDto {
  @IsOptional()
  @IsObject()
  title?: Record<string, string>;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PortfolioServiceInputDto)
  categories?: PortfolioServiceInputDto[];

  @IsOptional()
  @IsString()
  coverImage?: string;

  @IsOptional()
  @IsString()
  gif?: string;

  @IsOptional()
  @IsObject()
  coverImageAlt?: Record<string, string>;

  @IsOptional()
  sections?: any[];

  @IsOptional()
  @IsBoolean()
  isVisible?: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;

  @IsOptional()
  @IsObject()
  seoTitle?: Record<string, string>;

  @IsOptional()
  @IsObject()
  seoDescription?: Record<string, string>;

  @IsOptional()
  @IsObject()
  seoKeywords?: Record<string, string>;

  @IsOptional()
  schema?: Record<string, any> | null;
}
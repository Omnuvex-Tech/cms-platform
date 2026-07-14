import {
  IsObject, IsString, IsArray, IsOptional, IsInt, Min, ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PortfolioServiceInputDto } from './portfolio-service-input.dto';

export class CreatePortfolioDto {
  @IsObject()
  title: Record<string, string>;

  @IsString()
  slug: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PortfolioServiceInputDto)
  categories: PortfolioServiceInputDto[];

  @IsString()
  coverImage: string;

  @IsOptional()
  @IsString()
  gif?: string;

  @IsOptional()
  @IsObject()
  coverImageAlt?: Record<string, string>;

  @IsOptional()
  sections?: any[];

  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;
}
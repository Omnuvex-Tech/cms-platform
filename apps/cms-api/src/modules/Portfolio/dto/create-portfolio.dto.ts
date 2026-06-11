import { IsObject, IsString, IsArray, IsOptional, IsInt, Min } from 'class-validator';

export class CreatePortfolioDto {
  @IsObject()
  title: Record<string, string>;

  @IsString()
  slug: string;

  @IsArray()
  @IsString({ each: true })
  tags: string[];

  @IsString()
  coverImage: string;

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
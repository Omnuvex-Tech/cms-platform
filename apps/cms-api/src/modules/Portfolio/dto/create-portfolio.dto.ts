import { IsString, IsArray, IsOptional, IsBoolean, IsInt, Min } from 'class-validator';

export class CreatePortfolioDto {
  @IsString()
  title: string;

  @IsString()
  slug: string;

  @IsArray()
  @IsString({ each: true })
  tags: string[];

  @IsString()
  coverImage: string;

  @IsOptional()
  sections?: any[];

  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;

  @IsOptional()
    @IsString()
    coverImageAlt?: string;  
}
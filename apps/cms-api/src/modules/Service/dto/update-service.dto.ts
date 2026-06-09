import { IsString, IsOptional, IsBoolean, IsInt, Min } from 'class-validator';

export class UpdateServiceDto {
  @IsOptional() @IsString() number?: string;
  @IsOptional() @IsString() slug?: string;
  @IsOptional() @IsString() badge?: string;
  @IsOptional() @IsString() title?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() image?: string;
  @IsOptional() @IsString() imageAlt?: string;
  @IsOptional() @IsString() gif?: string;
  @IsOptional() features?: any[];
  @IsOptional() @IsString() portfolioButtonText?: string;
  @IsOptional() @IsString() portfolioButtonLink?: string;
  @IsOptional() @IsBoolean() portfolioButtonNewTab?: boolean;
  @IsOptional() @IsString() detailButtonText?: string;
  @IsOptional() @IsString() detailButtonLink?: string;
  @IsOptional() @IsBoolean() detailButtonNewTab?: boolean;
  @IsOptional() @IsInt() @Min(0) order?: number;
  @IsOptional() @IsBoolean() isVisible?: boolean;
  @IsOptional() sections?: any[];
}
import { IsObject, IsString, IsOptional } from 'class-validator';

export class UpdatePulseCategoryDto {
  @IsObject()
  @IsOptional()
  name?: Record<string, string>;

  @IsString()
  @IsOptional()
  slug?: string;
}

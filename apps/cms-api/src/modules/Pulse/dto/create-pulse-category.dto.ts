import { IsObject, IsString, IsOptional } from 'class-validator';

export class CreatePulseCategoryDto {
  @IsObject()
  name: Record<string, string>;

  @IsString()
  @IsOptional()
  slug?: string;
}

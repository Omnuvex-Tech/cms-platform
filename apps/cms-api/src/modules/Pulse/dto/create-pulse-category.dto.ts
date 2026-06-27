import { IsString, IsOptional } from 'class-validator';

export class CreatePulseCategoryDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  slug?: string;
}

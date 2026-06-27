import { IsString, IsOptional } from 'class-validator';

export class UpdatePulseCategoryDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  slug?: string;
}

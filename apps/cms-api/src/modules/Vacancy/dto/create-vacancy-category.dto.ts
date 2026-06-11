import { IsObject, IsOptional, IsInt, Min } from 'class-validator';

export class CreateVacancyCategoryDto {
  @IsObject()
  name: Record<string, string>;

  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;
}
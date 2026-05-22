import { IsString, IsInt, IsOptional, Min } from 'class-validator';

export class CreateVacancyCategoryDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;
}
import { IsArray } from 'class-validator';

export class ReorderVacancyFilterTagDto {
  @IsArray()
  items: { id: number; order: number }[];
}
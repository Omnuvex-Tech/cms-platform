import { IsObject } from 'class-validator';

export class CreateVacancyFilterTagDto {
  @IsObject()
  label: Record<string, string>;
}
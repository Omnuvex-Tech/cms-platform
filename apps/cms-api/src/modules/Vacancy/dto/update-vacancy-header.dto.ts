import { IsObject } from 'class-validator';

export class UpdateVacancyHeaderDto {
  @IsObject()
  title: Record<string, string>;
}
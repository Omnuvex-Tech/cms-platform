import { IsString } from 'class-validator';

export class UpdateVacancyHeaderDto {
  @IsString()
  title: string;
}
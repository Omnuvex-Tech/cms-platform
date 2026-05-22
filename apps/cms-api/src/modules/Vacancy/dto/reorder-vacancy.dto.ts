import { IsArray, IsInt, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class VacancyOrderItem {
  @IsInt()
  id: number;

  @IsInt()
  order: number;
}

export class ReorderVacancyDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VacancyOrderItem)
  items: VacancyOrderItem[];
}
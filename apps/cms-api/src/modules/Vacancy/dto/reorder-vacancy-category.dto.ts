import { IsArray, IsInt, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class CategoryOrderItem {
  @IsInt()
  id: number;

  @IsInt()
  order: number;
}

export class ReorderVacancyCategoryDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CategoryOrderItem)
  items: CategoryOrderItem[];
}
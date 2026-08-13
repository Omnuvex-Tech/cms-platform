import { IsArray, IsInt, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class ReorderItemDto {
  @IsInt()
  id: number;

  @IsInt()
  @Min(0)
  order: number;
}

export class ReorderPrivacyPolicySectionsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReorderItemDto)
  items: ReorderItemDto[];
}
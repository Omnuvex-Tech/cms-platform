import { IsArray, IsInt } from 'class-validator';

export class ReorderFaqDto {
  @IsArray()
  @IsInt({ each: true })
  ids: number[];
}
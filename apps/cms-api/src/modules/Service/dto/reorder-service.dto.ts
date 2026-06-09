import { IsArray, IsInt } from 'class-validator';

export class ReorderServiceDto {
  @IsArray()
  @IsInt({ each: true })
  ids: number[];
}
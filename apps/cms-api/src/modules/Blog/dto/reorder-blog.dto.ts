import { IsArray, IsInt } from 'class-validator';

export class ReorderBlogDto {
  @IsArray()
  @IsInt({ each: true })
  ids: number[];
}
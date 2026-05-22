import { IsArray, IsInt } from 'class-validator';

export class ReorderPortfolioDto {
  @IsArray()
  @IsInt({ each: true })
  ids: number[];
}
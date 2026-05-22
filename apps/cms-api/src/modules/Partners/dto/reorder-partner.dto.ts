import { IsArray, IsInt } from 'class-validator';

export class ReorderPartnerDto {
  @IsArray()
  @IsInt({ each: true })
  ids: number[];
}
import { IsObject, IsOptional, IsInt } from 'class-validator';

export class UpdateContactOptionDto {
  @IsOptional()
  @IsObject()
  label?: Record<string, string>;

  @IsOptional()
  @IsInt()
  order?: number;
}
import { IsObject, IsOptional, IsInt } from 'class-validator';

export class CreateContactOptionDto {
  @IsObject()
  label: Record<string, string>;

  @IsOptional()
  @IsInt()
  order?: number;
}
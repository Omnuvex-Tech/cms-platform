import { IsObject, IsOptional } from 'class-validator';

export class UpdateSectionDto {
  @IsOptional()
  @IsObject()
  title?: Record<string, string>;

  @IsOptional()
  @IsObject()
  description?: Record<string, string>;
}

import { IsObject, IsOptional, IsBoolean } from 'class-validator';

export class UpdateFaqDto {
  @IsOptional()
  @IsObject()
  question?: Record<string, string>;

  @IsOptional()
  @IsObject()
  answer?: Record<string, string>;

  @IsOptional()
  @IsBoolean()
  isVisible?: boolean;
}